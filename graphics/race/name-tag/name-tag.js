/**
 * Apex Velocity Race Competitor Name Tag
 * Broadcast lower-third identifying athletes at the start gate, during solo effort, or on podium.
 */

const DEFAULT_STATE = {
  bib: "42",
  firstName: "Johannes Høsflot",
  lastName: "KLÆBO",
  countryCode: "NOR",
  countryFlag: "🇳🇴",
  team: "Norway National Team",
  infoTag: "Overall World Cup Leader • 24 Victories",
  accentColor: "#00E5FF",
  position: "bottom-left"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Condensed", "DIN Alternate", "Roboto Condensed", "Segoe UI", -apple-system, sans-serif;
  color: #FFFFFF;
  --accent-color: #00E5FF;
  --panel-bg: linear-gradient(135deg, rgba(10, 16, 28, 0.94) 0%, rgba(18, 26, 44, 0.90) 100%);
  --panel-border: rgba(255, 255, 255, 0.14);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.scene {
  position: absolute;
  inset: 0;
  opacity: 0;
  will-change: opacity;
}

.tag-wrapper {
  position: absolute;
  bottom: 6vh;
  display: flex;
  flex-direction: column;
  max-width: 48vw;
  min-width: 24vw;
  filter: drop-shadow(0 1.2vh 3.5vh rgba(0, 0, 0, 0.75));
  will-change: transform, opacity;
  transform: translate3d(0, 100%, 0);
  opacity: 0;
}

.tag-wrapper[data-pos="bottom-left"] {
  left: 5vw;
}

.tag-wrapper[data-pos="bottom-right"] {
  right: 5vw;
  align-items: flex-end;
}

/* Category / Subheader strip */
.sub-strip {
  display: inline-flex;
  align-items: center;
  gap: 0.6vw;
  background: rgba(8, 12, 22, 0.96);
  border: 1px solid var(--panel-border);
  border-bottom: none;
  border-radius: 0.4vw 0.4vw 0 0;
  padding: 0.4vh 1.2vw;
  font-size: clamp(12px, 1.1vh, 16px);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240, 244, 255, 0.85);
  box-shadow: 0 -0.4vh 1.2vh rgba(0,0,0,0.3);
}

.sub-strip .status-dot {
  width: 0.45vw;
  height: 0.45vw;
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  background-color: var(--accent-color);
  box-shadow: 0 0 0.8vw var(--accent-color);
}

/* Main card */
.main-card {
  display: flex;
  align-items: stretch;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 0 0.6vw 0.6vw 0.6vw;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.tag-wrapper[data-pos="bottom-right"] .main-card {
  border-radius: 0.6vw 0 0.6vw 0.6vw;
}

/* Bib Accent Chevron */
.bib-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  color: #0A0F1D;
  padding: 1.2vh 1.6vw;
  min-width: 5vw;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
  transform-origin: left center;
}

.bib-label {
  font-size: clamp(10px, 0.9vh, 13px);
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  line-height: 1;
  opacity: 0.85;
}

.bib-number {
  font-size: clamp(28px, 4.4vh, 52px);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.95;
  font-variant-numeric: tabular-nums;
}

/* Athlete details */
.details-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.2vh 1.8vw 1.2vh 1.2vw;
  flex: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.6vw;
  margin-bottom: 0.3vh;
}

.flag-badge {
  font-size: clamp(16px, 2.2vh, 26px);
  line-height: 1;
  display: flex;
  align-items: center;
}

.flag-img {
  width: 1.6vw;
  height: 1.1vw;
  object-fit: cover;
  border-radius: 0.15vw;
  box-shadow: 0 0.2vh 0.6vh rgba(0,0,0,0.5);
}

.country-code {
  font-size: clamp(13px, 1.4vh, 18px);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.9);
}

.team-divider {
  color: rgba(255, 255, 255, 0.35);
  font-size: clamp(11px, 1.2vh, 15px);
}

.team-name {
  font-size: clamp(12px, 1.3vh, 17px);
  font-weight: 600;
  color: rgba(220, 230, 250, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.athlete-name {
  font-size: clamp(24px, 3.8vh, 46px);
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1.05;
  color: #FFFFFF;
  text-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.4);
}

.athlete-name .first-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 0.4vw;
}

.athlete-name .last-name {
  font-weight: 900;
  text-transform: uppercase;
  color: #FFFFFF;
}

