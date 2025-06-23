const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GRAVITY = 0.6;
const PLAYER_SPEED = 4;
const JUMP_STRENGTH = -12;

let isGameOver = false;
let gameStarted = false;
let startTime = 0;
let elapsedTime = 0;

const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const timerDisplay = document.getElementById("timer");
const bestTimeDisplay = document.getElementById("bestTime");
const mobileControls = document.getElementById("mobileControls");

let bestTime = parseFloat(localStorage.getItem("bestTime")) || 0;
bestTimeDisplay.textContent = `Best: ${bestTime.toFixed(1)}s`;

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

let player = {
  x: 100, y: HEIGHT - 150,
  width: 30, height: 30,
  vx: 0, vy: 0,
  grounded: false
};

const platforms = [
  { x: 50, y: 550, width: 200, height: 20 },
  { x: 300, y: 450, width: 200, height: 20 },
  { x: 550, y: 350, width: 200, height: 20 },
  { x: 300, y: 250, width: 200, height: 20 },
  { x: 100, y: 150, width: 200, height: 20 }
];

let key = {
  x: 620,
  y: 310,
  width: 20,
  height: 20,
  collected: false
};

let waterLevel = HEIGHT;
let floodSpeed = 0.3;

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function startGame() {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  restartBtn.style.display = "none";
  timerDisplay.textContent = "Time: 0.0s";
  bestTimeDisplay.textContent = `Best: ${bestTime.toFixed(1)}s`;
  isGameOver = false;
  gameStarted = true;
  startTime = performance.now();
  if (window.innerWidth < 768) {
    mobileControls.style.display = "block";
  }
  update();
}

function update() {
  if (!gameStarted || isGameOver) return;

  elapsedTime = ((performance.now() - startTime) / 1000).toFixed(1);
  timerDisplay.textContent = `Time: ${elapsedTime}s`;

  drawBackground();
  movePlayer();
  checkCollisions();

  waterLevel -= floodSpeed;
  if (player.y + player.height > waterLevel) {
    endGame("You drowned!");
    return;
  }

  if (player.y < 100 && player.x > 300 && player.x < 500 && key.collected) {
    endGame("You Escaped!");
    return;
  }

  drawWater();
  drawPlayer();
  drawPlatforms();
  drawKey();

  requestAnimationFrame(update);
}

function movePlayer() {
  player.vx = 0;
  if (keys["ArrowLeft"]) player.vx = -PLAYER_SPEED;
  if (keys["ArrowRight"]) player.vx = PLAYER_SPEED;

  player.x += player.vx;

  if (keys["ArrowUp"] && player.grounded) {
    player.vy = JUMP_STRENGTH;
    player.grounded = false;
  }

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;
  if (player.y > HEIGHT) player.y = HEIGHT - player.height;
}

function checkCollisions() {
  player.grounded = false;
  for (let plat of platforms) {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y + player.height > plat.y &&
      player.y + player.height < plat.y + player.vy + 5
    ) {
      player.y = plat.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  }

  if (
    !key.collected &&
    player.x < key.x + key.width &&
    player.x + player.width > key.x &&
    player.y < key.y + key.height &&
    player.y + player.height > key.y
  ) {
    key.collected = true;
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawPlayer() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
  ctx.fillStyle = "#888";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  ctx.fillStyle = key.collected ? "lime" : "gray";
  ctx.fillRect(300, 100, 200, 20);
}

function drawKey() {
  if (!key.collected) {
    ctx.fillStyle = "gold";
    ctx.fillRect(key.x, key.y, key.width, key.height);
  }
}

function drawWater() {
  ctx.fillStyle = "rgba(0, 150, 255, 0.5)";
  ctx.fillRect(0, waterLevel, WIDTH, HEIGHT - waterLevel);
}

function endGame(message) {
  isGameOver = true;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, WIDTH / 2, HEIGHT / 2);
  ctx.font = "24px Arial";
  ctx.fillText(`Time: ${elapsedTime}s`, WIDTH / 2, HEIGHT / 2 + 40);
  restartBtn.style.display = "block";

  if (!isNaN(elapsedTime) && (!bestTime || parseFloat(elapsedTime) > bestTime)) {
    bestTime = parseFloat(elapsedTime);
    localStorage.setItem("bestTime", bestTime.toFixed(1));
    bestTimeDisplay.textContent = `Best: ${bestTime.toFixed(1)}s`;
  }
}

function restartGame() {
  player.x = 100;
  player.y = HEIGHT - 150;
  player.vx = 0;
  player.vy = 0;
  key.collected = false;
  waterLevel = HEIGHT;
  startTime = performance.now();
  isGameOver = false;
  restartBtn.style.display = "none";
  bestTimeDisplay.textContent = `Best: ${bestTime.toFixed(1)}s`;
  update();
}

// Mobile controls
document.getElementById("leftBtn").addEventListener("touchstart", () => keys["ArrowLeft"] = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys["ArrowLeft"] = false);

document.getElementById("rightBtn").addEventListener("touchstart", () => keys["ArrowRight"] = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys["ArrowRight"] = false);

document.getElementById("jumpBtn").addEventListener("touchstart", () => {
  if (player.grounded) {
    keys["ArrowUp"] = true;
    setTimeout(() => keys["ArrowUp"] = false, 100);
  }
});






