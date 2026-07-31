/* ==========================================================================
   Original pixel-art style decorative characters.
   Every character here is drawn from scratch as a simple color grid (no
   traced or downloaded artwork), so there is no license/copyright risk.
   To add a new character: append a { name, grid, palette } entry below
   (10x10 grid of single-character keys, "." = transparent).
   ========================================================================== */

(function () {
  "use strict";

  const CHARACTERS = [
    {
      name: "slime",
      palette: { 1: "#4fd67a", 3: "#eafff0", 4: "#1d3a2a" },
      grid: [
        "..111111..",
        ".11111111.",
        "1111111111",
        "1131111311",
        "1141111411",
        "1111111111",
        "1111111111",
        ".11111111.",
        "..111111..",
        "....11....",
      ],
    },
    {
      name: "robot",
      palette: { 1: "#a9b4c7", 2: "#5c6a82", 3: "#41e0ff" },
      grid: [
        "..222222..",
        "2111111112",
        "2131111312",
        "2111111112",
        "2122222212",
        "2211111122",
        "..222222..",
        "...2..2...",
        "...2..2...",
        "...2..2...",
      ],
    },
    {
      name: "knight",
      palette: { 1: "#d7dbe4", 2: "#8890a0", 3: "#e35b5b", 4: "#2b2f38" },
      grid: [
        "...3333...",
        "..122221..",
        "1211111121",
        "1214444121",
        "1211111121",
        ".12111121.",
        "..122221..",
        "...2..2...",
        "...1..1...",
        "..........",
      ],
    },
    {
      name: "wizard",
      palette: { 1: "#8b6bff", 2: "#5b3fd6", 3: "#f2c9a1", 4: "#2b2233" },
      grid: [
        "....1.....",
        "...111....",
        "..11111...",
        ".1111111..",
        "2333333332",
        "2343333432",
        ".1111111..",
        "1111111111",
        ".11111111.",
        "..111111..",
      ],
    },
    {
      name: "ghost",
      palette: { 1: "#f4f1ff", 4: "#372f52" },
      grid: [
        "..111111..",
        ".11111111.",
        "1111111111",
        "1141111411",
        "1111111111",
        "1111111111",
        "1111111111",
        "1111111111",
        "1.11.11.11",
        "1.1..1.1.1",
      ],
    },
  ];

  const POSITIONS = ["pos-tl", "pos-tr", "pos-ml", "pos-mr", "pos-bl", "pos-br"];

  function mountBackgroundCharacters() {
    if (document.getElementById("bg-characters")) return;

    const container = document.createElement("div");
    container.id = "bg-characters";
    container.setAttribute("aria-hidden", "true");

    POSITIONS.forEach((posClass, index) => {
      const character = CHARACTERS[index % CHARACTERS.length];
      const wrap = document.createElement("div");
      wrap.className = "bg-char " + posClass;
      wrap.innerHTML = window.PixelArt.renderPixelSvg(character.grid, character.palette, 10);
      container.appendChild(wrap);
    });

    document.body.prepend(container);
  }

  window.PixelCraftBackground = { mount: mountBackgroundCharacters };
})();
