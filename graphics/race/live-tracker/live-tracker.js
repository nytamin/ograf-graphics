/**
 * Apex Velocity Live Active Racer Telemetry Bug
 * Persistent top-corner telemetry bug for active on-course competitors.
 */

const DEFAULT_STATE = {
  bib: "7",
  athleteName: "ELIUD KIPCHOGE",
  countryCode: "KEN",
  countryFlag: "🇰🇪",
  statusNote: "ON COURSE • FINAL SECTOR",
  distanceNote: "KM 38.2 / 42.2",
  runningTime: "01:54:12.4",
  isTimerRunning: false,
  paceOrSpeed: "2:52 /km",
  deltaReference: "-0:14 vs WR",
  isAhead: true,
  sectorStates: ["ahead", "ahead", "ahead", "active"],
  accentColor: "#00E5FF",
  position: "top-left"
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
  --panel-bg: linear-gradient(135deg, rgba(10, 16, 28, 0.95) 0%, rgba(18, 26, 44, 0.92) 100%);
  --panel-border: rgba(255, 255, 255, 0.14);
  --color-green: #00E676;
  --color-red: #FF334B;
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

.tracker-wrapper {
  position: absolute;
  top: 5vh;
  display: flex;
  flex-direction: column;
  width: 25vw;
  min-width: 380px;
  max-width: 480px;
  filter: drop-shadow(0 1.2vh 3vh rgba(0, 0, 0, 0.8));
  will-change: transform, opacity;
  transform: translate3d(0, -60px, 0);
  opacity: 0;
}

.tracker-wrapper[data-pos="top-left"] {
  left: 5vw;
}

.tracker-wrapper[data-pos="top-right"] {
  right: 5vw;
}

.main-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 0.6vw;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Top status strip */
.status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6vh 1.2vw;
  background: rgba(0, 0, 0, 0.45);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 0.5vw;
}

.pulse-dot {
  width: 0.45vw;
  height: 0.45vw;
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  background-color: var(--color-green);
  box-shadow: 0 0 0.8vw var(--color-green);
  animation: pulseAnim 1.4s ease-in-out infinite;
}

@keyframes pulseAnim {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.status-note {
  font-size: clamp(10px, 1vh, 13px);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240, 244, 255, 0.9);
}

