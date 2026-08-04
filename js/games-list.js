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
    {
      slug: "breakout",
      ko: "벽돌깨기",
      en: "Brick Breaker",
      descKo: "패들로 공을 튕겨 벽돌을 모두 깨는 클래식 아케이드 게임입니다.",
      descEn: "Bounce the ball with your paddle to smash every brick.",
      page: "breakout.html",
      palette: { 1: "#e35b5b", 2: "#ffd93d", 3: "#33d6b0", 4: "#f4f1ff" },
      grid: [
        "11111111",
        "22222222",
        "33333333",
        "........",
        "..444...",
        "........",
        "...4....",
        "........",
      ],
    },
    {
      slug: "memory",
      ko: "카드 짝 맞추기",
      en: "Memory Match",
      descKo: "같은 그림의 카드 두 장을 찾아 짝을 맞추는 메모리 게임입니다.",
      descEn: "Flip cards two at a time to find every matching pair.",
      page: "memory.html",
      palette: { 1: "#7c5cff", 2: "#33d6b0", 3: "#ffd93d" },
      grid: [
        "11.11...",
        "11.11...",
        "........",
        "22.33...",
        "22.33...",
        "........",
        "........",
        "........",
      ],
    },
  ];
})();
