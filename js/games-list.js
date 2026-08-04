/* ==========================================================================
   Mini-game catalog for games.html / en/games.html.
   To add a new game: append an entry here (with a small pixel-art thumbnail)
   and create <slug>.html + en/<slug>.html following tetris.html's pattern.
   ========================================================================== */

(function () {
  "use strict";

  window.GAMES_LIST = [
    {
      slug: "tetris",
      ko: "테트리스",
      en: "Tetris",
      descKo: "떨어지는 블록을 쌓아 줄을 채우면 사라지는 클래식 퍼즐 게임입니다.",
      descEn: "A classic falling-block puzzle - fill a row to clear it.",
      page: "tetris.html",
      palette: { 1: "#33d6b0", 2: "#7c5cff", 3: "#ffd93d", 4: "#ff6b81" },
      grid: [
        "........",
        "..11....",
        "..11.22.",
        "....2233",
        "..4422.3",
        "..44....",
        "........",
        "........",
      ],
    },
  ];
})();
