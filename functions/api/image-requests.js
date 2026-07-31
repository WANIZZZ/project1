/* ==========================================================================
   Cloudflare Pages Function backing the image request board.
   Route: /api/image-requests (file-based routing from this path).
   Requires a KV namespace bound as IMAGE_REQUESTS in the Pages project
   settings (Settings > Functions > KV namespace bindings), and an
   ADMIN_KEY environment variable (Settings > Environment variables) to
   authorize the resolve/unresolve action used by admin.html.

   Storage model: the entire post list + counters live in a single KV key as
   one JSON object (posts newest first). This site's traffic is small enough
   that this is simpler and safer than paging through KV's own list() API,
   at the cost of a rare lost update if two people write at the exact same
   moment - an acceptable tradeoff for a low-volume request board.

   Daily usage caps (reads/writes are handled differently on purpose):
   - Writes (POST) are capped at DAILY_WRITE_LIMIT, tracked exactly inside
     the same KV read-modify-write a post already needs, so enforcing the
     cap costs zero extra KV operations.
   - Reads (GET) are capped at DAILY_READ_LIMIT using an in-memory counter
     scoped to this Function instance. An exact global counter would need a
     KV write on every single read, which would burn through the (much
     smaller) daily write budget almost immediately - i.e. protecting reads
     that way would itself cause the write cap to trip constantly. The
     in-memory counter is a best-effort per-instance limit instead: it costs
     nothing, but a burst of traffic landing on several different edge
     instances at once could each get their own allowance before this site's
     total requests actually reach DAILY_READ_LIMIT. That tradeoff is fine at
     this site's scale - it's a safety net against a single runaway loop or
     bot, not a hard global SLA.

   Each post gets a permanent sequential "seq" number assigned at creation
   (from a running nextSeq counter), so board numbering (1, 2, 3, ...) never
   shifts even after older posts are trimmed once MAX_STORED is exceeded.
   ========================================================================== */

const KV_KEY = "image-requests";
const PAGE_SIZE = 10;
const MAX_STORED = 500;
const MAX_TITLE_LEN = 60;
const MAX_BODY_LEN = 500;
const MAX_AUTHOR_LEN = 30;

const DAILY_READ_LIMIT = 80000;
const DAILY_WRITE_LIMIT = 500;
const WRITE_COUNT_HISTORY_DAYS = 3;

let readCounterDate = null;
let readCounterCount = 0;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function withinReadLimit() {
  const today = todayKey();
  if (readCounterDate !== today) {
    readCounterDate = today;
    readCounterCount = 0;
  }
  readCounterCount += 1;
  return readCounterCount <= DAILY_READ_LIMIT;
}

function normalizeStore(raw) {
  if (!raw) return { posts: [], writeCounts: {}, nextSeq: 1 };
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Back-compat with the earlier plain-array storage format.
      return { posts: parsed, writeCounts: {}, nextSeq: parsed.length + 1 };
    }
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      writeCounts: parsed.writeCounts && typeof parsed.writeCounts === "object" ? parsed.writeCounts : {},
      nextSeq: typeof parsed.nextSeq === "number" ? parsed.nextSeq : 1,
    };
  } catch {
    return { posts: [], writeCounts: {}, nextSeq: 1 };
  }
}

function pruneWriteCounts(writeCounts, today) {
  const kept = {};
  Object.keys(writeCounts)
    .sort()
    .slice(-WRITE_COUNT_HISTORY_DAYS)
    .forEach((date) => {
      kept[date] = writeCounts[date];
    });
  kept[today] = kept[today] || 0;
  return kept;
}

function isAuthorizedAdmin(context) {
  const adminKey = context.env.ADMIN_KEY;
  return Boolean(adminKey) && context.request.headers.get("x-admin-key") === adminKey;
}

export async function onRequestGet(context) {
  if (!withinReadLimit()) {
    return new Response("Daily read limit reached. Please try again tomorrow.", { status: 429 });
  }

  const kv = context.env.IMAGE_REQUESTS;
  const url = new URL(context.request.url);
  const requestedPage = parseInt(url.searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { posts } = normalizeStore(await kv.get(KV_KEY));
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const items = posts.slice(start, start + PAGE_SIZE);

  return Response.json({ items, page: safePage, totalPages, total: posts.length });
}

export async function onRequestPost(context) {
  const kv = context.env.IMAGE_REQUESTS;
  const today = todayKey();

  const store = normalizeStore(await kv.get(KV_KEY));
  const writeCounts = pruneWriteCounts(store.writeCounts, today);

  if (writeCounts[today] >= DAILY_WRITE_LIMIT) {
    return new Response("Daily submission limit reached. Please try again tomorrow.", { status: 429 });
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn to look for a different signal.
  if ((payload.website || "").trim()) {
    return Response.json({ ok: true });
  }

  const title = (payload.title || "").trim().slice(0, MAX_TITLE_LEN);
  const body = (payload.body || "").trim().slice(0, MAX_BODY_LEN);
  const author = (payload.author || "").trim().slice(0, MAX_AUTHOR_LEN);

  if (!title || !body) {
    return new Response("Title and body are required", { status: 400 });
  }

  const post = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    seq: store.nextSeq,
    title,
    body,
    author: author || null,
    createdAt: new Date().toISOString(),
    resolved: false,
  };

  store.posts.unshift(post);
  if (store.posts.length > MAX_STORED) store.posts.length = MAX_STORED;
  writeCounts[today] += 1;

  await kv.put(
    KV_KEY,
    JSON.stringify({ posts: store.posts, writeCounts, nextSeq: store.nextSeq + 1 })
  );

  return Response.json({ ok: true, post });
}

// Admin-only: mark a request as resolved (image created) or revert it.
// Requires the X-Admin-Key header to match the ADMIN_KEY env var - used by
// admin.html, never exposed to regular visitors of the board.
export async function onRequestPatch(context) {
  if (!isAuthorizedAdmin(context)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const kv = context.env.IMAGE_REQUESTS;

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const id = payload.id;
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const store = normalizeStore(await kv.get(KV_KEY));
  const post = store.posts.find((p) => p.id === id);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  post.resolved = Boolean(payload.resolved);

  await kv.put(
    KV_KEY,
    JSON.stringify({ posts: store.posts, writeCounts: store.writeCounts, nextSeq: store.nextSeq })
  );

  return Response.json({ ok: true, post });
}
