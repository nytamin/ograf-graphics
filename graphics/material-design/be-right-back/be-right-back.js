/**
 * Material Design Be Right Back Module
 * Displays a break slate with schedule and social links.
 */

const DEFAULT_STATE = {
  title: "Be Right Back",
  subtitle: "Quick break - stay tuned",
  scheduleTitle: "Up Next",
  scheduleItems: ["Q&A Segment", "Ranked Match", "Community Games"],
  socials: ["@streamer", "discord.gg/streamer", "tiktok.com/@streamer"],
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

.brb-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.85), rgba(0, 0, 0, 0.85));
  opacity: 0;
  will-change: opacity;
}

.brb-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 56px 72px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  min-width: min(1000px, 90vw);
  transform: translateY(24px);
  opacity: 0;
  will-change: transform, opacity;
}

.brb-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brb-title {
  font-size: 56px;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.brb-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
}

.schedule {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  letter-spacing: 0.08em;
}

.schedule-item {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.75);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.socials {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.social-pill {
  background: var(--primary);
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .brb-container,
  .brb-card {
    transition: none;
  }
}
`;

class MaterialDesignBeRightBack extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "brb-container";

    const card = document.createElement("div");
    card.className = "brb-card";

    const header = document.createElement("div");
    header.className = "brb-header";

    const title = document.createElement("h1");
    title.className = "brb-title";

    const subtitle = document.createElement("p");
    subtitle.className = "brb-subtitle";

    const socials = document.createElement("div");
    socials.className = "socials";

    header.append(title, subtitle, socials);

    const schedule = document.createElement("div");
    schedule.className = "schedule";

    const scheduleTitle = document.createElement("div");
    scheduleTitle.className = "schedule-title";

    const scheduleList = document.createElement("div");
    scheduleList.className = "schedule-list";

    schedule.append(scheduleTitle, scheduleList);
    card.append(header, schedule);
    container.appendChild(card);
    root.append(style, container);

    this._elements = {
      container,
      card,
      title,
      subtitle,
      socials,
      scheduleTitle,
      scheduleList,
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
    const { title, subtitle, scheduleTitle, scheduleItems, socials, primaryColor, accentColor } = this._state;

    this._elements.title.textContent = title;
    this._elements.subtitle.textContent = subtitle;
    this._elements.scheduleTitle.textContent = scheduleTitle;

    this._elements.scheduleList.innerHTML = scheduleItems
      .map((item) => `<div class="schedule-item">${item}</div>`)
      .join("");

    this._elements.socials.innerHTML = socials
      .map((social) => `<div class="social-pill">${social}</div>`)
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
    const { container, card } = this._elements;

    if (skipAnimation) {
      container.style.opacity = visible ? "1" : "0";
      card.style.opacity = visible ? "1" : "0";
      card.style.transform = visible ? "translateY(0)" : "translateY(24px)";
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
        { opacity: visible ? 0 : 1, transform: visible ? "translateY(24px)" : "translateY(0)" },
        { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" },
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
        card.style.transform = visible ? "translateY(0)" : "translateY(24px)";
      });
  }
}

export default MaterialDesignBeRightBack;
