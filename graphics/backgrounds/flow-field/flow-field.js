/**
 * Flow Field Background
 * A mesmerizing, continuous flow field animation with configurable colors and speed.
 */

// --- Simplex Noise Implementation (Minimal) ---
// Ported/Adapted from standard Simplex Noise algorithms for standalone use.
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
const P = new Uint8Array(256);
const Perm = new Uint8Array(512);
const Grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [1, 0], [-1, 0],
  [0, 1], [0, -1], [0, 1], [0, -1]
];

function seedNoise(seed = 0) {
  for (let i = 0; i < 256; i++) P[i] = i;
  let n = seed % 256; // Simple seed usage
  for (let i = 0; i < 256; i++) {
    const r = (i * 123 + n * 456) % 256;
    const t = P[i]; P[i] = P[r]; P[r] = t;
  }
  for (let i = 0; i < 512; i++) Perm[i] = P[i & 255];
}
seedNoise(Date.now());

function simplex2(x, y) {
  let n0, n1, n2;
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;
  let i1, j1;
  if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = Perm[ii + Perm[jj]] % 12;
  const gi1 = Perm[ii + i1 + Perm[jj + j1]] % 12;
  const gi2 = Perm[ii + 1 + Perm[jj + 1]] % 12;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) n0 = 0.0;
  else {
    t0 *= t0;
    n0 = t0 * t0 * (Grad2[gi0][0] * x0 + Grad2[gi0][1] * y0);
  }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) n1 = 0.0;
  else {
    t1 *= t1;
    n1 = t1 * t1 * (Grad2[gi1][0] * x1 + Grad2[gi1][1] * y1);
  }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) n2 = 0.0;
  else {
    t2 *= t2;
    n2 = t2 * t2 * (Grad2[gi2][0] * x2 + Grad2[gi2][1] * y2);
  }
  return 70.0 * (n0 + n1 + n2);
}

// --- Component ---

const DEFAULT_STATE = {
  color1: "#00ffff",
  color2: "#ff00ff",
  backgroundColor: "#050510",
  speed: 1.0,
  scale: 0.01,
  particleCount: 1000,
  showParticles: true
};

