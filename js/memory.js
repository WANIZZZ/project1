/* ==========================================================================
   Memory match mini-game for memory.html / en/memory.html.
   Cards use the site's existing pixel icon set (PIXEL_GALLERY_ICONS) as
   artwork. No server calls - state lives entirely in this page.
   ========================================================================== */

(function () {
  "use strict";

  const gridEl = document.getElementById("memory-grid");
  if (!gridEl) return;

  const IS_EN = document.documentElement.lang === "en";
  const HIDDEN_LABEL = IS_EN ? "Hidden card" : "가려진 카드";
  const winText = (moves, time) =>
    IS_EN ? `You matched them all! ${moves} moves, ${time}.` : `모두 맞췄습니다! ${moves}번 만에, ${time}.`;

  const PAIR_COUNT = 8;
  const MISMATCH_DELAY = 700;

  const movesEl = document.getElementById("memory-moves");
  const matchesEl = document.getElementById("memory-matches");
  const timeEl = document.getElementById("memory-time");
  const overlayEl = document.getElementById("memory-overlay");
  const overlayTextEl = document.getElementById("memory-overlay-text");
  const restartBtn = document.getElementById("memory-restart-btn");

  let cards = [];
  let revealed = [];
  let matchedCount = 0;
  let moves = 0;
  let locked = false;
  let seconds = 0;
  let timerId = null;

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildDeck() {
    const icons = shuffle(window.PIXEL_GALLERY_ICONS).slice(0, PAIR_COUNT);
    return shuffle(icons.concat(icons)).map((icon) => ({ icon, matched: false }));
  }

  function formatTime(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function updateStats() {
    if (movesEl) movesEl.textContent = String(moves);
    if (matchesEl) matchesEl.textContent = `${matchedCount}/${PAIR_COUNT}`;
    if (timeEl) timeEl.textContent = formatTime(seconds);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function startTimer() {
    stopTimer();
    seconds = 0;
    timerId = setInterval(() => {
      seconds += 1;
      updateStats();
    }, 1000);
  }

  function renderCard(card, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "memory-card";

    const isOpen = card.matched || revealed.includes(index);
    if (card.matched) btn.classList.add("is-matched");
    else if (isOpen) btn.classList.add("is-revealed");

    if (isOpen) {
      const svgMarkup = window.PixelArt.renderPixelSvg(card.icon.grid, card.icon.palette, 10);
      btn.innerHTML = `<div class="memory-card-art">${svgMarkup}</div>`;
      btn.setAttribute("aria-label", IS_EN ? card.icon.en : card.icon.ko);
    } else {
      btn.innerHTML = `<span class="memory-card-mark">?</span>`;
      btn.setAttribute("aria-label", HIDDEN_LABEL);
    }

    btn.disabled = card.matched;
    btn.addEventListener("click", () => handleCardClick(index));
    return btn;
  }

  function render() {
    gridEl.innerHTML = "";
    cards.forEach((card, index) => gridEl.appendChild(renderCard(card, index)));
  }

  function handleCardClick(index) {
    if (locked || revealed.includes(index) || cards[index].matched) return;

    revealed.push(index);
    render();
    if (revealed.length < 2) return;

    moves += 1;
    updateStats();

    const [a, b] = revealed;
    if (cards[a].icon.name === cards[b].icon.name) {
      cards[a].matched = true;
      cards[b].matched = true;
      matchedCount += 1;
      revealed = [];
      render();
      if (matchedCount === PAIR_COUNT) finishGame();
    } else {
      locked = true;
      setTimeout(() => {
        revealed = [];
        locked = false;
        render();
      }, MISMATCH_DELAY);
    }
  }

  function finishGame() {
    stopTimer();
    if (overlayTextEl) overlayTextEl.textContent = winText(moves, formatTime(seconds));
    if (overlayEl) overlayEl.hidden = false;
  }

  function resetGame() {
    cards = buildDeck();
    revealed = [];
    matchedCount = 0;
    moves = 0;
    locked = false;
    if (overlayEl) overlayEl.hidden = true;
    updateStats();
    render();
    startTimer();
  }

  if (restartBtn) restartBtn.addEventListener("click", resetGame);

  resetGame();
})();
