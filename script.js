/* ==========================================================
   Polvo de hadas (estela + bursts) — Lily One Travel
   - Estela suave con el cursor (desktop)
   - Bursts al hover/click (opcional)
   - Rendimiento seguro en móvil (cap + throttle + reduce motion)
   ========================================================== */

/* ====== CONFIGURACIÓN ====== */
const FAIRY = {
  // "soft" | "normal" | "dense"
  intensity: "normal",

  // Activa/desactiva burst en botones con .destination-btn
  enableBursts: true,

  // Colores del polvo (puedes ajustar)
  palette: [
    "rgba(240,143,0,0.90)",  // naranja
    "rgba(235,142,171,0.85)",// rosa
    "rgba(90,164,168,0.85)", // teal
    "rgba(205,209,127,0.90)" // lima suave
  ],

  // Partículas "de fondo" (brillitos)
  background: true
};

/* ====== DETECCIÓN DE ENTORNO ====== */
const prefersReducedMotion =
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

const isTouchDevice =
  "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;

/* ====== CANVAS ====== */
const canvas = document.getElementById("magicParticles");
const ctx = canvas?.getContext?.("2d");

let W = 0, H = 0;

function resizeCanvas() {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas, { passive: true });
resizeCanvas();

/* ====== UTILIDADES ====== */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pickColor() {
  return FAIRY.palette[(Math.random() * FAIRY.palette.length) | 0];
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* ====== PARTICULAS ======
   type:
   - "bg": brillitos flotantes (no mueren, hacen wrap)
   - "fx": polvo de hadas (muere con life)
*/
let particles = [];

/* ====== TUNING POR DISPOSITIVO / INTENSIDAD ====== */
function isMobile() {
  return window.innerWidth <= 600;
}
function baseBGCount() {
  // Brillitos de fondo
  if (isMobile()) return 24;
  if (window.innerWidth <= 1024) return 34;
  return 46;
}
function trailCount() {
  // Partículas por "tick" del mousemove (cap móvil)
  if (isMobile()) return 1;

  if (FAIRY.intensity === "soft") return 1;
  if (FAIRY.intensity === "dense") return 3;
  return 2; // normal
}
function trailThrottleMs() {
  // Menor número = más partículas/segundo (cap móvil)
  if (isMobile()) return 26;

  if (FAIRY.intensity === "soft") return 24;
  if (FAIRY.intensity === "dense") return 12;
  return 16; // normal
}
function maxParticles() {
  // Límite global para proteger rendimiento
  const base = isMobile() ? 90 : 170;
  return base + (FAIRY.intensity === "dense" && !isMobile() ? 60 : 0);
}

/* ====== BACKGROUND PARTICLES ====== */
function createBackgroundParticles(count) {
  const bg = new Array(count).fill(0).map(() => ({
    type: "bg",
    x: rand(0, W),
    y: rand(0, H),
    r: rand(0.7, 1.9),
    vx: rand(-0.18, 0.18),
    vy: rand(-0.12, 0.12),
    a: rand(0.12, 0.35),
    c: "rgba(255,255,255,0.65)"
  }));

  // conserva fx existentes y agrega bg
  particles = particles.filter(p => p.type === "fx").concat(bg);
}

/* ====== CAP DE PARTICULAS ====== */
function capParticles() {
  const max = maxParticles();
  if (particles.length > max) {
    // elimina del inicio (los más viejos)
    particles.splice(0, particles.length - max);
  }
}

/* ====== LOOP DE DIBUJO ====== */
function draw() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, W, H);

  // Recorrer al revés para poder remover
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    if (p.type === "bg") {
      // wrap suave
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }

    let alpha = p.a;

    if (p.type === "fx") {
      p.life -= 1;
      const t = clamp(p.life / p.lifeMax, 0, 1); // 1 -> 0
      alpha = p.a * t;

      // desacelera + sube un poquito
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 - 0.01;

      // muere
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
    }

    // “Glow” sencillo: 2 círculos
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.fillStyle = p.c;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

/* ====== ESTELA DEL CURSOR ====== */
let lastT = 0;
let throttleMs = trailThrottleMs();

function spawnTrail(x, y) {
  const count = trailCount();

  for (let i = 0; i < count; i++) {
    const lifeMax = isMobile() ? rand(16, 22) : rand(18, 30);

    particles.push({
      type: "fx",
      x: x + rand(-6, 6),
      y: y + rand(-6, 6),
      r: rand(0.9, 2.4),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.25, 0.15),
      a: rand(0.35, 0.85),
      c: pickColor(),
      life: lifeMax | 0,
      lifeMax: lifeMax | 0
    });
  }

  capParticles();
}

/* ====== BURST EN ELEMENTO (opcional) ====== */
function burstAtElement(el) {
  if (!el || !canvas || !ctx) return;

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const burst = isMobile() ? 10 : (FAIRY.intensity === "dense" ? 26 : 18);
  for (let i = 0; i < burst; i++) {
    const lifeMax = isMobile() ? rand(16, 24) : rand(18, 34);

    particles.push({
      type: "fx",
      x: cx + rand(-10, 10),
      y: cy + rand(-10, 10),
      r: rand(1.1, 2.9),
      vx: rand(-1.2, 1.2),
      vy: rand(-1.4, 0.7),
      a: rand(0.35, 0.95),
      c: pickColor(),
      life: lifeMax | 0,
      lifeMax: lifeMax | 0
    });
  }

  capParticles();
}

/* ====== INICIO ====== */
(function initFairyDust() {
  if (!canvas || !ctx) return;

  // Respeta Reduce Motion
  if (prefersReducedMotion) return;

  if (FAIRY.background) {
    createBackgroundParticles(baseBGCount());
  }

  // Loop
  draw();

  // Resize: recalcular bg y throttle
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      throttleMs = trailThrottleMs();
      if (FAIRY.background) createBackgroundParticles(baseBGCount());
    }, 180);
  }, { passive: true });

  // Estela: solo desktop/trackpad (evita touch)
  if (!isTouchDevice) {
    window.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastT < throttleMs) return;
      lastT = now;
      spawnTrail(e.clientX, e.clientY);
    }, { passive: true });
  }

  // Bursts en botones/targets (si activado)
  if (FAIRY.enableBursts) {
    const targets = document.querySelectorAll(".destination-btn");
    targets.forEach((btn) => {
      // hover: solo si no touch
      if (!isTouchDevice) {
        btn.addEventListener("mouseenter", () => burstAtElement(btn));
      }
      btn.addEventListener("click", () => burstAtElement(btn));
    });
  }
})();