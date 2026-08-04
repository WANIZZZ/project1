/* ==========================================================================
   Renders the game thumbnail grid on games.html / en/games.html.
   Only runs on pages that contain #game-hub-grid.
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("game-hub-grid");
  if (!grid) return;

  const IS_EN = document.documentElement.lang === "en";
  const PLAY_LABEL = IS_EN ? "Play" : "플레이하기";

  window.GAMES_LIST.forEach((game) => {
    const svgMarkup = window.PixelArt.renderPixelSvg(game.grid, game.palette, 10);

    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.page;
    card.innerHTML = `
      <div class="game-card-thumb">${svgMarkup}</div>
      <h3 class="game-card-title">${IS_EN ? game.en : game.ko}</h3>
      <p class="game-card-desc">${IS_EN ? game.descEn : game.descKo}</p>
      <span class="game-card-play">${PLAY_LABEL} &rarr;</span>
    `;

    grid.appendChild(card);
  });
})();