.distance-note {
  font-family: monospace;
  font-size: clamp(10px, 1vh, 13px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

/* Mid section: Competitor & Chrono */
.mid-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2vh 1.2vw;
}

.competitor-info {
  display: flex;
  align-items: center;
  gap: 0.8vw;
}

.bib-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4vw;
  height: 2.4vw;
  min-width: 32px;
  min-height: 32px;
  border-radius: 0.4vw;
  background: var(--accent-color);
  color: #0A0F1D;
  font-size: clamp(16px, 2.2vh, 26px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.name-container {
  display: flex;
  flex-direction: column;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  font-size: clamp(11px, 1.1vh, 14px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
}

.athlete-name {
  font-size: clamp(16px, 2.2vh, 26px);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #FFFFFF;
  line-height: 1.1;
}

.chrono-display {
  font-family: monospace;
  font-size: clamp(20px, 3vh, 36px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  text-shadow: 0 0.2vh 0.8vh rgba(0,0,0,0.5);
  line-height: 1;
  margin-top: 0.2vh;
}

/* Telemetry right block */
.telemetry-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.pace-label {
  font-size: clamp(8px, 0.75vh, 11px);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.45);
}

.pace-value {
  font-family: monospace;
  font-size: clamp(14px, 1.8vh, 22px);
  font-weight: 800;
  color: var(--color-green);
  line-height: 1.1;
}

.delta-ref {
  font-family: monospace;
  font-size: clamp(10px, 1vh, 13px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.2vh;
}

.delta-ref[data-status="behind"] {
  color: var(--color-red);
}

/* Sector Progress Meter */
.sectors-footer {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  padding: 0.8vh 1.2vw;
  background: rgba(0, 0, 0, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sectors-track {
  display: flex;
  flex: 1;
  gap: 0.35vw;
}

.sector-bar {
  flex: 1;
  height: 0.5vh;
  min-height: 4px;
  border-radius: 0.1vw;
  background: rgba(255, 255, 255, 0.15);
  transition: background-color 0.3s ease;
}

.sector-bar[data-state="ahead"] {
  background-color: var(--color-green);
  box-shadow: 0 0 0.5vw var(--color-green);
}

.sector-bar[data-state="behind"] {
  background-color: var(--color-red);
  box-shadow: 0 0 0.5vw var(--color-red);
}

.sector-bar[data-state="active"] {
  background-color: var(--accent-color);
  box-shadow: 0 0 0.8vw var(--accent-color);
  animation: pulseAnim 0.8s ease-in-out infinite;
}

.sector-status-label {
  font-family: monospace;
  font-size: clamp(9px, 0.9vh, 12px);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.55);
}
`;

class RaceLiveTracker extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;
    this._animations = [];
    this._timerRaf = null;
    this._timerStart = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const wrapper = document.createElement("div");
    wrapper.className = "tracker-wrapper";
    wrapper.setAttribute("data-pos", this._state.position);

    const mainCard = document.createElement("div");
    mainCard.className = "main-card";

    // Top status strip
    const statusStrip = document.createElement("div");
    statusStrip.className = "status-strip";
    const statusLeft = document.createElement("div");
    statusLeft.className = "status-left";
    const pulseDot = document.createElement("span");
    pulseDot.className = "pulse-dot";
    const statusNote = document.createElement("span");
    statusNote.className = "status-note";
    statusLeft.append(pulseDot, statusNote);
    const distanceNote = document.createElement("span");
    distanceNote.className = "distance-note";
    statusStrip.append(statusLeft, distanceNote);

    // Mid section
    const midSection = document.createElement("div");
    midSection.className = "mid-section";

    const competitorInfo = document.createElement("div");
    competitorInfo.className = "competitor-info";

    const bibBadge = document.createElement("div");
    bibBadge.className = "bib-badge";

    const nameContainer = document.createElement("div");
    nameContainer.className = "name-container";
    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    const flagSpan = document.createElement("span");
    const codeSpan = document.createElement("span");
    metaRow.append(flagSpan, codeSpan);
    const athleteName = document.createElement("div");
    athleteName.className = "athlete-name";
    const chronoDisplay = document.createElement("div");
    chronoDisplay.className = "chrono-display";
    nameContainer.append(metaRow, athleteName, chronoDisplay);

    competitorInfo.append(bibBadge, nameContainer);

    // Telemetry right
    const telemetryRight = document.createElement("div");
    telemetryRight.className = "telemetry-right";
    const paceLabel = document.createElement("span");
    paceLabel.className = "pace-label";
    paceLabel.textContent = "SPEED / PACE";
    const paceValue = document.createElement("span");
    paceValue.className = "pace-value";
    const deltaRef = document.createElement("span");
    deltaRef.className = "delta-ref";
    telemetryRight.append(paceLabel, paceValue, deltaRef);

    midSection.append(competitorInfo, telemetryRight);

    // Sectors footer
    const sectorsFooter = document.createElement("div");
    sectorsFooter.className = "sectors-footer";
    const sectorsTrack = document.createElement("div");
    sectorsTrack.className = "sectors-track";
    const sectorStatusLabel = document.createElement("span");
    sectorStatusLabel.className = "sector-status-label";
    sectorStatusLabel.textContent = "SECTORS";
    sectorsFooter.append(sectorsTrack, sectorStatusLabel);

    mainCard.append(statusStrip, midSection, sectorsFooter);
    wrapper.append(mainCard);
    scene.append(wrapper);
    root.append(style, scene);

    this._elements = {
      scene,
      wrapper,
      pulseDot,
      statusNote,
      distanceNote,
      bibBadge,
      flagSpan,
      codeSpan,
      athleteName,
      chronoDisplay,
      paceValue,
      deltaRef,
      sectorsTrack,
      sectorStatusLabel
    };
  }

  connectedCallback() {
    // Hidden initially
  }

  async load(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._stopTimer();
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

    if (this._state.isTimerRunning) {
      this._startTimer();
    }

    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    this._stopTimer();
    await this._animateOut(skip);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();

    if (this._isVisible) {
      if (this._state.isTimerRunning && !this._timerRaf) {
        this._startTimer();
      } else if (!this._state.isTimerRunning && this._timerRaf) {
        this._stopTimer();
      }
    }
    return { statusCode: 200 };
  }

  async customAction(params) {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    return { statusCode: 200 };
  }

  _cancelAnimations() {
    this._animations.forEach(a => a.cancel());
    this._animations = [];
  }

  _startTimer() {
    if (this._timerRaf) return;
    this._timerStart = performance.now();
    const tick = () => {
      this._timerRaf = requestAnimationFrame(tick);
    };
    this._timerRaf = requestAnimationFrame(tick);
  }

  _stopTimer() {
    if (this._timerRaf) {
      cancelAnimationFrame(this._timerRaf);
      this._timerRaf = null;
    }
  }

  _applyState() {
    const s = this._state;
    const el = this._elements;

    el.bibBadge.textContent = s.bib || "";
    el.athleteName.textContent = s.athleteName || "";
    el.statusNote.textContent = s.statusNote || "";
    el.distanceNote.textContent = s.distanceNote || "";
    el.chronoDisplay.textContent = s.runningTime || "00:00.0";
    el.paceValue.textContent = s.paceOrSpeed || "";
    el.deltaRef.textContent = s.deltaReference || "";

    const deltaStr = String(s.deltaReference || "").trim();
    const isAhead = (s.isAhead !== undefined) ? s.isAhead : (deltaStr.startsWith("-") || deltaStr.startsWith("–"));
    el.deltaRef.setAttribute("data-status", isAhead ? "ahead" : "behind");
    el.paceValue.style.color = isAhead ? "var(--color-green)" : "var(--color-red)";

    el.wrapper.setAttribute("data-pos", s.position || "top-left");

    // Flag
    el.flagSpan.textContent = s.countryFlag || "";
    el.codeSpan.textContent = s.countryCode || "";

    // Accent
    if (s.accentColor) {
      this.style.setProperty("--accent-color", s.accentColor);
    }

    // Render sectors
    const sectors = s.sectorStates || ["ahead", "ahead", "ahead", "active"];
    el.sectorsTrack.innerHTML = "";
    sectors.forEach((state) => {
      const bar = document.createElement("div");
      bar.className = "sector-bar";
      bar.setAttribute("data-state", state);
      el.sectorsTrack.append(bar);
    });
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
      { transform: "translate3d(0, -50px, 0)", opacity: 0 },
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
      return;
    }

    this._cancelAnimations();
    const anim = wrapper.animate([
      { transform: "translate3d(0, 0, 0)", opacity: 1 },
      { transform: "translate3d(0, -40px, 0)", opacity: 0 }
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

export default RaceLiveTracker;
