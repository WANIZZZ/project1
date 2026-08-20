/* ==========================================================================
   Cloudflare Pages Function backing the contact form on about.html /
   en/about.html. Route: /api/contact (file-based routing from this path).
   Requires a KV namespace bound as CONTACT_MESSAGES in the Pages project
   settings (Settings > Functions > KV namespace bindings) - separate from
   IMAGE_REQUESTS since these messages are private (admin-only), never shown
   on the public site. Reuses the same ADMIN_KEY env var as admin.html.

   Storage model and daily caps mirror functions/api/image-requests.js - see
   that file for the full rationale. Kept intentionally smaller here since
   contact volume is expected to be much lower than the image request board.
   ========================================================================== */

const KV_KEY = "contact-messages";
const PAGE_SIZE = 10;
const MAX_STORED = 200;
const MAX_MESSAGE_LEN = 1000;
const MAX_EMAIL_LEN = 100;

const DAILY_WRITE_LIMIT = 50;
const WRITE_COUNT_HISTORY_DAYS = 3;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeStore(raw) {
  if (!raw) return { messages: [], writeCounts: {} };
  try {
    const parsed = JSON.parse(raw);
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      writeCounts: parsed.writeCounts && typeof parsed.writeCounts === "object" ? parsed.writeCounts : {},
    };
  } catch {
    return { messages: [], writeCounts: {} };
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

// Admin-only: list submitted contact messages for admin.html. Never exposed
// to regular visitors - unlike /api/image-requests, this has no public GET.
export async function onRequestGet(context) {
  if (!isAuthorizedAdmin(context)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const kv = context.env.CONTACT_MESSAGES;
  const url = new URL(context.request.url);
  const requestedPage = parseInt(url.searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { messages } = normalizeStore(await kv.get(KV_KEY));
  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const items = messages.slice(start, start + PAGE_SIZE);

  return Response.json({ items, page: safePage, totalPages, total: messages.length });
}

export async function onRequestPost(context) {
  const kv = context.env.CONTACT_MESSAGES;
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

  const message = (payload.message || "").trim().slice(0, MAX_MESSAGE_LEN);
  const email = (payload.email || "").trim().slice(0, MAX_EMAIL_LEN);

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    email: email || null,
    createdAt: new Date().toISOString(),
  };

  store.messages.unshift(entry);
  if (store.messages.length > MAX_STORED) store.messages.length = MAX_STORED;
  writeCounts[today] += 1;

  await kv.put(KV_KEY, JSON.stringify({ messages: store.messages, writeCounts }));

  return Response.json({ ok: true });
}
