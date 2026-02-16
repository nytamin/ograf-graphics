/**
 * Wave Interference Background
 * Abstract geometric waves moving across the screen, creating interference patterns.
 */

const DEFAULT_STATE = {
  colorStart: "#4b0082",
  colorEnd: "#0000ff",
  speed: 1.0,
  complexity: 5,
  amplitude: 100
};

class WaveInterferenceBackground extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isPlaying = false;
    this._rafId = null;
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
    this._state = { ...this._state, ...data };
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
    const w = this._width;
    const h = this._height;
    const ctx = this._ctx;

    // Clear with a very slight fade for trail effect if desired,
    // or just clear fully for crisp waves. Let's go for crisp but accumulated gradient feel
    // requires clearing.
    ctx.clearRect(0, 0, w, h);

    // Fill background with a base dark gradient derived from inputs
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, "#000000");
    bgGradient.addColorStop(1, "#101015");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    const { complexity, amplitude, colorStart, colorEnd } = this._state;

    // Use composite operation to make overlapping waves glow/blend
    ctx.globalCompositeOperation = 'hard-light'; //'screen' or 'overlay' or 'lighter'

    for (let i = 0; i < complexity; i++) {
      ctx.beginPath();

      const layerOffset = i * 500 + this._time * 50; // Offset each wave layer

      // Generate a filled wave shape
      // We'll draw a shape that spans the width, with top edge modulated by sine

      const yBase = h / 2 + (i - complexity/2) * (h/complexity * 0.5); // Spread vertically

      ctx.moveTo(0, h);
      ctx.lineTo(0, yBase);

      for (let x = 0; x <= w; x += 10) {
        // Superpose a few sines
        const ang1 = (x * 0.003) + (this._time * 0.5) + i;
        const ang2 = (x * 0.01) - (this._time * 0.3) + (i * 1.5);

        const y = yBase +
                  Math.sin(ang1) * amplitude +
                  Math.sin(ang2) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.closePath();

      // Gradient for this wave
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      const alpha = 0.3 + (0.5 / complexity); // Dynamic transparency

      // Convert hex to rgba for transparency if needed, or rely on composite
      // Let's just use the hex and globalAlpha
      ctx.globalAlpha = 0.5;
      grad.addColorStop(0, colorStart);
      grad.addColorStop(1, colorEnd);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  }
}

export default WaveInterferenceBackground;
