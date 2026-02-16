/**
 * Digital Circuit Background
 * A high-tech grid animation with digital signals traveling along circuit paths.
 */

const DEFAULT_STATE = {
  gridColor: "#1a1a2e",
  signalColor: "#00d2ff",
  backgroundColor: "#050510",
  speed: 1.0,
  gridDensity: 40
};

class DigitalCircuitBackground extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isPlaying = false;
    this._rafId = null;
    this._width = 1920;
    this._height = 1080;
    this._signals = [];
    this._cols = 0;
    this._rows = 0;
    this._cellSize = 0;

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
      }
    `;
    shadow.appendChild(style);

    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    shadow.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
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
    this._initGrid();
    return { statusCode: 200 };
  }

  async dispose() {
    this.stopAction();
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._isPlaying = true;
    this._canvas.style.opacity = '1';
    this._lastTime = performance.now();
    this._loop();
    return { statusCode: 200 };
  }

  async stopAction(params) {
    this._isPlaying = false;
    this._canvas.style.opacity = '0';
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
    const oldDensity = this._state.gridDensity;
    this._state = { ...this._state, ...data };



    if (this._state.gridDensity !== oldDensity) {
      this._initGrid();
    }
  }

  _onResize() {
    const rect = this.getBoundingClientRect();
    this._width = rect.width;
    this._height = rect.height;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width = this._width * dpr;
    this._canvas.height = this._height * dpr;
    this._ctx.scale(dpr, dpr);

    this._initGrid();
  }

  _initGrid() {
    // Determine cell size based on density (cells per width)
    this._cellSize = this._width / this._state.gridDensity;
    this._cols = Math.ceil(this._width / this._cellSize) + 1;
    this._rows = Math.ceil(this._height / this._cellSize) + 1;
    this._signals = [];
  }

  _spawnSignal() {
    // Pick a random grid point
    const cx = Math.floor(Math.random() * this._cols);
    const cy = Math.floor(Math.random() * this._rows);

    // Pick a random direction (0: up, 1: right, 2: down, 3: left)
    const dir = Math.floor(Math.random() * 4);

    this._signals.push({
      cx, cy, // Current grid pos
      tx: cx, ty: cy, // Target grid pos
      progress: 0,
      dir,
      life: 1.0, // Opacity/Life
      history: [], // For trailing effect
      speedVariance: 0.5 + Math.random() // Slight speed variation
    });
  }

  _loop() {
    if (!this._isPlaying) return;

    this._rafId = requestAnimationFrame(() => this._loop());

    const now = performance.now();
    const dt = (now - this._lastTime) * 0.001; // delta time in seconds
    this._lastTime = now;

    // Spawn signals occasionally
    // Scale spawn rate with grid size
    const maxSignals = this._cols * this._rows * 0.05; // 5% occupation max
    if (this._signals.length < maxSignals && Math.random() < 0.1) {
      this._spawnSignal();
    }

    this._updateSignals(dt);
    this._draw();
  }

  _updateSignals(dt) {
    const speedBase = this._state.speed * 5.0; // Grid cells per second base

    for (let i = this._signals.length - 1; i >= 0; i--) {
      const s = this._signals[i];
      const moveSpeed = speedBase * s.speedVariance;

      s.progress += dt * moveSpeed;
      s.life -= dt * 0.2; // Slowly fade out

      if (s.progress >= 1.0) {
        // Reached target node
        s.progress = 0;

        // Add current segment to history
        s.history.push({x: s.cx, y: s.cy, tx: s.tx, ty: s.ty, age: 0 });
        if (s.history.length > 5) s.history.shift();

        s.cx = s.tx;
        s.cy = s.ty;

        // Decide next move
        // 80% chance to continue straight, 20% to turn
        if (Math.random() < 0.2) {
          const turn = Math.random() < 0.5 ? 1 : 3; // +1 (right) or +3 (left) effectively
          s.dir = (s.dir + turn) % 4;
        }

        switch (s.dir) {
          case 0: s.ty = s.cy - 1; break; // Up
          case 1: s.tx = s.cx + 1; break; // Right
          case 2: s.ty = s.cy + 1; break; // Down
          case 3: s.tx = s.cx - 1; break; // Left
        }

        // Kill if out of bounds or life ended
        if (s.tx < 0 || s.tx >= this._cols || s.ty < 0 || s.ty >= this._rows || s.life <= 0) {
          this._signals.splice(i, 1);
        }
      }
    }
  }

  _draw() {
    const w = this._width;
    const h = this._height;
    const ctx = this._ctx;
    const cs = this._cellSize;

    // Clear
    ctx.fillStyle = this._state.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // Draw Grid (Faint)
    ctx.strokeStyle = this._state.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Verticals
    for (let col = 0; col <= this._cols; col++) {
      ctx.moveTo(col * cs, 0);
      ctx.lineTo(col * cs, h);
    }
    // Horizontals
    for (let row = 0; row <= this._rows; row++) {
      ctx.moveTo(0, row * cs);
      ctx.lineTo(w, row * cs);
    }
    ctx.stroke();

    // Draw Signals
    ctx.lineCap = 'square';
    this._signals.forEach(s => {
      const alpha = Math.max(0, s.life);
      ctx.strokeStyle = this._state.signalColor;

      // Draw head
      const hx = s.cx * cs + (s.tx - s.cx) * cs * s.progress;
      const hy = s.cy * cs + (s.ty - s.cy) * cs * s.progress;

      // Draw Head Glow
      ctx.shadowColor = this._state.signalColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this._state.signalColor;
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw active segment
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(s.cx * cs, s.cy * cs);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Draw history
      ctx.lineWidth = 2;
      for (let i = 0; i < s.history.length; i++) {
        const seg = s.history[i];
        const segAlpha = alpha * ((i + 1) / (s.history.length + 1)) * 0.5;
        ctx.globalAlpha = segAlpha;
        ctx.beginPath();
        ctx.moveTo(seg.x * cs, seg.y * cs);
        ctx.lineTo(seg.tx * cs, seg.ty * cs);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    });
  }
}

export default DigitalCircuitBackground;
