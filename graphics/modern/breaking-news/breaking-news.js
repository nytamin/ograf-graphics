
const DEFAULT_STATE = {
  headline: "BREAKING NEWS",
  subheadline: "Developing story: Details emerging from the capital",
  themeColor: "#d32f2f",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Impact", "Arial Black", sans-serif;
  --theme: #d32f2f;
  --text-color: #ffffff;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  will-change: opacity;
}

.container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transform: scale(0.8);
  will-change: transform;
}

.alert-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 60px;
  background: var(--theme);
  color: var(--text-color);
  font-size: 80px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
}

.alert-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.1) 10px,
    rgba(0, 0, 0, 0.1) 20px
  );
  animation: scroll-stripes 2s linear infinite;
}

@keyframes scroll-stripes {
  from { background-position: 0 0; }
  to { background-position: 50px 0; }
}

.subheadline-box {
  background: #000;
  color: #fff;
  padding: 10px 40px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  font-size: 32px;
  text-transform: uppercase;
  transform: translateY(-20px);
  opacity: 0;
  clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 4px solid var(--theme);
  opacity: 0;
  z-index: -1;
  pointer-events: none;
}
`;

class BreakingNewsGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;
    this._animations = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const container = document.createElement("div");
    container.className = "container";

    const pulseRing = document.createElement("div");
    pulseRing.className = "pulse-ring";

    const alertBox = document.createElement("div");
    alertBox.className = "alert-box";

    const alertText = document.createElement("span");
    alertText.className = "alert-text";
    alertBox.appendChild(alertText);

    const subBox = document.createElement("div");
    subBox.className = "subheadline-box";

    container.append(pulseRing, alertBox, subBox);
    scene.append(container);
    root.append(style, scene);

    this._elements = { scene, container, alertText, subBox, pulseRing };
  }

  connectedCallback() {}

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateIn(skip);
    this._currentStep = 1;
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateOut(skip);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  _applyState() {
     const { headline, subheadline, themeColor } = this._state;
     this._elements.alertText.textContent = headline;
     this._elements.subBox.textContent = subheadline;
     if (themeColor) {
         this.style.setProperty("--theme", themeColor);
     }
  }

  _cancelAnimations() {
      this._animations.forEach(a => a.cancel());
      this._animations = [];
  }

  async _animateIn(skip) {
      if (this._isVisible) return;
      this._isVisible = true;

      const { scene, container, subBox, pulseRing } = this._elements;

      if (skip) {
          scene.style.opacity = "1";
          container.style.transform = "scale(1)";
          subBox.style.opacity = "1";
          subBox.style.transform = "translateY(0)";
          return;
      }

      this._cancelAnimations();

      scene.style.opacity = "1";

      const mainAnim = container.animate([
          { transform: "scale(2)", opacity: 0 },
          { transform: "scale(1)", opacity: 1 }
      ], {
          duration: 400,
          easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          fill: "forwards"
      });
      this._animations.push(mainAnim);

      const subAnim = subBox.animate([
          { transform: "translateY(-50px)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 }
      ], {
          duration: 300,
          delay: 200,
          easing: "ease-out",
          fill: "forwards"
      });
      this._animations.push(subAnim);

      const pulseAnim = pulseRing.animate([
          { transform: "translate(-50%, -50%) scale(1)", opacity: 0.8, borderWidth: "4px" },
          { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0, borderWidth: "0px" }
      ], {
          duration: 1500,
          iterations: Infinity
      });
      this._animations.push(pulseAnim);

      return mainAnim.finished;
  }

  async _animateOut(skip) {
      if (!this._isVisible) return;
      this._isVisible = false;

      const { scene, container } = this._elements;

      if (skip) {
          scene.style.opacity = "0";
          this._cancelAnimations();
          return;
      }

      const outAnim = container.animate([
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(0.8)", opacity: 0 }
      ], {
          duration: 200,
          easing: "ease-in",
          fill: "forwards"
      });
      this._animations.push(outAnim);

      await outAnim.finished;
      scene.style.opacity = "0";
      this._cancelAnimations();
  }
}

export default BreakingNewsGraphic;
