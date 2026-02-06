/**
 * Material Design Goal Bar Module
 * Progress bar for subscription and donation goals.
 */

const DEFAULT_STATE = {
  goalTitle: "Sub Goal",
  currentProgress: 45,
  maxProgress: 100,
  unit: "subs",
  position: "top",
  primaryColor: "#1976d2",
  accentColor: "#4caf50",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Roboto", sans-serif;
  --primary: #1976d2;
  --accent: #4caf50;
}

* {
  box-sizing: border-box;
}

.goal-bar-container {
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  padding: 16px 24px;
  opacity: 0;
  will-change: opacity;
}

.goal-bar-container.top {
  top: 0;
  background: linear-gradient(to bottom, rgba(25, 118, 210, 0.1), transparent);
}

.goal-bar-container.bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(25, 118, 210, 0.1), transparent);
}

.goal-bar {
  max-width: 600px;
  margin: 0 auto;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.goal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.goal-progress-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 10px;
  width: 45%;
  transition: width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.milestone-marker {
  position: absolute;
  top: 0;
  height: 100%;
  width: 3px;
  background: white;
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
  .progress-fill::after {
    animation: none;
  }
}
`;

class MaterialDesignGoalBar extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "goal-bar-container";

    const goalBar = document.createElement("div");
    goalBar.className = "goal-bar";

    const header = document.createElement("div");
    header.className = "goal-header";

    const title = document.createElement("h3");
    title.className = "goal-title";

    const progressText = document.createElement("p");
    progressText.className = "goal-progress-text";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";

    header.append(title, progressText);
    progressBar.appendChild(progressFill);
    goalBar.append(header, progressBar);
    container.appendChild(goalBar);
    root.append(style, container);

    this._elements = {
      container,
      title,
      progressText,
      progressFill,
      progressBar,
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.container.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._isVisible = true;

    if (skipAnimation) {
      this._elements.container.style.opacity = "1";
    } else {
      this._elements.container.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      });
    }

    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._isVisible = false;

    if (skipAnimation) {
      this._elements.container.style.opacity = "0";
    } else {
      this._elements.container.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      });
    }

    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { goalTitle, currentProgress, maxProgress, unit, position, primaryColor, accentColor } = this._state;

    this._elements.title.textContent = goalTitle;
    this._elements.progressText.textContent = `${currentProgress} / ${maxProgress} ${unit}`;

    const percentage = Math.min((currentProgress / maxProgress) * 100, 100);
    this._elements.progressFill.style.width = `${percentage}%`;

    this._elements.container.className = `goal-bar-container ${position}`;

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }
  }
}

export default MaterialDesignGoalBar;
