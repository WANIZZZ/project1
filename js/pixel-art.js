/* ==========================================================================
   Shared pixel-art rendering helpers.
   Used by background-characters.js and the pixel gallery / game-tools pages
   so the grid-to-SVG logic and PNG export logic live in exactly one place.
   ========================================================================== */

(function () {
  "use strict";

  function renderPixelSvg(grid, palette, cell) {
    cell = cell || 10;
    const rows = grid.length;
    const cols = grid[0].length;
    let rects = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const key = grid[y][x];
        if (key === "." || !palette[key]) continue;
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${palette[key]}"/>`;
      }
    }
    const w = cols * cell;
    const h = rows * cell;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
  }

  function downloadSvgAsPng(svgMarkup, outputSize, fileName) {
    const dataUrl =
      "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgMarkup)));

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, outputSize, outputSize);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    };
    img.src = dataUrl;
  }

  window.PixelArt = { renderPixelSvg, downloadSvgAsPng };
})();