class FlowFieldBackground extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isPlaying = false;
    this._rafId = null;
    this._particles = [];
    this._width = 1920;
    this._height = 1080;
    this._time = 0;

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `;
    shadow.appendChild(style);

    // Background Canvas for Grid
    this._bgCanvas = document.createElement('canvas');
    this._bgCanvas.style.opacity = '0';
    this._bgCanvas.style.transition = 'opacity 0.5s ease';
    this._bgCanvas.style.filter = 'blur(80px)'; // Strong Blur effect
    shadow.appendChild(this._bgCanvas);
    this._bgCtx = this._bgCanvas.getContext('2d', { alpha: false });

    // Foreground Canvas for Particles
    this._canvas = document.createElement('canvas');
    this._canvas.style.opacity = '0';
    this._canvas.style.transition = 'opacity 0.5s ease';
    shadow.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d'); // Need alpha for trails

    this._gridIntensities = new Float32Array(0);
    this._gridRows = 0;
    this._gridCols = 0;
  }

  connectedCallback() {
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this);
    this._onResize();
  }

  disconnectedCallback() {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this.stopAction();
  }

  async load(params) {
    this._updateState(params.data);
    this._initParticles();
    return { statusCode: 200 };
  }

  async dispose() {
    this.stopAction();
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._isPlaying = true;
    this._canvas.style.opacity = this._state.showParticles ? '1' : '0';
    this._bgCanvas.style.opacity = '1';
    this._lastTime = performance.now();
    this._loop();
    return { statusCode: 200 };
  }

  async stopAction(params) {
    this._isPlaying = false;
    this._canvas.style.opacity = '0';
    this._bgCanvas.style.opacity = '0';
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._updateState(params.data);
    return { statusCode: 200 };
  }

  async customAction(params) {
    return { statusCode: 200 };
  }

  async goToTime(params) {
     return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    return { statusCode: 200 };
  }

  _updateState(data) {
    if (!data) return;
    const oldParticleCount = this._state.particleCount;
    this._state = { ...this._state, ...data };



    // Toggle particle visibility
    if (this._canvas && this._isPlaying) {
       this._canvas.style.opacity = this._state.showParticles ? '1' : '0';
    }

    if (this._state.particleCount !== oldParticleCount) {
      this._initParticles();
    }
  }

  _onResize() {
    const rect = this.getBoundingClientRect();
    this._width = rect.width;
    this._height = rect.height;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;

    this._bgCanvas.width = this._width * dpr;
    this._bgCanvas.height = this._height * dpr;
    this._bgCtx.scale(dpr, dpr);

    this._canvas.width = this._width * dpr;
    this._canvas.height = this._height * dpr;
    this._ctx.scale(dpr, dpr);

    // Re-init particles if needed or just let them bound naturally
    if (this._particles.length === 0) {
      this._initParticles();
    }

    // Resize grid array
    this._gridCols = Math.ceil(this._width / 100);
    this._gridRows = Math.ceil(this._height / 100);
    const newSize = this._gridCols * this._gridRows;
    if (this._gridIntensities.length !== newSize) {
        this._gridIntensities = new Float32Array(newSize);
    }
  }

  _initParticles() {
    this._particles = [];
    for (let i = 0; i < this._state.particleCount; i++) {
      this._particles.push({
        x: Math.random() * this._width,
        y: Math.random() * this._height,
        vx: 0,
        vy: 0,
        age: Math.random() * 100, // Random start age for variation
        life: 100 + Math.random() * 100
      });
    }
  }

  _loop() {
    if (!this._isPlaying) return;

    this._rafId = requestAnimationFrame(() => this._loop());

    const now = performance.now();
    const dt = (now - this._lastTime) * 0.001; // delta time in seconds
    this._lastTime = now;
    this._time += dt * this._state.speed;

    this._draw();
  }

  _draw() {
    const { width, height } = this._canvas; // Actual pixel dimensions
    const w = this._width;
    const h = this._height;

    // --- Grid Calculation ---
    // Dynamic 100px Grid
    const ROWS = this._gridRows;
    const COLS = this._gridCols;
    const cellW = w / COLS;
    const cellH = h / ROWS;
    const gridCounts = new Int32Array(ROWS * COLS);

    // Fade out trails on foreground canvas
    this._ctx.globalCompositeOperation = 'destination-out';
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this._ctx.fillRect(0, 0, w, h);
    this._ctx.globalCompositeOperation = 'source-over';

    const scale = this._state.scale;
    const speed = this._state.speed * 2;

    const c1 = this._state.color1;
    const c2 = this._state.color2;

    this._particles.forEach(p => {
      // Calculate noise value
      const timeOffset = this._time * 0.2;
      const n = simplex2(p.x * scale + timeOffset * 0.1, p.y * scale - timeOffset * 0.1);
      const angle = n * Math.PI * 4;

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;

      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      // Respawn logic
      if (p.age > p.life) {
        this._respawnParticle(p, w, h);
      } else {
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      // Add to grid count
      const col = Math.min(COLS - 1, Math.max(0, Math.floor(p.x / cellW)));
      const row = Math.min(ROWS - 1, Math.max(0, Math.floor(p.y / cellH)));
      gridCounts[row * COLS + col]++;

      // Draw particle
      const mix = (Math.sin(n * Math.PI) + 1) / 2;
      this._ctx.fillStyle = mix > 0.5 ? c1 : c2;
      this._ctx.beginPath();
      const opacity = 1 - (p.age / p.life);
      // Small size modulation - Increased per user request
      const size = (Math.random() * 2.5 + 1.5) * opacity;
      this._ctx.arc(p.x, p.y, Math.max(0, size), 0, Math.PI * 2);
      this._ctx.fill();
    });

    // --- Draw Grid on Background Canvas ---
    // Clear background canvas fully
    this._bgCtx.fillStyle = this._state.backgroundColor;
    this._bgCtx.fillRect(0, 0, w, h);

    // Draw active cells
    // Calculate max density based on area roughly
    const particlesPerCellAvg = this._state.particleCount / (ROWS * COLS);
    const maxDensityEstimate = Math.max(1, particlesPerCellAvg * 2);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const count = gridCounts[idx];

        // Calculate target intensity for this frame
        let targetIntensity = 0;
        if (count > 0) {
           targetIntensity = Math.min(1.0, count / maxDensityEstimate);
        }

        // TEMPORAL SMOOTHING: Lerp current intensity towards target
        // Factor 0.1 gives a slow smooth transition. 0.3 is snappier.
        this._gridIntensities[idx] += (targetIntensity - this._gridIntensities[idx]) * 0.1;

        const intensity = this._gridIntensities[idx];

        if (intensity > 0.01) {
          this._bgCtx.globalAlpha = intensity * 0.6; // Increased cap lightly since blur softens it
          this._bgCtx.fillStyle = c1;
          this._bgCtx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1); // +1 to avoid gaps
        }
      }
    }
    this._bgCtx.globalAlpha = 1.0;
  }

  _respawnParticle(p, w, h) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.age = 0;
    p.life = 100 + Math.random() * 200; // Vary life
  }
}

export default FlowFieldBackground;
