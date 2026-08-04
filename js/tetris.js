/* ==========================================================================
   Tetris mini-game for tetris.html / en/tetris.html.
   Self-contained canvas implementation - no dependencies, no server calls.
   Only runs on pages that contain #tetris-board.
   ========================================================================== */

(function () {
  "use strict";

  const boardCanvas = document.getElementById("tetris-board");
  if (!boardCanvas) return;

  const IS_EN = document.documentElement.lang === "en";
  const T = IS_EN
    ? { gameOver: "Game Over", paused: "Paused", restart: "Restart", resume: "Resume", pause: "Pause" }
    : { gameOver: "게임 오버", paused: "일시정지", restart: "다시 시작", resume: "계속하기", pause: "일시정지" };

  const COLS = 10;
  const ROWS = 20;
  const CELL = 24;

  const ctx = boardCanvas.getContext("2d");
  const nextCanvas = document.getElementById("tetris-next");
  const nextCtx = nextCanvas ? nextCanvas.getContext("2d") : null;

  const scoreEl = document.getElementById("tetris-score");
  const linesEl = document.getElementById("tetris-lines");
  const levelEl = document.getElementById("tetris-level");
  const overlayEl = document.getElementById("tetris-overlay");
  const overlayTextEl = document.getElementById("tetris-overlay-text");
  const restartBtn = document.getElementById("tetris-restart-btn");
  const pauseBtn = document.getElementById("tetris-pause-btn");

  const SHAPES = {
    I: { color: "#33d6b0", cells: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
    O: { color: "#ffd93d", cells: [[1, 1], [1, 1]] },
    T: { color: "#7c5cff", cells: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
    S: { color: "#2fae5c", cells: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
    Z: { color: "#e35b5b", cells: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
    J: { color: "#41e0ff", cells: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
    L: { color: "#f2c34d", cells: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
  };
  const PIECE_TYPES = Object.keys(SHAPES);

  const LINE_SCORE = [0, 100, 300, 500, 800];

  let board = createEmptyBoard();
  let bag = [];
  let current = null;
  let next = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropInterval = 800;
  let dropTimer = 0;
  let lastTime = 0;
  let paused = false;
  let gameOver = false;
  let rafId = null;

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function refillBag() {
    const shuffled = PIECE_TYPES.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    bag = bag.concat(shuffled);
  }

  function drawPieceType() {
    if (bag.length === 0) refillBag();
    return bag.shift();
  }

  function spawnPiece(type) {
    const shape = SHAPES[type];
    const size = shape.cells.length;
    return {
      type,
      color: shape.color,
      cells: shape.cells.map((row) => row.slice()),
      row: 0,
      col: Math.floor((COLS - size) / 2),
    };
  }

  function rotateMatrix(matrix) {
    const n = matrix.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        result[c][n - 1 - r] = matrix[r][c];
      }
    }
    return result;
  }

  function collides(cells, row, col) {
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        if (!cells[r][c]) continue;
        const boardRow = row + r;
        const boardCol = col + c;
        if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) return true;
        if (boardRow >= 0 && board[boardRow][boardCol]) return true;
      }
    }
    return false;
  }

  function tryMove(dRow, dCol) {
    if (!current || gameOver || paused) return false;
    const newRow = current.row + dRow;
    const newCol = current.col + dCol;
    if (collides(current.cells, newRow, newCol)) return false;
    current.row = newRow;
    current.col = newCol;
    return true;
  }

  function tryRotate() {
    if (!current || gameOver || paused || current.type === "O") return;
    const rotated = rotateMatrix(current.cells);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(rotated, current.row, current.col + kick)) {
        current.cells = rotated;
        current.col += kick;
        return;
      }
    }
  }

  function lockPiece() {
    current.cells.forEach((row, r) => {
      row.forEach((val, c) => {
        if (!val) return;
        const boardRow = current.row + r;
        const boardCol = current.col + c;
        if (boardRow >= 0) board[boardRow][boardCol] = current.color;
      });
    });

    const cleared = clearLines();
    if (cleared > 0) {
      score += LINE_SCORE[cleared] * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(120, 800 - (level - 1) * 70);
      updateStats();
    }

    current = spawnPiece(next.type);
    next = spawnPiece(drawPieceType());
    drawNext();

    if (collides(current.cells, current.row, current.col)) {
      endGame();
    }
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    return cleared;
  }

  function hardDrop() {
    if (!current || gameOver || paused) return;
    while (tryMove(1, 0)) {
      /* keep dropping */
    }
    lockPiece();
    dropTimer = 0;
  }

  function updateStats() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (linesEl) linesEl.textContent = String(lines);
    if (levelEl) levelEl.textContent = String(level);
  }

  function drawCell(context, x, y, cell, color) {
    context.fillStyle = color;
    context.fillRect(x * cell, y * cell, cell, cell);
    context.strokeStyle = "rgba(0, 0, 0, 0.25)";
    context.strokeRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
  }

  function drawBoard() {
    ctx.fillStyle = "#100e1c";
    ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) drawCell(ctx, c, r, CELL, board[r][c]);
      }
    }

    if (current) {
      current.cells.forEach((row, r) => {
        row.forEach((val, c) => {
          if (!val) return;
          const boardRow = current.row + r;
          if (boardRow < 0) return;
          drawCell(ctx, current.col + c, boardRow, CELL, current.color);
        });
      });
    }
  }

  function drawNext() {
    if (!nextCtx || !next) return;
    nextCtx.fillStyle = "#100e1c";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const cell = 20;
    const size = next.cells.length;
    const offset = (nextCanvas.width / cell - size) / 2;
    next.cells.forEach((row, r) => {
      row.forEach((val, c) => {
        if (!val) return;
        drawCell(nextCtx, c + offset, r + offset, cell, next.color);
      });
    });
  }

  function showOverlay(text) {
    if (!overlayEl) return;
    overlayEl.hidden = false;
    if (overlayTextEl) overlayTextEl.textContent = text;
  }

  function hideOverlay() {
    if (overlayEl) overlayEl.hidden = true;
  }

  function endGame() {
    gameOver = true;
    showOverlay(`${T.gameOver} - ${score}`);
    if (rafId) cancelAnimationFrame(rafId);
  }

  function togglePause() {
    if (gameOver) return;
    paused = !paused;
    if (paused) {
      showOverlay(T.paused);
    } else {
      hideOverlay();
      lastTime = 0;
    }
    if (pauseBtn) pauseBtn.textContent = paused ? T.resume : T.pause;
  }

  function resetGame() {
    board = createEmptyBoard();
    bag = [];
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 800;
    dropTimer = 0;
    paused = false;
    gameOver = false;
    current = spawnPiece(drawPieceType());
    next = spawnPiece(drawPieceType());
    updateStats();
    drawNext();
    hideOverlay();
    if (pauseBtn) pauseBtn.textContent = T.pause;
    if (rafId) cancelAnimationFrame(rafId);
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (gameOver) return;
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!paused) {
      dropTimer += delta;
      if (dropTimer >= dropInterval) {
        dropTimer = 0;
        if (!tryMove(1, 0)) lockPiece();
      }
      drawBoard();
    }

    if (!gameOver) rafId = requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        tryMove(0, -1);
        e.preventDefault();
        break;
      case "ArrowRight":
        tryMove(0, 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        if (tryMove(1, 0)) dropTimer = 0;
        e.preventDefault();
        break;
      case "ArrowUp":
        tryRotate();
        e.preventDefault();
        break;
      case " ":
        hardDrop();
        e.preventDefault();
        break;
      case "p":
      case "P":
        togglePause();
        break;
    }
  });

  document.querySelectorAll(".tetris-dpad [data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switch (btn.getAttribute("data-action")) {
        case "left":
          tryMove(0, -1);
          break;
        case "right":
          tryMove(0, 1);
          break;
        case "down":
          if (tryMove(1, 0)) dropTimer = 0;
          break;
        case "rotate":
          tryRotate();
          break;
        case "drop":
          hardDrop();
          break;
      }
    });
  });

  if (restartBtn) restartBtn.addEventListener("click", resetGame);
  if (pauseBtn) pauseBtn.addEventListener("click", togglePause);

  resetGame();
})();
