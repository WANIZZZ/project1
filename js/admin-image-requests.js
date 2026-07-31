/* ==========================================================================
   Unlisted admin tool (admin.html) for toggling the "resolved" (image
   created) status on image requests. Requires the same ADMIN_KEY set as a
   Cloudflare Pages environment variable, sent as the X-Admin-Key header.
   Never linked from site navigation or the sitemap.
   ========================================================================== */

(function () {
  "use strict";

  const listEl = document.getElementById("admin-request-list");
  if (!listEl) return;

  const API_URL = "/api/image-requests";
  const STORAGE_KEY = "pixelcraft-admin-key";

  const keyInput = document.getElementById("admin-key-input");
  const saveBtn = document.getElementById("admin-key-save");
  const keyStatus = document.getElementById("admin-key-status");
  const paginationEl = document.getElementById("admin-request-pagination");
  const emptyEl = document.getElementById("admin-request-empty");

  let currentPage = 1;

  function getAdminKey() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  keyInput.value = getAdminKey();

  saveBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, keyInput.value.trim());
    keyStatus.classList.remove("error");
    keyStatus.textContent = "저장되었습니다.";
    load();
  });

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
    const author = post.author || "익명";
    const card = document.createElement("article");
    card.className = "request-card";
    card.innerHTML = `
      <div class="request-card-header">
        <div class="request-card-title-row">
          <span class="request-seq">${typeof post.seq === "number" ? "#" + post.seq : ""}</span>
          <h3>${escapeHtml(post.title)}</h3>
          ${post.resolved ? '<span class="request-resolved-badge">&#10003;</span>' : ""}
        </div>
        <span class="request-card-meta">${escapeHtml(author)} · ${formatDate(post.createdAt)}</span>
      </div>
      <p class="request-card-body">${escapeHtml(post.body)}</p>
      <button class="btn btn-secondary admin-toggle-btn" type="button">
        ${post.resolved ? "완료 취소" : "완료 표시"}
      </button>
    `;

    card.querySelector(".admin-toggle-btn").addEventListener("click", async () => {
      try {
        const res = await fetch(API_URL, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-Admin-Key": getAdminKey() },
          body: JSON.stringify({ id: post.id, resolved: !post.resolved }),
        });

        if (res.status === 403) {
          keyStatus.textContent = "관리자 키가 올바르지 않습니다.";
          keyStatus.classList.add("error");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        keyStatus.textContent = "";
        keyStatus.classList.remove("error");
        await load();
      } catch (err) {
        keyStatus.textContent = "처리 중 오류가 발생했습니다.";
        keyStatus.classList.add("error");
      }
    });

    return card;
  }

  function renderPagination(totalPages) {
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
      makeButton("이전", currentPage === 1, () => {
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
      makeButton("다음", currentPage === totalPages, () => {
        currentPage += 1;
        load();
      })
    );
  }

  async function load() {
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      listEl.innerHTML = "";
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        emptyEl.hidden = false;
        emptyEl.textContent = "등록된 요청이 없습니다.";
      } else {
        emptyEl.hidden = true;
        items.forEach((post) => listEl.appendChild(buildCard(post)));
      }

      renderPagination(data.totalPages || 1);
    } catch (err) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      emptyEl.textContent = "목록을 불러오지 못했습니다.";
    }
  }

  load();
})();
