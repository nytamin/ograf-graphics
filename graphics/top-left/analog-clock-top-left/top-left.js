/**
 * Analog Clock Top-Left Module
 * Displays the current time as an analog clock.
 */

const DEFAULT_STATE = {
  ringColor: "#ffffff",
  handColor: "#00d9ff",
  accentColor: "#ff1b6d",
  size: 88,
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: rgba(255, 255, 255, 0.98);
  --ring-color: #ffffff;
  --hand-color: #00d9ff;
  --accent-color: #ff1b6d;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  top: calc(max(3vh, 40px) + env(safe-area-inset-top));
  left: max(3vw, 40px);
  display: grid;
  place-items: center;
  width: var(--clock-size);
  height: var(--clock-size);
  opacity: 0;
  transform: translateY(-10px);
  will-change: opacity, transform;
}

.clock {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--ring-color);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
}

.hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: bottom center;
  transform: translateX(-50%) rotate(0deg);
  background: var(--hand-color);
  border-radius: 999px;
}

.hand.hour {
  width: 4px;
  height: 28%;
  background: var(--hand-color);
}

.hand.minute {
  width: 3px;
  height: 36%;
  background: var(--hand-color);
}

.hand.second {
  width: 2px;
  height: 40%;
  background: var(--accent-color);
}

.center-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(255, 27, 109, 0.6);
}

.tick {
  position: absolute;
  width: 2px;
  height: 6px;
  background: var(--ring-color);
  opacity: 0.7;
  top: 6px;
  left: 50%;
  transform-origin: center calc(100% + 32px);
}

@media (prefers-reduced-motion: reduce) {
  .scene { transition: none; }
}
`;

class AnalogClockTopLeft extends HTMLElement {
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

    const clock = document.createElement("div");
    clock.className = "clock";

    const hourHand = document.createElement("div");
    hourHand.className = "hand hour";

    const minuteHand = document.createElement("div");
    minuteHand.className = "hand minute";

    const secondHand = document.createElement("div");
    secondHand.className = "hand second";

    for (let i = 0; i < 12; i += 1) {
      const tick = document.createElement("div");
      tick.className = "tick";
      tick.style.transform = `translateX(-50%) rotate(${i * 30}deg)`;
      clock.append(tick);
    }

    const centerDot = document.createElement("div");
    centerDot.className = "center-dot";

    clock.append(hourHand, minuteHand, secondHand, centerDot);
    scene.append(clock);
    root.append(style, scene);

    this._elements = { scene, clock, hourHand, minuteHand, secondHand };
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
    this._updateClock();

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
    this._updateClock();
    if (this._isVisible) {
      this._startTimer();
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { ringColor, handColor, accentColor, size } = this._state;

    if (ringColor) {
      this.style.setProperty("--ring-color", ringColor);
    }
    if (handColor) {
      this.style.setProperty("--hand-color", handColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }
    const sizePx = Math.max(56, Number(size) || 88);
    this.style.setProperty("--clock-size", `${sizePx}px`);
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

  _updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secondAngle = seconds * 6;
    const minuteAngle = minutes * 6 + seconds * 0.1;
    const hourAngle = hours * 30 + minutes * 0.5;

    this._elements.secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
    this._elements.minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    this._elements.hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
  }

  _startTimer() {
    this._stopTimer();
    this._updateClock();
    this._timerId = setInterval(() => this._updateClock(), 1000);
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

export default AnalogClockTopLeft;
