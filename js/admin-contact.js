/* ==========================================================================
   Unlisted admin tool (admin.html) for reading contact form submissions.
   Requires the same ADMIN_KEY set as a Cloudflare Pages environment
   variable, sent as the X-Admin-Key header. Read-only - no admin action to
   take on a message besides reading it.
   ========================================================================== */

(function () {
  "use strict";

  const listEl = document.getElementById("admin-contact-list");
  if (!listEl) return;

  const API_URL = "/api/contact";
  const STORAGE_KEY = "pixelcraft-admin-key";

  const paginationEl = document.getElementById("admin-contact-pagination");
  const emptyEl = document.getElementById("admin-contact-empty");

  let currentPage = 1;

  function getAdminKey() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16).replace("T", " ");
  }

  function buildCard(entry) {
    const card = document.createElement("article");
    card.className = "request-card";
    card.innerHTML = `
      <div class="request-card-header">
        <div class="request-card-title-row">
          <h3>${entry.email ? escapeHtml(entry.email) : "(이메일 없음)"}</h3>
        </div>
        <span class="request-card-meta">${formatDate(entry.createdAt)}</span>
      </div>
      <p class="request-card-body">${escapeHtml(entry.message)}</p>
    `;
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
      const res = await fetch(`${API_URL}?page=${currentPage}`, {
        headers: { "X-Admin-Key": getAdminKey() },
      });

      if (res.status === 403) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        emptyEl.textContent = "관리자 키가 올바르지 않습니다.";
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      listEl.innerHTML = "";
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        emptyEl.hidden = false;
        emptyEl.textContent = "등록된 문의가 없습니다.";
      } else {
        emptyEl.hidden = true;
        items.forEach((entry) => listEl.appendChild(buildCard(entry)));
      }

      renderPagination(data.totalPages || 1);
    } catch (err) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      emptyEl.textContent = "목록을 불러오지 못했습니다.";
    }
  }

  // admin-image-requests.js re-runs load() on key save; this list reacts to
  // the same button so both lists refresh together on admin.html.
  document.getElementById("admin-key-save")?.addEventListener("click", load);

  load();
})();
