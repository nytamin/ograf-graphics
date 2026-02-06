/**
 * Material Design Webcam Frame Module
 * Decorative frame overlay for webcam/facecam with optional streamer label.
 */

const DEFAULT_STATE = {
  streamerName: "Streamer Name",
  status: "LIVE",
  showStatus: true,
  frameWidth: 400,
  frameHeight: 300,
  aspectRatio: "4:3",
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

.frame-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  will-change: opacity, visibility;
}

.frame-border {
  position: relative;
  border: 3px solid var(--primary);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
}

.frame-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 0 0, rgba(25, 118, 210, 0.1), transparent);
}

.frame-label {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.streamer-name {
  font-size: 16px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.status-badge {
  background: var(--accent);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  animation: pulse 2s ease-in-out infinite;
}

.status-badge.hidden {
  display: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.corner-accent {
  position: absolute;
  width: 32px;
  height: 32px;
}

.corner-accent.top-left {
  top: -3px;
  left: -3px;
  border-top: 4px solid var(--accent);
  border-left: 4px solid var(--accent);
  border-radius: 16px 0 0 0;
}

.corner-accent.top-right {
  top: -3px;
  right: -3px;
  border-top: 4px solid var(--accent);
  border-right: 4px solid var(--accent);
  border-radius: 0 16px 0 0;
}

.corner-accent.bottom-left {
  bottom: -3px;
  left: -3px;
  border-bottom: 4px solid var(--accent);
  border-left: 4px solid var(--accent);
  border-radius: 0 0 0 16px;
}

.corner-accent.bottom-right {
  bottom: -3px;
  right: -3px;
  border-bottom: 4px solid var(--accent);
  border-right: 4px solid var(--accent);
  border-radius: 0 0 16px 0;
}

@media (prefers-reduced-motion: reduce) {
  .status-badge {
    animation: none;
    opacity: 1;
  }
}
`;

class MaterialDesignWebcamFrame extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const container = document.createElement("div");
    container.className = "frame-container";

    const frameBorder = document.createElement("div");
    frameBorder.className = "frame-border";

    const frameInner = document.createElement("div");
    frameInner.className = "frame-inner";

    const label = document.createElement("div");
    label.className = "frame-label";

    const streamerName = document.createElement("div");
    streamerName.className = "streamer-name";

    const statusBadge = document.createElement("div");
    statusBadge.className = "status-badge";

    label.append(streamerName, statusBadge);

    // Add corner accents
    const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
    corners.forEach((corner) => {
      const accent = document.createElement("div");
      accent.className = `corner-accent ${corner}`;
      frameBorder.appendChild(accent);
    });

    frameInner.appendChild(label);
    frameBorder.appendChild(frameInner);
    container.appendChild(frameBorder);
    root.append(style, container);

    this._elements = {
      container,
      frameBorder,
      streamerName,
      statusBadge,
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

  async playAction() {
    this._elements.container.style.opacity = "1";
    this._elements.container.style.visibility = "visible";
    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction() {
    this._elements.container.style.opacity = "0";
    this._elements.container.style.visibility = "hidden";
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
    const { streamerName, status, showStatus, frameWidth, frameHeight, primaryColor, accentColor } = this._state;

    this._elements.streamerName.textContent = streamerName;
    this._elements.statusBadge.textContent = status;
    this._elements.statusBadge.classList.toggle("hidden", !showStatus);

    this._elements.frameBorder.style.width = `${frameWidth}px`;
    this._elements.frameBorder.style.height = `${frameHeight}px`;

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }
  }
}

export default MaterialDesignWebcamFrame;
