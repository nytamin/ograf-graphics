/**
 * Material Design Multi-Step News Module
 * Renders a multi-step news story with Material Design principles.
 * Each step displays different content: headline, details, expert quote, and call-to-action.
 */

const DEFAULT_STATE = {
  step1Headline: "BREAKING NEWS",
  step1Title: "Major Climate Report Released",
  step2Title: "Key Findings",
  step2Details: [
    "Global temperatures rose 1.1°C since pre-industrial era",
    "Arctic ice declining at accelerating rate",
    "100+ species face extinction risk",
  ],
  step3Title: "Expert Analysis",
  step3Quote:
    '"This is a critical moment for global action. The science is clear and the time to act is now."',
  step3Expert: "Dr. Jane Science, Climate Research Institute",
  step4Title: "What You Can Do",
  step4Text:
    "Learn more about climate action and how you can make a difference. Visit our climate hub for resources and initiatives.",
  primaryColor: "#1976d2",
  accentColor: "#d32f2f",
  step1Icon: "alert",
  step2Icon: "chart",
  step3Icon: "globe",
  step4Icon: "check",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Roboto", sans-serif;
  --primary: #1976d2;
  --accent: #d32f2f;
}

* {
  box-sizing: border-box;
}

.news-container {
  position: absolute;
  inset: 0;
  opacity: 0;
  will-change: opacity;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d47a1 0%, rgba(0, 0, 0, 0.85) 100%);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 1200px;
  transform: translateY(20px);
  opacity: 0;
  will-change: transform, opacity;
}

.step-content {
  display: none;
}

.step-content.active {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
}

.step-icon {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.icon-svg {
  width: 70%;
  height: 70%;
  fill: #ffffff;
}

.text-content {
  flex: 1;
  color: white;
}

.step-label {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
}

.step-title {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  margin: 0;
}

.step-subtitle {
  font-size: 24px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin: 16px 0 0 0;
  line-height: 1.4;
}

.step-content.step2 .step-header {
  flex-direction: column;
  align-items: flex-start;
}

.step-content.step2 .step-icon {
  align-self: flex-start;
}

.details-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
}

.detail-bullet {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 8px;
}

.quote-box {
  background: rgba(255, 255, 255, 0.1);
  border-left: 6px solid var(--accent);
  padding: 32px;
  border-radius: 8px;
  margin-top: 24px;
}

