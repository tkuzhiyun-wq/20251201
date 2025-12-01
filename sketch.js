let stopSheet, walkSheet, jumpSheet, pushSheet, projectileSheet;
let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];
let projectileAnimation = [];

const stopFrameCount = 8;
const walkFrameCount = 8;
const jumpFrameCount = 6;
const pushFrameCount = 15;
const projectileFrameCount = 6;
let currentFrame = 0;

let charX, charY;
let initialY; // 記錄起跳時的 Y 座標
let state = 'stop'; // 'stop', 'walk_right', 'walk_left'
let isJumping = false;
let isAttacking = false;
let lastDirection = 'right'; // 'left' or 'right'

let projectiles = []; // 存放所有發射的能量波

// 在 setup() 執行前預載入圖片
function preload() {
  // 載入圖片精靈
  stopSheet = loadImage('1/stop/stop-all.png');
  walkSheet = loadImage('1/walk/walk-all.png');
  jumpSheet = loadImage('1/jump/jump-all.png');
  pushSheet = loadImage('1/push/push-all.png');
  projectileSheet = loadImage('1/projectile/光-all.png');
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);

  // --- 切割站立動畫 ---
  const stopFrameWidth = 1107 / stopFrameCount;
  const stopFrameHeight = 196;
  for (let i = 0; i < stopFrameCount; i++) {
    let frame = stopSheet.get(i * stopFrameWidth, 0, stopFrameWidth, stopFrameHeight);
    stopAnimation.push(frame);
  }

  // --- 切割走路動畫 ---
  const walkFrameWidth = 1107 / walkFrameCount;
  const walkFrameHeight = 197;
  for (let i = 0; i < walkFrameCount; i++) {
    let frame = walkSheet.get(i * walkFrameWidth, 0, walkFrameWidth, walkFrameHeight);
    walkAnimation.push(frame);
  }

  // --- 切割跳躍動畫 ---
  const jumpFrameWidth = 691 / jumpFrameCount;
  const jumpFrameHeight = 143;
  for (let i = 0; i < jumpFrameCount; i++) {
    let frame = jumpSheet.get(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameHeight);
    jumpAnimation.push(frame);
  }

  // --- 切割攻擊動畫 ---
  const pushFrameWidth = 5020 / pushFrameCount;
  const pushFrameHeight = 248;
  for (let i = 0; i < pushFrameCount; i++) {
    let frame = pushSheet.get(i * pushFrameWidth, 0, pushFrameWidth, pushFrameHeight);
    pushAnimation.push(frame);
  }

  // --- 切割能量波動畫 ---
  const projectileFrameWidth = 740 / projectileFrameCount;
  const projectileFrameHeight = 134;
  for (let i = 0; i < projectileFrameCount; i++) {
    let frame = projectileSheet.get(i * projectileFrameWidth, 0, projectileFrameWidth, projectileFrameHeight);
    projectileAnimation.push(frame);
  }

  // 初始化角色位置在畫面中央
  charX = width / 2;
  charY = height / 2;
  initialY = charY; // 設定初始地面高度
}

// 處理單次按鍵事件
function keyPressed() {
  // 如果按下上鍵且角色不在跳躍或攻擊中
  if (keyCode === UP_ARROW && !isJumping && !isAttacking) {
    isJumping = true;
    currentFrame = 0; // 從跳躍動畫的第一格開始
  }

  // 如果按下空白鍵且角色不在跳躍或攻擊中
  if (keyCode === 32 && !isJumping && !isAttacking) { // 32 是空白鍵的 keycode
    isAttacking = true;
    currentFrame = 0; // 從攻擊動畫的第一格開始
  }
}

function draw() {
  // 設定背景顏色
  background('#778da9');
  // --- 處理鍵盤輸入 (當角色不在任何特殊動作中) ---
  if (!isJumping && !isAttacking && keyIsDown(RIGHT_ARROW)) {
    state = 'walk_right';
    charX += 5; // 向右移動
  } else if (!isJumping && !isAttacking && keyIsDown(LEFT_ARROW)) {
    state = 'walk_left';
    charX -= 5; // 向左移動
  } else {
    state = 'stop';
  }

  // --- 根據狀態繪製角色 ---
  push(); // 開始一個新的繪圖狀態
  translate(charX, charY); // 將原點移動到角色位置

  let currentAnimation;
  let frameCountTotal;

  if (isJumping) {
    // --- 跳躍邏輯 ---
    currentAnimation = jumpAnimation;
    frameCountTotal = jumpFrameCount;

    // 根據動畫影格決定向上或向下移動
    if (currentFrame < 3) { // 前3格向上
      charY -= 10;
    } else { // 後3格向下
      charY += 10;
    }

    // 根據跳躍前的方向決定是否翻轉
    if (lastDirection === 'left') {
      scale(-1, 1);
    }
  } else if (isAttacking) {
    // --- 攻擊邏輯 ---
    currentAnimation = pushAnimation;
    frameCountTotal = pushFrameCount;
    // 根據攻擊前的方向決定是否翻轉
    if (lastDirection === 'left') scale(-1, 1);
  } else {
    // --- 站立/走路邏輯 ---
    if (state === 'stop') {
      currentAnimation = stopAnimation;
      frameCountTotal = stopFrameCount;
    } else { // 'walk_right' or 'walk_left'
      currentAnimation = walkAnimation;
      frameCountTotal = walkFrameCount;
    }

    if (state === 'walk_left') {
      scale(-1, 1); // 水平翻轉
      lastDirection = 'left';
    } else if (state === 'walk_right') {
      lastDirection = 'right';
    }
  }

  let currentFrameImage = currentAnimation[currentFrame];
  image(currentFrameImage, -currentFrameImage.width / 2, -currentFrameImage.height / 2);

  pop(); // 恢復到原本的繪圖狀態

  // --- 更新並繪製能量波 ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.update();
    p.draw();
    // 如果能量波超出畫面，就從陣列中移除
    if (p.isOffscreen()) {
      projectiles.splice(i, 1);
    }
  }

  // --- 更新動畫畫格 ---
  if (frameCount % 6 == 0) {
    currentFrame = (currentFrame + 1) % frameCountTotal;

    // 如果是跳躍動畫且已播放完畢
    if (isJumping && currentFrame === 0) {
      isJumping = false;
      charY = initialY; // 確保角色回到地面
    }

    // 如果是攻擊動畫且已播放完畢
    if (isAttacking && currentFrame === 0) {
      isAttacking = false;
      // 產生一個新的能量波
      let projectile = new Projectile(charX, charY, lastDirection);
      projectiles.push(projectile);
    }
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Projectile (能量波) 類別
class Projectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = 15;
    this.animation = projectileAnimation;
    this.currentFrame = 0;
    this.frameCountTotal = projectileFrameCount;
  }

  update() {
    // 根據方向移動
    if (this.direction === 'left') {
      this.x -= this.speed;
    } else {
      this.x += this.speed;
    }
    // 更新動畫影格
    if (frameCount % 4 == 0) { // 能量波動畫可以快一點
      this.currentFrame = (this.currentFrame + 1) % this.frameCountTotal;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    let frameImage = this.animation[this.currentFrame];
    image(frameImage, -frameImage.width / 2, -frameImage.height / 2);
    pop();
  }

  isOffscreen() {
    return (this.x > width + 50 || this.x < -50);
  }
}
