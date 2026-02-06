/**
 * Material Design Offline Screen Module
 * Displays a full-screen offline placeholder with next stream info and social links.
 */

const DEFAULT_STATE = {
  channelName: "StreamChannel",
  offlineText: "Stream is Currently Offline",
  nextStreamTime: "Next Stream: Tomorrow at 7:00 PM",
  callToAction: "Follow to get notified when we go live!",
  socialLinks: ["Twitter", "Discord", "YouTube"],
  primaryColor: "#1976d2",
  accentColor: "#ffa726",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  font-family: "Roboto", sans-serif;
  --primary: #1976d2;
  --accent: #ffa726;
}

* {
  box-sizing: border-box;
}

.offline-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, rgba(0, 0, 0, 0.8) 100%);
  opacity: 0;
  will-change: opacity;
}

.offline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  text-align: center;
  transform: scale(0.9);
  will-change: transform;
}

.offline-icon {
  width: 160px;
  height: 160px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.icon-svg {
  width: 100px;
  height: 100px;
  fill: var(--accent);
}

.offline-text {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.channel-name {
  font-size: 64px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.offline-heading {
  font-size: 48px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.next-stream {
  font-size: 32px;
  font-weight: 500;
  color: var(--accent);
  margin: 0;
}

.cta-text {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  margin: 24px 0 0 0;
  max-width: 600px;
}

.social-links {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}

.social-badge {
  background: var(--accent);
  color: white;
  padding: 16px 32px;
  border-radius: 32px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (prefers-reduced-motion: reduce) {
  .offline-container {
    transition: none;
  }
}
`;

class MaterialDesignOfflineScreen extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._bgAnimation = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "offline-container";

    const content = document.createElement("div");
    content.className = "offline-content";

    const icon = document.createElement("div");
    icon.className = "offline-icon";
    icon.innerHTML = `
      <svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
      </svg>
    `;

    const textWrapper = document.createElement("div");
    textWrapper.className = "offline-text";

    const channelName = document.createElement("h1");
    channelName.className = "channel-name";

    const heading = document.createElement("h2");
    heading.className = "offline-heading";

    const nextStream = document.createElement("p");
    nextStream.className = "next-stream";

    const cta = document.createElement("p");
    cta.className = "cta-text";

    const socialLinks = document.createElement("div");
    socialLinks.className = "social-links";

    textWrapper.append(channelName, heading, nextStream, cta, socialLinks);
    content.append(icon, textWrapper);
    container.appendChild(content);
    root.append(style, container);

    this._elements = {
      container,
      content,
      channelName,
      heading,
      nextStream,
      cta,
      socialLinks,
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("700 64px Roboto"),
        document.fonts.load("400 48px Roboto"),
        document.fonts.load("500 32px Roboto"),
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
    const skipAnimation = params?.skipAnimation === true;
    await this._animateTo(true, skipAnimation);
    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateTo(false, skipAnimation);
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
    const { channelName, offlineText, nextStreamTime, callToAction, socialLinks, primaryColor, accentColor } = this._state;

    this._elements.channelName.textContent = channelName;
    this._elements.heading.textContent = offlineText;
    this._elements.nextStream.textContent = nextStreamTime;
    this._elements.cta.textContent = callToAction;

    this._elements.socialLinks.innerHTML = socialLinks
      .map((link) => `<div class="social-badge">${link}</div>`)
      .join("");

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }
  }

  _animateTo(visible, skipAnimation) {
    if (this._isVisible === visible) {
      return Promise.resolve();
    }

    this._isVisible = visible;
    const container = this._elements.container;
    const content = this._elements.content;

    if (this._bgAnimation) {
      this._bgAnimation.cancel();
      this._bgAnimation = null;
    }

    if (skipAnimation) {
      container.style.opacity = visible ? "1" : "0";
      content.style.transform = visible ? "scale(1)" : "scale(0.9)";
      return Promise.resolve();
    }

    const bgAnimation = container.animate([{ opacity: visible ? 0 : 1 }, { opacity: visible ? 1 : 0 }], {
      duration: 400,
      easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      fill: "forwards",
    });

    const contentAnimation = content.animate(
      [
        { transform: visible ? "scale(0.9)" : "scale(1)", opacity: visible ? 0 : 1 },
        { transform: visible ? "scale(1)" : "scale(0.9)", opacity: visible ? 1 : 0 },
      ],
      {
        duration: 500,
        delay: visible ? 100 : 0,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    this._bgAnimation = bgAnimation;

    return Promise.all([bgAnimation.finished, contentAnimation.finished])
      .catch(() => undefined)
      .finally(() => {
        container.style.opacity = visible ? "1" : "0";
        content.style.transform = visible ? "scale(1)" : "scale(0.9)";
        if (this._bgAnimation === bgAnimation) {
          this._bgAnimation = null;
        }
      });
  }
}

export default MaterialDesignOfflineScreen;
