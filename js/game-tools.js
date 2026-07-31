/* ==========================================================================
   Renders the decorative icons on game-tools.html / en/game-tools.html.
   These are original abstract icons (gear/cube/flow), not the real product
   logos of the tools being described - avoids any trademark concerns.
   ========================================================================== */

(function () {
  "use strict";

  const mounts = document.querySelectorAll("[data-pixel-icon]");
  if (!mounts.length) return;

  const ICONS = {
    gear: {
      palette: { 1: "#a9b4c7", 2: "#5c6a82" },
      grid: [
        "..1..1..",
        ".111111.",
        "11111111",
        "11.22.11",
        "11.22.11",
        "11111111",
        ".111111.",
        "..1..1..",
      ],
    },
    cube: {
      palette: { 1: "#7c5cff", 2: "#5b3fd6", 3: "#33d6b0" },
      grid: [
        "11111111",
        "11122333",
        "11122333",
        "11122333",
        "11122333",
        "11122333",
        "11122333",
        "11111111",
      ],
    },
    flow: {
      palette: { 1: "#33d6b0" },
      grid: [
        "11111...",
        "11111...",
        "...11...",
        "...11...",
        "...11111",
        "...11111",
        "........",
        "........",
      ],
    },
  };

  mounts.forEach((el) => {
    const icon = ICONS[el.getAttribute("data-pixel-icon")];
    if (!icon) return;
    el.innerHTML = window.PixelArt.renderPixelSvg(icon.grid, icon.palette, 10);
  });
})();
