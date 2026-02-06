/**
 * Material Design Alert Widget Module
 * Animated alert for follows, subscriptions, donations, and raids.
 */

const DEFAULT_STATE = {
  alertType: "follow",
  userName: "StreamUser",
  message: "followed the channel!",
  displayDuration: 5,
  primaryColor: "#1976d2",
  accentColor: "#ffa726",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Roboto", sans-serif;
  --primary: #1976d2;
  --accent: #ffa726;
}

* {
  box-sizing: border-box;
}

.alert-container {
  position: absolute;
  top: 24px;
  right: 24px;
  opacity: 0;
  transform: translateX(100px);
  will-change: opacity, transform;
}

.alert-box {
  background: white;
  border-radius: 20px;
  padding: 40px 60px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 32px;
  min-width: 500px;
}

.alert-icon {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-svg {
  width: 60%;
  height: 60%;
  fill: white;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.alert-message {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
  margin: 0;
}

.alert-subtext {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 6px;
  width: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 0 0 20px 20px;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .alert-container {
    transition: none;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(0);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(0);
    }
  }
}
`;

class MaterialDesignAlertWidget extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._alertTimeout = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "alert-container";

    const box = document.createElement("div");
    box.className = "alert-box";

    const icon = document.createElement("div");
    icon.className = "alert-icon";

    const content = document.createElement("div");
    content.className = "alert-content";

    const type = document.createElement("div");
    type.className = "alert-type";

    const message = document.createElement("h2");
    message.className = "alert-message";

    const subtext = document.createElement("p");
    subtext.className = "alert-subtext";

    const accentLine = document.createElement("div");
    accentLine.className = "accent-line";

    content.append(type, message, subtext);
    box.append(icon, content, accentLine);
    container.appendChild(box);
    root.append(style, container);

    this._elements = {
      container,
      icon,
      type,
      message,
      subtext,
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    return { statusCode: 200 };
  }

  async dispose() {
    if (this._alertTimeout) {
      clearTimeout(this._alertTimeout);
    }
    this._elements.container.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._displayAlert(skipAnimation);
    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;

    if (this._alertTimeout) {
      clearTimeout(this._alertTimeout);
    }

    if (skipAnimation) {
      this._elements.container.style.opacity = "0";
      this._elements.container.style.transform = "translateX(100px) scale(0.9)";
    } else {
      const outAnimation = this._elements.container.animate(
        [
          { opacity: 1, transform: "translateX(0) scale(1)" },
          { opacity: 0, transform: "translateX(100px) scale(0.9)" },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
          fill: "forwards",
        }
      );

      await outAnimation.finished.catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _displayAlert(skipAnimation) {
    const { alertType, userName, message, displayDuration, primaryColor, accentColor } = this._state;

    this._elements.type.textContent = alertType.toUpperCase();
    this._elements.message.textContent = userName;
    this._elements.subtext.textContent = message;

    this._elements.icon.innerHTML = this._getAlertIcon(alertType);

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }

    if (skipAnimation) {
      this._elements.container.style.opacity = "1";
      this._elements.container.style.transform = "translateX(0) scale(1)";
    } else {
      const animation = this._elements.container.animate(
        [
          { opacity: 0, transform: "translateX(100px) scale(0.9)" },
          { opacity: 1, transform: "translateX(0) scale(1)" },
        ],
        {
          duration: 400,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
          fill: "forwards",
        }
      );

      animation.finished.catch(() => undefined);
    }

    if (this._alertTimeout) {
      clearTimeout(this._alertTimeout);
    }

    this._alertTimeout = setTimeout(() => {
      const outAnimation = this._elements.container.animate(
        [
          { opacity: 1, transform: "translateX(0) scale(1)" },
          { opacity: 0, transform: "translateX(100px) scale(0.9)" },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
          fill: "forwards",
        }
      );

      outAnimation.finished.catch(() => undefined);
    }, displayDuration * 1000);
  }

  _getAlertIcon(alertType) {
    const icons = {
      follow: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
      subscribe: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
      bits: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
      raid: `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2z"/></svg>`,
    };

    return icons[alertType] || icons.follow;
  }
}

export default MaterialDesignAlertWidget;
