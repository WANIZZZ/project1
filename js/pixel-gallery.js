/* ==========================================================================
   Renders the downloadable pixel icon grid on pixel-gallery.html /
   en/pixel-gallery.html. Only runs on pages that contain #pixel-gallery-grid.
   Handles name search and pagination (PAGE_SIZE items per page).
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("pixel-gallery-grid");
  if (!grid) return;

  const IS_EN = document.documentElement.lang === "en";
  const DOWNLOAD_LABEL = IS_EN ? "Download PNG" : "PNG 다운로드";
  const EMPTY_LABEL = IS_EN ? "No icons match your search." : "검색 결과가 없습니다.";
  const PNG_SIZE = 320;
  const PAGE_SIZE = 20;

  const searchInput = document.getElementById("pixel-gallery-search");
  const paginationEl = document.getElementById("pixel-gallery-pagination");
  const emptyEl = document.getElementById("pixel-gallery-empty");
  const ALL_ICONS = window.PIXEL_GALLERY_ICONS;

  let currentPage = 1;

  function matchesQuery(icon, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    return (
      icon.ko.toLowerCase().includes(q) ||
      icon.en.toLowerCase().includes(q) ||
      icon.name.toLowerCase().includes(q)
    );
  }

  function buildCard(icon) {
    const svgMarkup = window.PixelArt.renderPixelSvg(icon.grid, icon.palette, 10);

    const card = document.createElement("div");
    card.className = "pixel-card";
    card.innerHTML = `
      <div class="pixel-card-art">${svgMarkup}</div>
      <p class="pixel-card-name">${IS_EN ? icon.en : icon.ko}</p>
      <button class="btn btn-secondary pixel-download-btn" type="button">${DOWNLOAD_LABEL}</button>
    `;

    card.querySelector(".pixel-download-btn").addEventListener("click", () => {
      window.PixelArt.downloadSvgAsPng(svgMarkup, PNG_SIZE, `pixelcraft-${icon.name}.png`);
    });

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
        render();
      })
    );

    for (let p = 1; p <= totalPages; p++) {
      const btn = makeButton(String(p), false, () => {
        currentPage = p;
        render();
      });
      if (p === currentPage) btn.classList.add("active");
      paginationEl.appendChild(btn);
    }

    paginationEl.appendChild(
      makeButton(IS_EN ? "Next" : "다음", currentPage === totalPages, () => {
        currentPage += 1;
        render();
      })
    );
  }

  function render() {
    const query = searchInput ? searchInput.value : "";
    const filtered = ALL_ICONS.filter((icon) => matchesQuery(icon, query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    grid.innerHTML = "";
    const start = (currentPage - 1) * PAGE_SIZE;
    filtered.slice(start, start + PAGE_SIZE).forEach((icon) => grid.appendChild(buildCard(icon)));

    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (emptyEl) emptyEl.textContent = EMPTY_LABEL;

    renderPagination(totalPages);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      render();
    });
  }

  render();
})();
