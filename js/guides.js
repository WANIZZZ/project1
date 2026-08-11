/* ==========================================================================
   Renders the guide article grid on guides.html / en/guides.html.
   Only runs on pages that contain #guide-hub-grid.
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("guide-hub-grid");
  if (!grid) return;

  const IS_EN = document.documentElement.lang === "en";
  const READ_LABEL = IS_EN ? "Read guide" : "가이드 읽기";

  window.GUIDES_LIST.forEach((guide) => {
    const card = document.createElement("a");
    card.className = "guide-card";
    card.href = guide.page;
    card.innerHTML = `
      <div class="guide-card-icon" data-pixel-icon="${guide.icon}" aria-hidden="true"></div>
      <h3 class="guide-card-title">${IS_EN ? guide.en : guide.ko}</h3>
      <p class="guide-card-desc">${IS_EN ? guide.descEn : guide.descKo}</p>
      <span class="guide-card-play">${READ_LABEL} &rarr;</span>
    `;

    grid.appendChild(card);
  });
})();
