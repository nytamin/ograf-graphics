/**
 * OGraf Fireworks
 * Transparent-background canvas fireworks: rockets launch from the bottom of
 * frame, arc upward, and burst into realistic, physically simulated sparks.
 */

const DEFAULT_STATE = {
  intensity: 1.0,
  size: 1.0,
};

const PALETTES = [
  ["#ff3b3b", "#ffd23b", "#ffffff"],
  ["#3bb0ff", "#8effc1", "#ffffff"],
  ["#ff3bd8", "#c23bff", "#ffffff"],
  ["#ffb43b", "#ff6a3b", "#ffe9a8"],
  ["#3bffe0", "#3b7bff", "#ffffff"],
  ["#ffe93b", "#ffffff", "#ff9d3b"],
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

// Fades to the particle's own color at alpha 0, instead of black at alpha 0,
// so the gradient doesn't interpolate through a dark fringe on light backgrounds.
function hexToTransparent(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0)`;
}

class OgrafFireworks extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isPlaying = false;
    this._fadingOut = false;
    this._rafId = null;
    this._lastTime = 0;
    this._width = 1920;
    this._height = 1080;
    this._rockets = [];
    this._particles = [];
    this._nextLaunchAt = 0;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: none;
        overflow: hidden;
      }
      canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 500ms ease;
      }
      canvas.visible {
        opacity: 1;
      }
    `;
    root.appendChild(style);

    this._canvas = document.createElement("canvas");
    root.appendChild(this._canvas);
    this._ctx = this._canvas.getContext("2d");
  }

  connectedCallback() {
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this);
    this._onResize();
  }

  disconnectedCallback() {
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._stopLoop();
  }

  async load(params) {
    this._updateState(params.data);
    return { statusCode: 200 };
  }

  async dispose() {
    this._stopLoop();
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._isPlaying = true;
    this._fadingOut = false;
    this._rockets = [];
    this._particles = [];
    this._nextLaunchAt = 0;
    this._canvas.classList.add("visible");
    this._lastTime = performance.now();
    if (!this._rafId) this._loop();
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    this._isPlaying = false;
    this._fadingOut = true;
    this._canvas.classList.remove("visible");
    // Let the current bursts finish rendering briefly, then fully stop.
    setTimeout(() => {
      this._stopLoop();
      this._rockets = [];
      this._particles = [];
    }, 600);
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._updateState(params.data);
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async goToTime() {
    return { statusCode: 200 };
  }

  async setActionsSchedule() {
    return { statusCode: 200 };
  }

  _updateState(data) {
    if (!data) return;
    this._state = { ...this._state, ...data };
  }

  _onResize() {
    const rect = this.getBoundingClientRect();
    this._width = rect.width || this._width;
    this._height = rect.height || this._height;
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width = this._width * dpr;
    this._canvas.height = this._height * dpr;
    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _stopLoop() {
    this._isPlaying = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _loop() {
    this._rafId = requestAnimationFrame(() => this._loop());
    const now = performance.now();
    let dt = (now - this._lastTime) / 1000;
    this._lastTime = now;
    if (dt > 0.1) dt = 0.1;

    if (this._isPlaying && !this._fadingOut) {
      this._maybeLaunch(now);
    }
    this._updateRockets(dt);
    this._updateParticles(dt);
    this._draw();

    if (
      this._fadingOut &&
      this._rockets.length === 0 &&
      this._particles.length === 0
    ) {
      this._stopLoop();
    }
  }

  _maybeLaunch(now) {
    if (now < this._nextLaunchAt) return;
    const intensity = Math.max(this._state.intensity, 0.1);
    this._launchRocket();
    // Occasionally launch a quick second rocket for a fuller show.
    if (Math.random() < 0.35 * intensity) this._launchRocket();
    const baseInterval = 900 / intensity;
    this._nextLaunchAt = now + rand(baseInterval * 0.5, baseInterval * 1.3);
  }

  _launchRocket() {
    const h = this._height;
    const w = this._width;
    const targetY = rand(h * 0.14, h * 0.5);
    this._rockets.push({
      x: rand(w * 0.15, w * 0.85),
      y: h + 10,
      vx: rand(-18, 18),
      vy: -rand(h * 0.62, h * 0.82),
      targetY,
      trail: [],
      colors: pick(PALETTES),
    });
  }

  _updateRockets(dt) {
    const gravity = this._height * 0.32;
    for (let i = this._rockets.length - 1; i >= 0; i--) {
      const r = this._rockets[i];
      r.trail.push({ x: r.x, y: r.y, life: 1 });
      if (r.trail.length > 10) r.trail.shift();
      for (const t of r.trail) t.life -= dt * 3.2;
      r.trail = r.trail.filter((t) => t.life > 0);

      r.vy += gravity * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;

      if (r.vy >= 0 || r.y <= r.targetY) {
        this._explode(r);
        this._rockets.splice(i, 1);
      } else if (r.y > this._height + 20) {
        this._rockets.splice(i, 1);
      }
    }
  }

  _explode(rocket) {
    const intensity = Math.max(this._state.intensity, 0.1);
    const size = Math.max(this._state.size, 0.1);
    const count = Math.round(rand(70, 120) * intensity);
    const speedBase = rand(this._height * 0.16, this._height * 0.24);
    const shimmer = Math.random() < 0.5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.12, 0.12);
      const speed = speedBase * rand(0.55, 1.05);
      this._particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: pick(rocket.colors),
        life: 1,
        decay: rand(0.55, 0.95),
        size: rand(1.4, 2.6) * size,
        shimmer,
        trail: [],
      });
    }
    // A few slow, glittering embers that linger and drift.
    const emberCount = Math.round(rand(10, 18) * intensity);
    for (let i = 0; i < emberCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = speedBase * rand(0.15, 0.4);
      this._particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: pick(rocket.colors),
        life: 1,
        decay: rand(0.28, 0.45),
        size: rand(1, 1.8) * size,
        shimmer: true,
        trail: [],
      });
    }
  }

  _updateParticles(dt) {
    const gravity = this._height * 0.18;
    const drag = 1 - 1.1 * dt;
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.trail.push({ x: p.x, y: p.y, life: p.life });
      if (p.trail.length > 5) p.trail.shift();

      p.vx *= Math.max(drag, 0.8);
      p.vy = p.vy * Math.max(drag, 0.8) + gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0 || p.y > this._height + 40) {
        this._particles.splice(i, 1);
      }
    }
  }

  _draw() {
    const ctx = this._ctx;
    const w = this._width;
    const h = this._height;
    const size = Math.max(this._state.size, 0.1);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    // Rocket trails (rising sparks).
    for (const r of this._rockets) {
      ctx.strokeStyle = "rgba(255,235,190,0.85)";
      ctx.lineWidth = 2 * size;
      ctx.beginPath();
      for (let i = 0; i < r.trail.length; i++) {
        const t = r.trail[i];
        ctx.globalAlpha = Math.max(t.life, 0) * 0.8;
        if (i === 0) ctx.moveTo(t.x, t.y);
        else ctx.lineTo(t.x, t.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillStyle = "#fff6d8";
      ctx.arc(r.x, r.y, 2.4 * size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Burst particles with fading trails and a glowing head.
    for (const p of this._particles) {
      const alpha = Math.max(p.life, 0);
      const flicker = p.shimmer ? 0.55 + Math.random() * 0.45 : 1;

      if (p.trail.length > 1) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        for (let i = 0; i < p.trail.length; i++) {
          const t = p.trail[i];
          const a = (i / p.trail.length) * alpha * flicker * 0.7;
          ctx.globalAlpha = Math.max(a, 0);
          if (i === 0) ctx.moveTo(t.x, t.y);
          else ctx.lineTo(t.x, t.y);
        }
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.globalAlpha = alpha * flicker;
      const glow = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.size * 3.2
      );
      glow.addColorStop(0, p.color);
      glow.addColorStop(1, hexToTransparent(p.color));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

export default OgrafFireworks;
