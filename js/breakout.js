/* ==========================================================================
   Brick breaker (Arkanoid-style) mini-game for breakout.html / en/breakout.html.
   Self-contained canvas implementation - no dependencies, no server calls.
   Only runs on pages that contain #breakout-board.
   ========================================================================== */

(function () {
  "use strict";

  const boardCanvas = document.getElementById("breakout-board");
  if (!boardCanvas) return;

  const IS_EN = document.documentElement.lang === "en";
  const T = IS_EN
    ? { win: (score) => `You Win! Score ${score}`, gameOver: (score) => `Game Over - ${score}`, paused: "Paused" }
    : { win: (score) => `승리! 점수 ${score}`, gameOver: (score) => `게임 오버 - ${score}`, paused: "일시정지" };

  const CANVAS_W = boardCanvas.width;
  const CANVAS_H = boardCanvas.height;
  const ctx = boardCanvas.getContext("2d");

  const scoreEl = document.getElementById("breakout-score");
  const livesEl = document.getElementById("breakout-lives");
  const bricksEl = document.getElementById("breakout-bricks");
  const overlayEl = document.getElementById("breakout-overlay");
  const overlayTextEl = document.getElementById("breakout-overlay-text");
  const restartBtn = document.getElementById("breakout-restart-btn");
  const pauseBtn = document.getElementById("breakout-pause-btn");

  const PADDLE_W = 70;
  const PADDLE_H = 10;
  const PADDLE_Y = CANVAS_H - 24;
  const PADDLE_SPEED = 360;

  const BALL_RADIUS = 6;
  const BALL_SPEED = 260;

  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const BRICK_W = 32;
  const BRICK_H = 14;
  const BRICK_GAP = 4;
  const BRICK_TOP = 40;
  const BRICK_LEFT = (CANVAS_W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
  const ROW_COLORS = ["#e35b5b", "#f2c34d", "#ffd93d", "#33d6b0", "#41e0ff"];
  const TOTAL_BRICKS = BRICK_ROWS * BRICK_COLS;

  let paddle = { x: (CANVAS_W - PADDLE_W) / 2, w: PADDLE_W, h: PADDLE_H, y: PADDLE_Y };
  let ball = { x: 0, y: 0, dx: 0, dy: 0, launched: false };
  let bricks = [];
  let bricksLeft = TOTAL_BRICKS;
  let score = 0;
  let lives = 3;
  let paused = false;
  let ended = false;
  let leftPressed = false;
  let rightPressed = false;
  let lastTime = 0;
  let rafId = null;

  function createBricks() {
    const grid = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      const row = [];
      for (let c = 0; c < BRICK_COLS; c++) row.push(true);
      grid.push(row);
    }
    return grid;
  }

  function brickRect(r, c) {
    return {
      x: BRICK_LEFT + c * (BRICK_W + BRICK_GAP),
      y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
      w: BRICK_W,
      h: BRICK_H,
    };
  }

  function resetBallOnPaddle() {
    ball.launched = false;
    ball.dx = 0;
    ball.dy = 0;
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - BALL_RADIUS;
  }

  function launchBall() {
    if (ball.launched || paused || ended) return;
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI; // slight random tilt from vertical
    ball.dx = BALL_SPEED * Math.sin(angle);
    ball.dy = -BALL_SPEED * Math.cos(angle);
    ball.launched = true;
  }

  function updateStats() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (livesEl) livesEl.textContent = String(lives);
    if (bricksEl) bricksEl.textContent = String(bricksLeft);
  }

  function showOverlay(text) {
    if (overlayTextEl) overlayTextEl.textContent = text;
    if (overlayEl) overlayEl.hidden = false;
  }

  function hideOverlay() {
    if (overlayEl) overlayEl.hidden = true;
  }

  function endGame(won) {
    ended = true;
    showOverlay(won ? T.win(score) : T.gameOver(score));
    if (rafId) cancelAnimationFrame(rafId);
  }

  function togglePause() {
    if (ended) return;
    paused = !paused;
    if (paused) {
      showOverlay(T.paused);
    } else {
      hideOverlay();
      lastTime = 0;
    }
    if (pauseBtn) pauseBtn.textContent = paused ? (IS_EN ? "Resume" : "계속하기") : (IS_EN ? "Pause" : "일시정지");
  }

  function update(delta) {
    if (paused || ended) return;

    if (leftPressed) paddle.x -= PADDLE_SPEED * delta;
    if (rightPressed) paddle.x += PADDLE_SPEED * delta;
    paddle.x = Math.max(0, Math.min(CANVAS_W - paddle.w, paddle.x));

    if (!ball.launched) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - BALL_RADIUS;
      return;
    }

    ball.x += ball.dx * delta;
    ball.y += ball.dy * delta;

    if (ball.x - BALL_RADIUS < 0) {
      ball.x = BALL_RADIUS;
      ball.dx = -ball.dx;
    } else if (ball.x + BALL_RADIUS > CANVAS_W) {
      ball.x = CANVAS_W - BALL_RADIUS;
      ball.dx = -ball.dx;
    }
    if (ball.y - BALL_RADIUS < 0) {
      ball.y = BALL_RADIUS;
      ball.dy = -ball.dy;
    }

    if (
      ball.dy > 0 &&
      ball.y + BALL_RADIUS >= paddle.y &&
      ball.y + BALL_RADIUS <= paddle.y + paddle.h &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.w
    ) {
      ball.y = paddle.y - BALL_RADIUS;
      const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const angle = Math.max(-1, Math.min(1, hitPos)) * (Math.PI / 3);
      ball.dx = BALL_SPEED * Math.sin(angle);
      ball.dy = -BALL_SPEED * Math.cos(angle);
    }

    if (ball.y - BALL_RADIUS > CANVAS_H) {
      lives -= 1;
      updateStats();
      if (lives <= 0) {
        endGame(false);
        return;
      }
      resetBallOnPaddle();
      return;
    }

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (!bricks[r][c]) continue;
        const rect = brickRect(r, c);
        const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
        const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
        if (dist < BALL_RADIUS) {
          bricks[r][c] = false;
          bricksLeft -= 1;
          score += 10;
          ball.dy = -ball.dy;
          updateStats();
          if (bricksLeft === 0) endGame(true);
          return;
        }
      }
    }
  }

  function draw() {
    ctx.fillStyle = "#100e1c";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        if (!bricks[r][c]) continue;
        const rect = brickRect(r, c);
        ctx.fillStyle = ROW_COLORS[r % ROW_COLORS.length];
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    ctx.fillStyle = "#f4f1ff";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd93d";
    ctx.fill();
  }

  function resetGame() {
    bricks = createBricks();
    bricksLeft = TOTAL_BRICKS;
    score = 0;
    lives = 3;
    paused = false;
    ended = false;
    paddle.x = (CANVAS_W - PADDLE_W) / 2;
    resetBallOnPaddle();
    updateStats();
    hideOverlay();
    if (pauseBtn) pauseBtn.textContent = IS_EN ? "Pause" : "일시정지";
    if (rafId) cancelAnimationFrame(rafId);
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (ended) return;
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    update(delta);
    draw();

    if (!ended) rafId = requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        leftPressed = true;
        e.preventDefault();
        break;
      case "ArrowRight":
        rightPressed = true;
        e.preventDefault();
        break;
      case "ArrowUp":
      case " ":
        launchBall();
        e.preventDefault();
        break;
      case "p":
      case "P":
        togglePause();
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  });

  document.querySelectorAll(".breakout-dpad [data-action]").forEach((btn) => {
    const action = btn.getAttribute("data-action");
    if (action === "launch") {
      btn.addEventListener("click", launchBall);
      return;
    }
    const setPressed = (value) => {
      if (action === "left") leftPressed = value;
      if (action === "right") rightPressed = value;
    };
    btn.addEventListener("pointerdown", () => setPressed(true));
    btn.addEventListener("pointerup", () => setPressed(false));
    btn.addEventListener("pointerleave", () => setPressed(false));
    btn.addEventListener("pointercancel", () => setPressed(false));
  });

  if (restartBtn) restartBtn.addEventListener("click", resetGame);
  if (pauseBtn) pauseBtn.addEventListener("click", togglePause);

  resetGame();
})();
