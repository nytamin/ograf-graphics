/**
 * Material Design Sponsor Bug Module
 * Displays rotating sponsor logos with smooth transitions.
 */

const DEFAULT_STATE = {
  sponsors: [
    { name: "TechCorp", duration: 5 },
    { name: "StreamTools Pro", duration: 5 },
    { name: "EliteGear", duration: 5 },
  ],
  position: "bottom-right",
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

.sponsor-bug {
  position: absolute;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  opacity: 0;
  will-change: opacity, transform;
}

.sponsor-bug.top-left {
  top: 24px;
  left: 24px;
}

.sponsor-bug.top-left.visible {
  animation: slideInTopLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, float 3s ease-in-out infinite 0.5s;
}

.sponsor-bug.top-left.hiding {
  animation: slideOutTopLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sponsor-bug.top-right {
  top: 24px;
  right: 24px;
}

.sponsor-bug.top-right.visible {
  animation: slideInTopRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, float 3s ease-in-out infinite 0.5s;
}

.sponsor-bug.top-right.hiding {
  animation: slideOutTopRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sponsor-bug.bottom-left {
  bottom: 24px;
  left: 24px;
}

.sponsor-bug.bottom-left.visible {
  animation: slideInBottomLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, float 3s ease-in-out infinite 0.5s;
}

.sponsor-bug.bottom-left.hiding {
  animation: slideOutBottomLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sponsor-bug.bottom-right {
  bottom: 24px;
  right: 24px;
}

.sponsor-bug.bottom-right.visible {
  animation: slideInBottomRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, float 3s ease-in-out infinite 0.5s;
}

.sponsor-bug.bottom-right.hiding {
  animation: slideOutBottomRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sponsor-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: absolute;
  padding: 16px;
  opacity: 0;
  will-change: opacity;
}

.sponsor-content.active {
  animation: fadeInOut 10s ease-in-out;
}

@keyframes slideInTopLeft {
  from {
    opacity: 0;
    transform: translate(-120px, -120px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes slideOutTopLeft {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-120px, -120px) scale(0.8);
  }
}

@keyframes slideInTopRight {
  from {
    opacity: 0;
    transform: translate(120px, -120px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes slideOutTopRight {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(120px, -120px) scale(0.8);
  }
}

@keyframes slideInBottomLeft {
  from {
    opacity: 0;
    transform: translate(-120px, 120px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes slideOutBottomLeft {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-120px, 120px) scale(0.8);
  }
}

@keyframes slideInBottomRight {
  from {
    opacity: 0;
    transform: translate(120px, 120px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes slideOutBottomRight {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(120px, 120px) scale(0.8);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(0.5deg);
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.sponsor-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.sponsor-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
}

.accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .sponsor-content.active {
    animation: none;
    opacity: 1;
  }

  .sponsor-bug.visible,
  .sponsor-bug.hiding {
    animation: none !important;
  }
}
`;

class MaterialDesignSponsorBug extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentSponsor = 0;
    this._isVisible = false;
    this._rotationInterval = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const bug = document.createElement("div");
    bug.className = "sponsor-bug";

    const accentLine = document.createElement("div");
    accentLine.className = "accent-line";

    bug.appendChild(accentLine);
    root.append(style, bug);

    this._elements = {
      bug,
      accentLine,
      contents: [],
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._setupSponsors();
    return { statusCode: 200 };
  }

  async dispose() {
    if (this._rotationInterval) {
      clearInterval(this._rotationInterval);
    }
    this._elements.bug.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._isVisible = true;
    this._elements.bug.classList.remove("hiding");
    this._elements.bug.classList.add("visible");
    this._startRotation();
    return { statusCode: 200, currentStep: 0 };
  }

  async stopAction() {
    this._isVisible = false;
    this._elements.bug.classList.remove("visible");
    this._elements.bug.classList.add("hiding");
    if (this._rotationInterval) {
      clearInterval(this._rotationInterval);
    }
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._setupSponsors();
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  _setupSponsors() {
    const { sponsors, position, primaryColor, accentColor } = this._state;

    // Update position (preserve visible/hiding classes if present)
    const visibilityClass = this._elements.bug.classList.contains("visible") ? "visible" :
                            this._elements.bug.classList.contains("hiding") ? "hiding" : "";
    this._elements.bug.className = `sponsor-bug ${position} ${visibilityClass}`.trim();

    // Clear old content
    this._elements.contents.forEach((el) => el.remove());
    this._elements.contents = [];

    // Create new content elements
    sponsors.forEach((sponsor, index) => {
      const content = document.createElement("div");
      content.className = "sponsor-content";
      content.dataset.index = index;

      content.innerHTML = `
        <div class="sponsor-label">Powered By</div>
        <div class="sponsor-name">${sponsor.name}</div>
      `;

      this._elements.bug.insertBefore(content, this._elements.accentLine);
      this._elements.contents.push(content);
    });

    if (primaryColor) {
      this.style.setProperty("--primary", primaryColor);
    }
    if (accentColor) {
      this.style.setProperty("--accent", accentColor);
    }

    this._currentSponsor = 0;
    if (this._isVisible) {
      this._updateSponsorDisplay();
    }
  }

  _startRotation() {
    if (this._rotationInterval) {
      clearInterval(this._rotationInterval);
    }

    this._updateSponsorDisplay();

    this._rotationInterval = setInterval(() => {
      this._currentSponsor = (this._currentSponsor + 1) % this._elements.contents.length;
      this._updateSponsorDisplay();
    }, 10000); // Rotate every 10 seconds
  }

  _updateSponsorDisplay() {
    this._elements.contents.forEach((content, index) => {
      content.classList.toggle("active", index === this._currentSponsor);
    });
  }
}

export default MaterialDesignSponsorBug;
