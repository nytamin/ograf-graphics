/**
 * Material Design Event List Module
 * Shows a list of recent events (follows, subs, tips, raids).
 */

const DEFAULT_STATE = {
  title: "Recent Events",
  events: [
    { type: "Follow", user: "PixelHero", detail: "just followed" },
    { type: "Sub", user: "NovaFan", detail: "subscribed for 3 months" },
    { type: "Tip", user: "Riven", detail: "$10 tip" },
    { type: "Raid", user: "StreamerX", detail: "raided with 45" },
  ],
  position: "top-left",
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

.event-list {
  position: absolute;
  width: 320px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(12px);
  will-change: opacity, transform;
}

.event-list.top-left {
  top: 24px;
  left: 24px;
}

.event-list.top-right {
  top: 24px;
  right: 24px;
}

.event-list.bottom-left {
  bottom: 24px;
  left: 24px;
}

.event-list.bottom-right {
  bottom: 24px;
  right: 24px;
}

.event-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary);
  margin: 0 0 12px 0;
}

.event-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.event-item:last-child {
  border-bottom: none;
}

.event-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.event-user {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.event-detail {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .event-list {
    transition: none;
  }
}
`;

class MaterialDesignEventList extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const list = document.createElement("div");
    list.className = "event-list";

    const title = document.createElement("div");
    title.className = "event-title";

    const items = document.createElement("div");
    items.className = "event-items";

    list.append(title, items);
    root.append(style, list);

    this._elements = {
      list,
      title,
      items,
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.list.remove();
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
    const { title, events, position, primaryColor, accentColor } = this._state;

    this._elements.list.className = `event-list ${position}`;
    this._elements.title.textContent = title;

    this._elements.items.innerHTML = events
      .map(
        (event) => `
          <div class="event-item">
            <div class="event-type">${event.type}</div>
            <div class="event-user">${event.user}</div>
            <div class="event-detail">${event.detail}</div>
          </div>
        `
      )
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
    const list = this._elements.list;

    if (skipAnimation) {
      list.style.opacity = visible ? "1" : "0";
      list.style.transform = visible ? "translateY(0)" : "translateY(12px)";
      return Promise.resolve();
    }

    const listAnimation = list.animate(
      [
        { opacity: visible ? 0 : 1, transform: visible ? "translateY(12px)" : "translateY(0)" },
        { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        fill: "forwards",
      }
    );

    return listAnimation.finished
      .catch(() => undefined)
      .finally(() => {
        list.style.opacity = visible ? "1" : "0";
        list.style.transform = visible ? "translateY(0)" : "translateY(12px)";
      });
  }
}

export default MaterialDesignEventList;
