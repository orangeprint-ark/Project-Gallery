const canvas = document.getElementById("orangeCutter");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let score = 0;

class Orange {
  constructor() {
    this.x = Math.random() * (width - 40) + 20;
    this.y = height + 20;
    this.radius = 20;
    this.speed = 2 + Math.random() * 2;
    this.cutted = false;
  }
  update() {
    this.y -= this.speed;
  }
  draw() {
    let grad = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius * 0.2,
      this.x,
      this.y,
      this.radius
    );
    grad.addColorStop(0, "#a0eaff");
    grad.addColorStop(1, "#00c6ff");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y,
      this.radius,
      this.radius * 0.8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "rgba(0, 198, 255, 0.7)";
    for (let i = 0; i < 6; i++) {
      let angle = ((Math.PI * 2) / 6) * i - Math.PI / 6;
      let cx = this.x + Math.cos(angle) * this.radius * 0.5;
      let cy = this.y + Math.sin(angle) * this.radius * 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class OrangeHalf {
  constructor(x, y, radius, isLeft) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isLeft = isLeft;
    this.vx = (isLeft ? -1 : 1) * (2 + Math.random() * 2);
    this.vy = -2 - Math.random() * 2;
    this.rotationY = 0;
    this.vrY = isLeft ? -0.05 : 0.05;
    this.alpha = 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15;
    this.rotationY += this.vrY;
    this.alpha -= 0.02;
    if (this.alpha < 0) this.alpha = 0;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    let scaleX = Math.cos(this.rotationY);
    if (scaleX < 0) scaleX = 0;
    ctx.scale(scaleX, 1);

    ctx.fillStyle = `rgba(0,0,0,${0.1 * this.alpha})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      this.radius * 0.9,
      this.radius * 0.9,
      this.radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    let grad = ctx.createRadialGradient(
      0,
      0,
      this.radius * 0.1,
      0,
      0,
      this.radius
    );
    grad.addColorStop(0, "#a0eaff");
    grad.addColorStop(1, "#00c6ff");
    ctx.fillStyle = grad;

    ctx.beginPath();
    if (this.isLeft) {
      ctx.ellipse(
        0,
        0,
        this.radius,
        this.radius * 0.8,
        0,
        Math.PI / 2,
        (3 * Math.PI) / 2,
        true
      );
    } else {
      ctx.ellipse(
        0,
        0,
        this.radius,
        this.radius * 0.8,
        0,
        (3 * Math.PI) / 2,
        Math.PI / 2,
        true
      );
    }
    ctx.fill();

    ctx.fillStyle = `rgba(0, 198, 255, ${0.7 * this.alpha})`;
    for (let i = 0; i < 3; i++) {
      let angle =
        (Math.PI / 3) * i + (this.isLeft ? Math.PI / 3 : -Math.PI / 3);
      let cx = Math.cos(angle) * this.radius * 0.5;
      let cy = Math.sin(angle) * this.radius * 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 1.5) * 6;
    this.alpha = 1;
    this.size = 3 + Math.random() * 3;
    this.color = `rgba(0, ${Math.floor(150 + Math.random() * 100)}, 255,`;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15;
    this.alpha -= 0.03;
    if (this.alpha < 0) this.alpha = 0;
  }
  draw() {
    ctx.fillStyle = this.color + this.alpha + ")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let oranges = [];
let orangeHalves = [];
let particles = [];
let bladePath = [];
let slashes = [];

function spawnOrange() {
  oranges.push(new Orange());
}

setInterval(spawnOrange, 700);

function drawBlade() {
  if (bladePath.length < 2) return;
  ctx.strokeStyle = "#00c6ff";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bladePath[0].x, bladePath[0].y);
  for (let i = 1; i < bladePath.length; i++) {
    ctx.lineTo(bladePath[i].x, bladePath[i].y);
  }
  ctx.stroke();
}

class Slash {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.life = 10;
    this.alpha = 1;
  }
  update() {
    this.life--;
    this.alpha -= 0.1;
    if (this.alpha < 0) this.alpha = 0;
  }
  draw() {
    ctx.strokeStyle = `rgba(0, 198, 255, ${this.alpha})`;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }
}

function checkCuts() {
  for (let i = 0; i < oranges.length; i++) {
    const orange = oranges[i];
    if (orange.cutted) continue;

    for (let j = 0; j < bladePath.length - 1; j++) {
      let p1 = bladePath[j];
      let p2 = bladePath[j + 1];
      let dist = pointLineDistance({ x: orange.x, y: orange.y }, p1, p2);
      if (dist < orange.radius) {
        orange.cutted = true;
        score++;
        document.getElementById("score").textContent = "Score: " + score;

        if (window.orangeAchievements) {
          if (score === 1) window.orangeAchievements.unlock("first_slice");
          if (score === 10) window.orangeAchievements.unlock("slice_10");
          if (score === 50) window.orangeAchievements.unlock("slice_50");
        }

        oranges.splice(i, 1);
        orangeHalves.push(
          new OrangeHalf(orange.x - 10, orange.y, orange.radius, true)
        );
        orangeHalves.push(
          new OrangeHalf(orange.x + 10, orange.y, orange.radius, false)
        );
        slashes.push(new Slash(p1.x, p1.y, p2.x, p2.y));

        for (let k = 0; k < 15; k++) {
          particles.push(new Particle(orange.x, orange.y));
        }
        break;
      }
    }
  }
}

function pointLineDistance(pt, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(pt.x - v.x, pt.y - v.y);
  let t = ((pt.x - v.x) * (w.x - v.x) + (pt.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(
    pt.x - (v.x + t * (w.x - v.x)),
    pt.y - (v.y + t * (w.y - v.y))
  );
}

let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  bladePath = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  bladePath.push({ x: e.offsetX, y: e.offsetY });
  if (bladePath.length > 20) bladePath.shift();
  checkCuts();
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  bladePath = [];
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    isDrawing = true;
    bladePath = [
      {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      },
    ];
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    bladePath.push({
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    });
    if (bladePath.length > 20) bladePath.shift();
    checkCuts();
  },
  { passive: false }
);

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  isDrawing = false;
  bladePath = [];
});

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  for (let i = oranges.length - 1; i >= 0; i--) {
    oranges[i].update();
    if (oranges[i].y + oranges[i].radius < 0) {
      oranges.splice(i, 1);
      continue;
    }
    oranges[i].draw();
  }

  for (let i = orangeHalves.length - 1; i >= 0; i--) {
    orangeHalves[i].update();
    if (orangeHalves[i].alpha <= 0) {
      orangeHalves.splice(i, 1);
      continue;
    }
    orangeHalves[i].draw();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    particles[i].draw();
  }

  for (let i = slashes.length - 1; i >= 0; i--) {
    slashes[i].update();
    if (slashes[i].alpha <= 0) {
      slashes.splice(i, 1);
      continue;
    }
    slashes[i].draw();
  }

  drawBlade();

  requestAnimationFrame(gameLoop);
}

gameLoop();
