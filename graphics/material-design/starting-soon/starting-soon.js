/**
 * Material Design Starting Soon Module
 * Displays a countdown and social rotator for stream start.
 */

const DEFAULT_STATE = {
  showTitle: "Starting Soon",
  countdownTarget: 1893456000,
  subtitle: "Grab a drink, we will be live shortly",
  socials: ["@streamer", "discord.gg/streamer", "youtube.com/streamer"],
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

.starting-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(25, 118, 210, 0.3), rgba(0, 0, 0, 0.85));
  opacity: 0;
  will-change: opacity;
}

.starting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  text-align: center;
  transform: translateY(24px);
  opacity: 0;
  will-change: transform, opacity;
}

.title {
  font-size: 72px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.countdown {
  font-size: 96px;
  font-weight: 900;
  color: var(--accent);
  margin: 0;
  text-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 720px;
  margin: 0;
}

.socials {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.social-pill {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 999px;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .starting-container,
  .starting-content {
    transition: none;
  }
}
`;

class MaterialDesignStartingSoon extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._inAnimation = null;
    this._countdownTimer = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "starting-container";

    const content = document.createElement("div");
    content.className = "starting-content";

    const title = document.createElement("h1");
    title.className = "title";

    const countdown = document.createElement("div");
    countdown.className = "countdown";

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";

    const socials = document.createElement("div");
    socials.className = "socials";

    content.append(title, countdown, subtitle, socials);
    container.appendChild(content);
    root.append(style, container);

    this._elements = {
      container,
      content,
      title,
      countdown,
      subtitle,
      socials,
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("700 72px Roboto"),
        document.fonts.load("900 96px Roboto"),
        document.fonts.load("400 24px Roboto"),
      ]).catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async dispose() {
    this._stopCountdown();
    this._elements.container.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateTo(true, skipAnimation);
    this._startCountdown();
    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateTo(false, skipAnimation);
    this._stopCountdown();
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    if (this._isVisible) {
      this._startCountdown();
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { showTitle, subtitle, socials, primaryColor, accentColor } = this._state;

    this._elements.title.textContent = showTitle;
    this._elements.subtitle.textContent = subtitle;

    this._elements.socials.innerHTML = socials
      .map((social) => `<div class="social-pill">${social}</div>`)
      .join("");

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }

    this._updateCountdownDisplay();
  }

  _startCountdown() {
    if (typeof this._state.countdownTarget !== "number") {
      return;
    }

    this._stopCountdown();
    this._updateCountdownDisplay();
    this._countdownTimer = setInterval(() => this._updateCountdownDisplay(), 1000);
  }

  _stopCountdown() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }
  }

  _updateCountdownDisplay() {
    const { countdownTarget } = this._state;

    if (typeof countdownTarget !== "number") {
      return;
    }

    const targetMs = countdownTarget > 1e12 ? countdownTarget : countdownTarget * 1000;
    const diffMs = Math.max(0, targetMs - Date.now());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this._elements.countdown.textContent =
      `${this._padTime(hours)}:${this._padTime(minutes)}:${this._padTime(seconds)}`;
  }

  _padTime(value) {
    return String(value).padStart(2, "0");
  }

  _animateTo(visible, skipAnimation) {
    if (this._isVisible === visible) {
      return Promise.resolve();
    }

    this._isVisible = visible;
    const { container, content } = this._elements;

    if (this._inAnimation) {
      this._inAnimation.cancel();
      this._inAnimation = null;
    }

    if (skipAnimation) {
      container.style.opacity = visible ? "1" : "0";
      content.style.opacity = visible ? "1" : "0";
      content.style.transform = visible ? "translateY(0)" : "translateY(24px)";
      return Promise.resolve();
    }

    const bgAnimation = container.animate(
      [{ opacity: visible ? 0 : 1 }, { opacity: visible ? 1 : 0 }],
      {
        duration: 400,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    const contentAnimation = content.animate(
      [
        { opacity: visible ? 0 : 1, transform: visible ? "translateY(24px)" : "translateY(0)" },
        { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" },
      ],
      {
        duration: 500,
        delay: visible ? 100 : 0,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    this._inAnimation = contentAnimation;

    return Promise.all([bgAnimation.finished, contentAnimation.finished])
      .catch(() => undefined)
      .finally(() => {
        container.style.opacity = visible ? "1" : "0";
        content.style.opacity = visible ? "1" : "0";
        content.style.transform = visible ? "translateY(0)" : "translateY(24px)";
        if (this._inAnimation === contentAnimation) {
          this._inAnimation = null;
        }
      });
  }
}

export default MaterialDesignStartingSoon;
