// ========= Transición cinematográfica =========
const transitionEl = document.getElementById("pageTransition");

function goWithTransition(url) {
  transitionEl.classList.add("active");
  setTimeout(() => {
    window.location.href = url;
  }, 520);
}

// Intercepta clicks con .nav-link
document.addEventListener("click", (e) => {
  const link = e.target.closest(".nav-link");
  if (!link) return;

  const href = link.getAttribute("data-href");
  if (!href) return;

  e.preventDefault();

  if (link.classList.contains("destination-btn")) {
    link.classList.add("clicked");
    setTimeout(() => link.classList.remove("clicked"), 700);
  }

  setTimeout(() => goWithTransition(href), 180);
});

// ========= Polvo dorado (trail mouse) =========
function dustColor(type) {
  switch (type) {
    case "pink": return "rgba(235,142,171,.95)";
    case "teal": return "rgba(90,164,168,.95)";
    case "sun":  return "rgba(240,143,0,.95)";
    default:     return "rgba(240,200,70,.95)";
  }
}

let dustCooldown = 0;
document.addEventListener("mousemove", (e) => {
  const now = performance.now();
  if (now < dustCooldown) return;
  dustCooldown = now + 14;

  const over = document.elementFromPoint(e.clientX, e.clientY);
  const btn = over?.closest?.(".destination-btn");
  const dustType = btn?.getAttribute("data-dust") || "gold";

  const p = document.createElement("span");
  p.className = "dust";
  p.style.left = `${e.clientX}px`;
  p.style.top = `${e.clientY}px`;
  p.style.background = dustColor(dustType);

  const dx = (Math.random() * 34 - 17).toFixed(1);
  const dy = (Math.random() * 34 - 17).toFixed(1);
  p.style.setProperty("--dx", `${dx}px`);
  p.style.setProperty("--dy", `${dy}px`);

  p.style.boxShadow = `0 0 16px ${dustColor(dustType)}`;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 780);
});

// ========= Partículas mágicas flotando (canvas) =========
const canvas = document.getElementById("magicParticles");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const particles = [];
const MAX = 85;

function rand(min, max) { return Math.random() * (max - min) + min; }

function spawnParticle() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  particles.push({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.6, 2.2),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.18, -0.03),
    tw: rand(0, Math.PI * 2),
    a: rand(0.18, 0.55),
    hue: rand(20, 48), // dorado
    sat: rand(70, 95),
    lum: rand(55, 75),
  });
}

for (let i = 0; i < MAX; i++) spawnParticle();

function draw() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.tw += 0.02;
    p.x += p.vx + Math.sin(p.tw) * 0.08;
    p.y += p.vy;

    if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;

    const flicker = 0.65 + Math.sin(p.tw * 1.8) * 0.25;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * flicker, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${p.a})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 5.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lum}%, ${p.a * 0.12})`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();