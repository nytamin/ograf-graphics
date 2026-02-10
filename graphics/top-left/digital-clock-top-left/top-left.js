/**
 * Digital Clock Top-Left Module
 * Displays the current time as HH:MM:SS.
 */

const DEFAULT_STATE = {
  label: "LIVE",
  accentColor: "#00ffb2",
  showLabel: true,
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: rgba(255, 255, 255, 0.98);
  --accent-color: #00ffb2;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  top: calc(max(3vh, 40px) + env(safe-area-inset-top));
  left: max(3vw, 40px);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(-10px);
  will-change: opacity, transform;
}

.label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: var(--accent-color);
}

.time {
  font-size: clamp(22px, 1.8vw, 28px);
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.98);
}

@media (prefers-reduced-motion: reduce) {
  .scene { transition: none; }
}
`;

class DigitalClockTopLeft extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timerId = null;
    this._animations = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const label = document.createElement("div");
    label.className = "label";

    const time = document.createElement("div");
    time.className = "time";

    scene.append(label, time);
    root.append(style, scene);

    this._elements = { scene, label, time };
  }

  connectedCallback() {
    this._resetState();
  }

  async load(params) {
    if (params.renderType !== "realtime") {
      return { statusCode: 400, statusMessage: "Non-realtime rendering is not supported." };
    }

    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    this._updateTime();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("800 26px Inter"),
        document.fonts.load("700 14px Inter"),
      ]).catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async dispose() {
    this._stopTimer();
    this._cancelAnimations();
    this._elements.scene.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const targetStep = this._resolveTargetStep(params);
    const skipAnimation = params?.skipAnimation === true;

    if (targetStep === undefined) {
      this._currentStep = undefined;
    } else {
      await this._animateIn(skipAnimation);
      this._startTimer();
      this._currentStep = targetStep;
    }

    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._stopTimer();
    await this._animateOut(skipAnimation);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    this._updateTime();
    if (this._isVisible) {
      this._startTimer();
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { label, accentColor, showLabel } = this._state;
    this._elements.label.textContent = label || "";
    this._elements.label.style.display = showLabel ? "block" : "none";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }
  }

  _resetState() {
    const { scene } = this._elements;
    scene.style.opacity = "0";
    scene.style.transform = "translateY(-10px)";
  }

  _cancelAnimations() {
    this._animations.forEach((anim) => anim.cancel && anim.cancel());
    this._animations = [];
  }

  _formatTime(date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  _updateTime() {
    this._elements.time.textContent = this._formatTime(new Date());
  }

  _startTimer() {
    this._stopTimer();
    this._updateTime();
    this._timerId = setInterval(() => this._updateTime(), 1000);
  }

  _stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  async _animateIn(skipAnimation) {
    if (this._isVisible) {
      return Promise.resolve();
    }

    this._isVisible = true;
    this._cancelAnimations();

    if (skipAnimation) {
      this._elements.scene.style.opacity = "1";
      this._elements.scene.style.transform = "translateY(0)";
      return Promise.resolve();
    }

    const anim = this._elements.scene.animate(
      [
        { opacity: 0, transform: "translateY(-10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 350,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "forwards",
      }
    );
    this._animations.push(anim);
    await anim.finished.catch(() => undefined);
  }

  async _animateOut(skipAnimation) {
    if (!this._isVisible) {
      return Promise.resolve();
    }

    this._isVisible = false;
    this._cancelAnimations();

    if (skipAnimation) {
      this._resetState();
      return Promise.resolve();
    }

    const anim = this._elements.scene.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-10px)" },
      ],
      {
        duration: 250,
        easing: "ease-in",
        fill: "forwards",
      }
    );
    this._animations.push(anim);
    await anim.finished.catch(() => undefined);

    this._resetState();
  }

  _resolveTargetStep(params) {
    const stepCount = 1;
    const goto = params?.goto;
    const delta = typeof params?.delta === "number" ? params.delta : 1;

    if (typeof goto === "number") {
      return goto >= stepCount ? undefined : Math.max(0, goto);
    }

    const current = typeof this._currentStep === "number" ? this._currentStep : -1;
    const target = current + delta;

    if (target >= stepCount) {
      return undefined;
    }

    return Math.max(0, target);
  }
}

export default DigitalClockTopLeft;
