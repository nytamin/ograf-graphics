/**
 * Statistic Counter Lower Third Module
 * Displays a single-number statistic that animates from 0 to the target on in-animation.
 */

const DEFAULT_STATE = {
  label: "Bridge Fasteners",
  value: 13240,
  unit: "nails",
  accentColor: "#ff1b6d",
  backgroundOpacity: 0.2,
  durationMs: 1200,
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: rgba(255, 255, 255, 0.98);
  --accent-color: #ff1b6d;
  --bg-opacity: 0.2;
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
  min-width: 320px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 27, 109, var(--bg-opacity)), rgba(0, 0, 0, 0.35));
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

.value {
  font-size: clamp(42px, 3.2vw, 60px);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--accent-color);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

.unit {
  font-size: clamp(18px, 1.2vw, 22px);
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12px;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .container { transition: none; }
}
`;

class StatisticCounterLowerThird extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._animations = [];
    this._rafId = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const container = document.createElement("div");
    container.className = "container";

    const label = document.createElement("div");
    label.className = "label";

    const valueRow = document.createElement("div");
    valueRow.className = "value-row";

    const value = document.createElement("div");
    value.className = "value";

    const unit = document.createElement("div");
    unit.className = "unit";

    valueRow.append(value, unit);
    container.append(label, valueRow);
    scene.append(container);
    root.append(style, scene);

    this._elements = { scene, container, label, value, unit };
    this._numberFormat = new Intl.NumberFormat();
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
    this._setValue(0);

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("800 56px Inter"),
        document.fonts.load("600 18px Inter"),
      ]).catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelCountUp();
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
      this._startCountUp();
      this._currentStep = targetStep;
    }

    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._cancelCountUp();
    await this._animateOut(skipAnimation);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    if (this._isVisible) {
      this._startCountUp();
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { label, unit, accentColor, backgroundOpacity } = this._state;
    this._elements.label.textContent = label || "";
    this._elements.unit.textContent = unit || "";

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

  _setValue(value) {
    const rounded = Math.round(value);
    this._elements.value.textContent = this._numberFormat.format(rounded);
  }

  _startCountUp() {
    this._cancelCountUp();
    const target = typeof this._state.value === "number" ? this._state.value : 0;
    const duration = Math.max(200, Number(this._state.durationMs) || 1200);
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this._setValue(target * eased);
      if (progress < 1) {
        this._rafId = requestAnimationFrame(tick);
      } else {
        this._rafId = null;
      }
    };

    this._rafId = requestAnimationFrame(tick);
  }

  _cancelCountUp() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
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
      this._setValue(this._state.value || 0);
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

export default StatisticCounterLowerThird;
