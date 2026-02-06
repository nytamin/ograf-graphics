/**
 * Material Design Stream Ending Module
 * Displays a closing slate with credits and raid target.
 */

const DEFAULT_STATE = {
  title: "Thanks for Watching",
  subtitle: "See you on the next stream",
  raidTarget: "Raiding @coolstreamer",
  credits: ["Mods: Alex, Priya", "Music: Chillhop", "Art: Studio Nine"],
  primaryColor: "#1976d2",
  accentColor: "#4caf50",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  font-family: "Roboto", sans-serif;
  --primary: #1976d2;
  --accent: #4caf50;
}

* {
  box-sizing: border-box;
}

.ending-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.35), rgba(0, 0, 0, 0.9));
  opacity: 0;
  will-change: opacity;
}

.ending-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 56px 72px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  min-width: min(900px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
  transform: scale(0.95);
  opacity: 0;
  will-change: transform, opacity;
}

.ending-title {
  font-size: 54px;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.ending-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0;
}

.raid-banner {
  background: var(--accent);
  color: #ffffff;
  padding: 16px 24px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  align-self: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.credits {
  display: grid;
  gap: 12px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

@media (prefers-reduced-motion: reduce) {
  .ending-container,
  .ending-card {
    transition: none;
  }
}
`;

class MaterialDesignStreamEnding extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "ending-container";

    const card = document.createElement("div");
    card.className = "ending-card";

    const title = document.createElement("h1");
    title.className = "ending-title";

    const subtitle = document.createElement("p");
    subtitle.className = "ending-subtitle";

    const raid = document.createElement("div");
    raid.className = "raid-banner";

    const credits = document.createElement("div");
    credits.className = "credits";

    card.append(title, subtitle, raid, credits);
    container.appendChild(card);
    root.append(style, container);

    this._elements = {
      container,
      card,
      title,
      subtitle,
      raid,
      credits,
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
    const { title, subtitle, raidTarget, credits, primaryColor, accentColor } = this._state;

    this._elements.title.textContent = title;
    this._elements.subtitle.textContent = subtitle;
    this._elements.raid.textContent = raidTarget;
    this._elements.credits.innerHTML = credits.map((credit) => `<div>${credit}</div>`).join("");

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
    const { container, card } = this._elements;

    if (skipAnimation) {
      container.style.opacity = visible ? "1" : "0";
      card.style.opacity = visible ? "1" : "0";
      card.style.transform = visible ? "scale(1)" : "scale(0.95)";
      return Promise.resolve();
    }

    const bgAnimation = container.animate(
      [{ opacity: visible ? 0 : 1 }, { opacity: visible ? 1 : 0 }],
      {
        duration: 350,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    const cardAnimation = card.animate(
      [
        { opacity: visible ? 0 : 1, transform: visible ? "scale(0.95)" : "scale(1)" },
        { opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)" },
      ],
      {
        duration: 450,
        delay: visible ? 80 : 0,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    return Promise.all([bgAnimation.finished, cardAnimation.finished])
      .catch(() => undefined)
      .finally(() => {
        container.style.opacity = visible ? "1" : "0";
        card.style.opacity = visible ? "1" : "0";
        card.style.transform = visible ? "scale(1)" : "scale(0.95)";
      });
  }
}

export default MaterialDesignStreamEnding;
