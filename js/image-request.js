/* ==========================================================================
   Image request board (list + submit form) for image-request.html /
   en/image-request.html. Talks to the /api/image-requests Pages Function.
   Only runs on pages that contain #image-request-list.
   ========================================================================== */

(function () {
  "use strict";

  const listEl = document.getElementById("image-request-list");
  if (!listEl) return;

  const IS_EN = document.documentElement.lang === "en";
  const API_URL = "/api/image-requests";

  const paginationEl = document.getElementById("image-request-pagination");
  const emptyEl = document.getElementById("image-request-empty");
  const form = document.getElementById("image-request-form");
  const statusEl = document.getElementById("image-request-status");

  let currentPage = 1;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  function buildCard(post) {
    const author = post.author || (IS_EN ? "Anonymous" : "익명");
    const resolvedBadge = post.resolved
      ? `<span class="request-resolved-badge" title="${IS_EN ? "Image created" : "이미지 생성 완료"}">&#10003;</span>`
      : "";
    const card = document.createElement("article");
    card.className = "request-card";
    card.innerHTML = `
      <div class="request-card-header">
        <div class="request-card-title-row">
          ${typeof post.seq === "number" ? `<span class="request-seq">#${post.seq}</span>` : ""}
          <h3>${escapeHtml(post.title)}</h3>
          ${resolvedBadge}
        </div>
        <span class="request-card-meta">${escapeHtml(author)} · ${formatDate(post.createdAt)}</span>
      </div>
      <p class="request-card-body">${escapeHtml(post.body)}</p>
    `;
    return card;
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    paginationEl.innerHTML = "";
    if (totalPages <= 1) return;

    const makeButton = (label, disabled, onClick) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-btn";
      btn.textContent = label;
      btn.disabled = disabled;
      btn.addEventListener("click", onClick);
      return btn;
    };

    paginationEl.appendChild(
      makeButton(IS_EN ? "Prev" : "이전", currentPage === 1, () => {
        currentPage -= 1;
        load();
      })
    );

    for (let p = 1; p <= totalPages; p++) {
      const btn = makeButton(String(p), false, () => {
        currentPage = p;
        load();
      });
      if (p === currentPage) btn.classList.add("active");
      paginationEl.appendChild(btn);
    }

    paginationEl.appendChild(
      makeButton(IS_EN ? "Next" : "다음", currentPage === totalPages, () => {
        currentPage += 1;
        load();
      })
    );
  }

  async function load() {
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}`);
      if (res.status === 429) {
        listEl.innerHTML = "";
        renderPagination(1);
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = IS_EN
            ? "This board has reached today's view limit. Please check back tomorrow."
            : "오늘 게시판 조회 한도에 도달했습니다. 내일 다시 확인해주세요.";
        }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      listEl.innerHTML = "";
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = IS_EN ? "No requests yet. Be the first to post one!" : "아직 등록된 요청이 없습니다. 첫 요청을 남겨보세요!";
        }
      } else {
        if (emptyEl) emptyEl.hidden = true;
        items.forEach((post) => listEl.appendChild(buildCard(post)));
      }

      renderPagination(data.totalPages || 1);
    } catch (err) {
      listEl.innerHTML = "";
      renderPagination(1);
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = IS_EN
          ? "Couldn't load requests right now. Please try again later."
          : "요청 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
      }
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("error");
      }

      const formData = new FormData(form);
      const payload = {
        title: formData.get("title"),
        body: formData.get("body"),
        author: formData.get("author"),
        website: formData.get("website"),
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 429) {
          if (statusEl) {
            statusEl.textContent = IS_EN
              ? "Today's submission limit has been reached. Please try again tomorrow."
              : "오늘 등록 가능한 요청 수를 초과했습니다. 내일 다시 시도해주세요.";
            statusEl.classList.add("error");
          }
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        form.reset();
        currentPage = 1;
        if (statusEl) statusEl.textContent = IS_EN ? "Your request has been posted." : "요청이 등록되었습니다.";
        await load();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = IS_EN
            ? "Couldn't submit your request. Please try again."
            : "요청 등록에 실패했습니다. 다시 시도해주세요.";
          statusEl.classList.add("error");
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  load();
})();
