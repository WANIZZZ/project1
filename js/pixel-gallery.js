/* ==========================================================================
   Renders the downloadable pixel icon grid on pixel-gallery.html /
   en/pixel-gallery.html. Only runs on pages that contain #pixel-gallery-grid.
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("pixel-gallery-grid");
  if (!grid) return;

  const IS_EN = document.documentElement.lang === "en";
  const DOWNLOAD_LABEL = IS_EN ? "Download PNG" : "PNG 다운로드";
  const PNG_SIZE = 320;

  window.PIXEL_GALLERY_ICONS.forEach((icon) => {
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

    grid.appendChild(card);
  });
})();