.quote-text {
  font-size: 28px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.quote-attribution {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-style: normal;
  font-weight: 500;
}

.cta-text {
  font-size: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  margin: 24px 0 0 0;
}

.step-indicator {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: background 0.3s ease;
}

.indicator-dot.active {
  background: var(--accent);
  width: 32px;
  border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .news-container,
  .content-wrapper {
    transition: none;
  }
}
`;

class MaterialDesignMultiStepNews extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._contentAnimation = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "news-container";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content-wrapper";

    // Create step containers
    for (let i = 1; i <= 4; i++) {
      const stepDiv = document.createElement("div");
      stepDiv.className = `step-content step${i}`;
      stepDiv.dataset.step = i - 1;
      contentWrapper.appendChild(stepDiv);
    }

    const indicator = document.createElement("div");
    indicator.className = "step-indicator";
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement("div");
      dot.className = "indicator-dot";
      dot.dataset.step = i;
      indicator.appendChild(dot);
    }

    container.appendChild(contentWrapper);
    container.appendChild(indicator);
    root.appendChild(style);
    root.appendChild(container);

    this._elements = {
      container,
      contentWrapper,
      steps: Array.from(contentWrapper.querySelectorAll(".step-content")),
      indicatorDots: Array.from(indicator.querySelectorAll(".indicator-dot")),
    };
  }

  connectedCallback() {
    this._elements.container.style.opacity = "0";
    this._elements.contentWrapper.style.transform = "translateY(20px)";
    this._elements.contentWrapper.style.opacity = "0";
  }

  async load(params) {
    if (params.renderType !== "realtime") {
      return {
        statusCode: 400,
        statusMessage: "Non-realtime rendering is not supported.",
      };
    }

    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._renderAllSteps();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("700 56px Roboto"),
        document.fonts.load("400 20px Roboto"),
        document.fonts.load("300 24px Roboto"),
      ]).catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.container.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const targetStep = this._resolveTargetStep(params);
    const skipAnimation = params?.skipAnimation === true;

    if (targetStep === undefined) {
      // Beyond last step - trigger stopAction behavior
      await this._animateTo(false, skipAnimation);
      this._currentStep = undefined;
    } else {
      await this._animateTo(true, skipAnimation);
      this._currentStep = targetStep;
      this._updateStepDisplay();
    }

    return {
      statusCode: 200,
      currentStep: this._currentStep,
    };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateTo(false, skipAnimation);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._renderAllSteps();
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    // Map time to step based on time progression
    // Each step gets an equal time allocation
    const totalDuration = 4000; // 4 seconds total for all 4 steps
    const stepDuration = totalDuration / 4; // 1 second per step
    const time = params?.time || 0;

    const targetStep = Math.min(Math.floor(time / stepDuration), 3);

    if (targetStep !== this._currentStep) {
      this._currentStep = targetStep;
      this._updateStepDisplay();
    }

    return { statusCode: 200, currentStep: this._currentStep };
  }

  async setActionsSchedule(params) {
    // Store the actions schedule for potential future use
    this._actionsSchedule = params?.actions || [];
    return { statusCode: 200 };
  }

  _renderAllSteps() {
    const { steps } = this._elements;

    // Step 1: Breaking News
    steps[0].innerHTML = this._createStep1();

    // Step 2: Key Details
    steps[1].innerHTML = this._createStep2();

    // Step 3: Expert Analysis
    steps[2].innerHTML = this._createStep3();

    // Step 4: Call to Action
    steps[3].innerHTML = this._createStep4();

    this._applyStateVariables();
  }

  _createStep1() {
    const { step1Headline, step1Title, step1Icon } = this._state;
    const icon = this._getIconSVG(step1Icon);

    return `
      <div class="step-header">
        <div class="step-icon">${icon}</div>
        <div class="text-content">
          <div class="step-label">${step1Headline}</div>
          <h1 class="step-title">${step1Title}</h1>
        </div>
      </div>
    `;
  }

  _createStep2() {
    const { step2Title, step2Details, step2Icon } = this._state;
    const icon = this._getIconSVG(step2Icon);
    const detailsHTML = step2Details
      .map(
        (detail) =>
          `<li class="detail-item"><div class="detail-bullet"></div><span>${detail}</span></li>`
      )
      .join("");

    return `
      <div class="step-header">
        <div class="step-icon">${icon}</div>
      </div>
      <div class="text-content">
        <h2 class="step-title">${step2Title}</h2>
        <ul class="details-list">${detailsHTML}</ul>
      </div>
    `;
  }

  _createStep3() {
    const { step3Title, step3Quote, step3Expert, step3Icon } = this._state;
    const icon = this._getIconSVG(step3Icon);

    return `
      <div class="step-header">
        <div class="step-icon">${icon}</div>
        <div class="text-content">
          <h2 class="step-title">${step3Title}</h2>
        </div>
      </div>
      <div class="quote-box">
        <p class="quote-text">${step3Quote}</p>
        <div class="quote-attribution">${step3Expert}</div>
      </div>
    `;
  }

  _createStep4() {
    const { step4Title, step4Text, step4Icon } = this._state;
    const icon = this._getIconSVG(step4Icon);

    return `
      <div class="step-header">
        <div class="step-icon">${icon}</div>
        <div class="text-content">
          <h2 class="step-title">${step4Title}</h2>
          <p class="cta-text">${step4Text}</p>
        </div>
      </div>
    `;
  }

  _getIconSVG(iconType) {
    const icons = {
      alert: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L1 21h22L12 1zm0 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm2-7h-4v6h4v-6z"/></svg>`,
      chart: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>`,
      globe: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h3V9h4v3h3l-5 5z"/></svg>`,
      check: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
      link: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
      people: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.5 1.6 2.5 3.27 2.5 5.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
    };

    return icons[iconType] || icons.alert;
  }

  _applyStateVariables() {
    const { primaryColor, accentColor } = this._state;

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }

    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }
  }

  _updateStepDisplay() {
    const { steps, indicatorDots } = this._elements;

    steps.forEach((step) => step.classList.remove("active"));
    indicatorDots.forEach((dot) => dot.classList.remove("active"));

    if (typeof this._currentStep === "number" && this._currentStep < steps.length) {
      steps[this._currentStep].classList.add("active");
      indicatorDots[this._currentStep].classList.add("active");
    }
  }

  _resolveTargetStep(params) {
    const stepCount = 4;
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

  _animateTo(visible, skipAnimation) {
    if (this._isVisible === visible) {
      return Promise.resolve();
    }

    this._isVisible = visible;
    const container = this._elements.container;
    const contentWrapper = this._elements.contentWrapper;

    if (this._contentAnimation) {
      this._contentAnimation.cancel();
      this._contentAnimation = null;
    }

    if (skipAnimation) {
      container.style.opacity = visible ? "1" : "0";
      contentWrapper.style.transform = visible ? "translateY(0)" : "translateY(20px)";
      contentWrapper.style.opacity = visible ? "1" : "0";
      return Promise.resolve();
    }

    const contentAnimation = contentWrapper.animate(
      [
        {
          transform: visible ? "translateY(20px)" : "translateY(0)",
          opacity: visible ? 0 : 1,
        },
        {
          transform: visible ? "translateY(0)" : "translateY(20px)",
          opacity: visible ? 1 : 0,
        },
      ],
      {
        duration: 500,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    const bgAnimation = container.animate([{ opacity: visible ? 0 : 1 }, { opacity: visible ? 1 : 0 }], {
      duration: 400,
      easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      fill: "forwards",
    });

    this._contentAnimation = contentAnimation;

    return Promise.all([bgAnimation.finished, contentAnimation.finished])
      .catch(() => undefined)
      .finally(() => {
        container.style.opacity = visible ? "1" : "0";
        contentWrapper.style.transform = visible ? "translateY(0)" : "translateY(20px)";
        contentWrapper.style.opacity = visible ? "1" : "0";
        if (this._contentAnimation === contentAnimation) {
          this._contentAnimation = null;
        }
      });
  }
}

export default MaterialDesignMultiStepNews;