/* Speed / Telemetry Bar Bottom Accent */
.card-accent-bar {
  height: 0.35vh;
  width: 100%;
  background: linear-gradient(90deg, var(--accent-color) 0%, rgba(255,255,255,0.4) 60%, transparent 100%);
}
`;

class RaceNameTag extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;
    this._animations = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const wrapper = document.createElement("div");
    wrapper.className = "tag-wrapper";
    wrapper.setAttribute("data-pos", this._state.position);

    // Sub-strip
    const subStrip = document.createElement("div");
    subStrip.className = "sub-strip";
    const statusDot = document.createElement("span");
    statusDot.className = "status-dot";
    const subText = document.createElement("span");
    subText.className = "sub-text";
    subStrip.append(statusDot, subText);

    // Main Card
    const mainCard = document.createElement("div");
    mainCard.className = "main-card";

    // Bib
    const bibContainer = document.createElement("div");
    bibContainer.className = "bib-container";
    const bibLabel = document.createElement("span");
    bibLabel.className = "bib-label";
    bibLabel.textContent = "BIB";
    const bibNumber = document.createElement("span");
    bibNumber.className = "bib-number";
    bibContainer.append(bibLabel, bibNumber);

    // Details
    const details = document.createElement("div");
    details.className = "details-container";

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    const flagBadge = document.createElement("span");
    flagBadge.className = "flag-badge";
    const countryCode = document.createElement("span");
    countryCode.className = "country-code";
    const teamDivider = document.createElement("span");
    teamDivider.className = "team-divider";
    teamDivider.textContent = "•";
    const teamName = document.createElement("span");
    teamName.className = "team-name";
    metaRow.append(flagBadge, countryCode, teamDivider, teamName);

    const athleteName = document.createElement("div");
    athleteName.className = "athlete-name";
    const firstName = document.createElement("span");
    firstName.className = "first-name";
    const lastName = document.createElement("span");
    lastName.className = "last-name";
    athleteName.append(firstName, lastName);

    details.append(metaRow, athleteName);
    mainCard.append(bibContainer, details);

    const accentBar = document.createElement("div");
    accentBar.className = "card-accent-bar";

    wrapper.append(subStrip, mainCard, accentBar);
    scene.append(wrapper);
    root.append(style, scene);

    this._elements = {
      scene,
      wrapper,
      subStrip,
      subText,
      statusDot,
      bibNumber,
      flagBadge,
      countryCode,
      teamDivider,
      teamName,
      firstName,
      lastName
    };
  }

  connectedCallback() {
    // Initial paint prevention - verified transparent
  }

  async load(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    if (this._elements.scene) {
      this._elements.scene.remove();
    }
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateIn(skip);
    this._currentStep = 1;
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateOut(skip);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();
    return { statusCode: 200 };
  }

  async customAction(params) {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    const timestamp = params?.timestamp || 0;
    this._animations.forEach(anim => {
      anim.currentTime = timestamp;
    });
    return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    return { statusCode: 200 };
  }

  _cancelAnimations() {
    this._animations.forEach(a => a.cancel());
    this._animations = [];
  }

  _applyState() {
    const { bib, firstName, lastName, countryCode, countryFlag, team, infoTag, accentColor, position } = this._state;
    const el = this._elements;

    el.bibNumber.textContent = bib || "";
    el.firstName.textContent = firstName || "";
    el.lastName.textContent = lastName || "";
    el.countryCode.textContent = countryCode || "";
    el.teamName.textContent = team || "";
    el.teamDivider.style.display = team ? "inline" : "none";

    el.subText.textContent = infoTag || "ATHLETE PROFILE";
    el.subStrip.style.display = infoTag ? "inline-flex" : "none";

    el.wrapper.setAttribute("data-pos", position || "bottom-left");

    // Handle flag image or emoji
    el.flagBadge.innerHTML = "";
    if (countryFlag) {
      if (countryFlag.startsWith("http") || countryFlag.startsWith("data:") || countryFlag.endsWith(".png") || countryFlag.endsWith(".svg")) {
        const img = document.createElement("img");
        img.className = "flag-img";
        img.src = countryFlag;
        img.alt = countryCode || "";
        el.flagBadge.append(img);
      } else {
        el.flagBadge.textContent = countryFlag;
      }
    }

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }
  }

  async _animateIn(skip) {
    if (this._isVisible) return;
    this._isVisible = true;

    const { scene, wrapper } = this._elements;

    if (skip) {
      scene.style.opacity = "1";
      wrapper.style.opacity = "1";
      wrapper.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    this._cancelAnimations();
    scene.style.opacity = "1";

    const anim = wrapper.animate([
      { transform: "translate3d(0, 50px, 0)", opacity: 0 },
      { transform: "translate3d(0, 0, 0)", opacity: 1 }
    ], {
      duration: 450,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    });

    this._animations.push(anim);
    await anim.finished;
  }

  async _animateOut(skip) {
    if (!this._isVisible) return;
    this._isVisible = false;

    const { scene, wrapper } = this._elements;

    if (skip) {
      scene.style.opacity = "0";
      wrapper.style.opacity = "0";
      wrapper.style.transform = "translate3d(0, 50px, 0)";
      return;
    }

    this._cancelAnimations();
    const anim = wrapper.animate([
      { transform: "translate3d(0, 0, 0)", opacity: 1 },
      { transform: "translate3d(0, 40px, 0)", opacity: 0 }
    ], {
      duration: 280,
      easing: "cubic-bezier(0.4, 0, 1, 1)",
      fill: "forwards"
    });

    this._animations.push(anim);
    await anim.finished;
    scene.style.opacity = "0";
  }
}

export default RaceNameTag;
