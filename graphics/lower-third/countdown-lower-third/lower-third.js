/**
 * Countdown Lower Third Module
 * Counts down to a target Unix time (seconds or milliseconds).
 */

const DEFAULT_STATE = {
  label: "Time Remaining",
  unixTime: Math.floor(Date.now() / 1000) + 3600,
  accentColor: "#00d9ff",
  backgroundOpacity: 0.18,
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: rgba(255, 255, 255, 0.98);
  --accent-color: #00d9ff;
  --bg-opacity: 0.18;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  left: max(5vw, 72px);
  bottom: calc(max(6vh, 72px) + env(safe-area-inset-bottom));
  will-change: transform;
}

.container {
  position: relative;
  padding: 26px 40px 22px;
  min-width: 280px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(0, 217, 255, var(--bg-opacity)), rgba(0, 0, 0, 0.35));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(18px);
  will-change: opacity, transform;
}

.label {
  font-size: clamp(16px, 1.1vw, 20px);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.timer {
  font-size: clamp(40px, 3.2vw, 56px);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--accent-color);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .container { transition: none; }
}
`;

class CountdownLowerThird extends HTMLElement {
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

    const container = document.createElement("div");
    container.className = "container";

    const label = document.createElement("div");
    label.className = "label";

    const timer = document.createElement("div");
    timer.className = "timer";

    container.append(label, timer);
    scene.append(container);
    root.append(style, scene);

    this._elements = { scene, container, label, timer };
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
    this._updateCountdown();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("800 50px Inter"),
        document.fonts.load("600 18px Inter"),
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
    this._updateCountdown();
    if (this._isVisible) {
      this._startTimer();
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { label, accentColor, backgroundOpacity } = this._state;
    this._elements.label.textContent = label || "";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }
    if (typeof backgroundOpacity === "number") {
      this.style.setProperty("--bg-opacity", String(backgroundOpacity));
    }
  }

  _resetState() {
    const { container } = this._elements;
    container.style.opacity = "0";
    container.style.transform = "translateY(18px)";
  }

  _cancelAnimations() {
    this._animations.forEach((anim) => anim.cancel && anim.cancel());
    this._animations = [];
  }

  _normalizeUnixTime(unixTime) {
    if (typeof unixTime !== "number") {
      return Date.now();
    }
    return unixTime < 1e12 ? unixTime * 1000 : unixTime;
  }

  _formatRemaining(ms) {
    const clamped = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const seconds = clamped % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  _updateCountdown() {
    const target = this._normalizeUnixTime(this._state.unixTime);
    const remaining = target - Date.now();
    this._elements.timer.textContent = this._formatRemaining(remaining);
  }

  _startTimer() {
    this._stopTimer();
    this._updateCountdown();
    this._timerId = setInterval(() => this._updateCountdown(), 1000);
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
      this._elements.container.style.opacity = "1";
      this._elements.container.style.transform = "translateY(0)";
      return Promise.resolve();
    }

    const anim = this._elements.container.animate(
      [
        { opacity: 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 450,
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

    const anim = this._elements.container.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(18px)" },
      ],
      {
        duration: 300,
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

export default CountdownLowerThird;
