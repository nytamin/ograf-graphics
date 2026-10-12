/**
 * Master Scorebug
 * Broadcast-grade persistent scoreboard with team branding, dynamic clock, stoppage time, and status pills.
 */

const DEFAULT_STATE = {
  homeTeam: "ARSENAL",
  homeAbbr: "ARS",
  homeScore: 2,
  homeColor: "#db0007",
  homeLogo: "",
  awayTeam: "CHELSEA",
  awayAbbr: "CHE",
  awayScore: 1,
  awayColor: "#034694",
  awayLogo: "",
  clock: "78:24",
  period: "2ND HALF",
  extraTime: "+4'",
  statusPill: "LIVE"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", "Arial Narrow", sans-serif;
  --home-color: #db0007;
  --away-color: #034694;
  --status-color: #00f59b;
  --text-main: #f0f3f8;
  --text-dim: #9aa3b4;
  --bg-panel: rgba(11, 15, 24, 0.95);
  --border-subtle: rgba(255, 255, 255, 0.12);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base Scene: Zero Initial Paint */
.scene {
  position: absolute;
  top: max(4vh, 42px);
  left: max(4vw, 54px);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
}

.scene.active {
  opacity: 1;
  visibility: visible;
  transform: none;
  clip-path: none;
}

.scene.instant {
  animation: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  clip-path: none !important;
  transform: none !important;
}

.scene.instant * {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Container wipes open via angled clip-path mask
   Phase 2: Color bars slice in vertically
   Phase 3: Text slides up through overflow mask
   Phase 4: Scores pop in with scale-bounce
   Phase 5: Status badge drops and live dot glows
   ============================================================ */

.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .bug-container {
  animation: bugWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bugWipeIn {
  0% {
    clip-path: polygon(-50px -50px, -50px -50px, -80px calc(100% + 50px), -80px calc(100% + 50px));
    opacity: 0;
    transform: translateX(-15px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-50px -50px, calc(100% + 50px) -50px, calc(100% + 50px) calc(100% + 50px), -50px calc(100% + 50px));
    opacity: 1;
    transform: translateX(0);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
  }
}

.scene.anim-in .status-badge {
  animation: statusBadgeDrop 380ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards;
}

@keyframes statusBadgeDrop {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .color-bar {
  animation: colorBarSlice 340ms cubic-bezier(0.16, 1, 0.3, 1) 120ms backwards;
}

@keyframes colorBarSlice {
  0% { transform: scaleY(0); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
}

.scene.anim-in .reveal-text {
  animation: textSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 140ms backwards;
}

@keyframes textSlideUp {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .score-box {
  animation: scoreBounceIn 380ms cubic-bezier(0.16, 1, 0.3, 1) 140ms backwards;
}

@keyframes scoreBounceIn {
  0% { transform: scale(0.3) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.scene.anim-in .info-block {
  animation: infoSlideIn 380ms cubic-bezier(0.16, 1, 0.3, 1) 220ms backwards;
}

@keyframes infoSlideIn {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION: ASYMMETRIC LATERAL SPEED-WIPE
   Quick, clean 200ms exit sweeping to the left
   ============================================================ */

.scene.anim-out {
  opacity: 1;
  visibility: visible;
  animation: bugOutWipe 220ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes bugOutWipe {
  0% {
    transform: translateX(0) scale(1);
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
  100% {
    transform: translateX(-40px) scale(0.96);
    clip-path: inset(0 100% 0 0);
    opacity: 0;
    filter: blur(4px);
  }
}

/* Container Structure */
.bug-container {
  display: flex;
  align-items: stretch;
  height: clamp(48px, 5.5vh, 64px);
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(14px);
}

/* Status / League badge strip */
.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: #0f141f;
  border-right: 1px solid var(--border-subtle);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--status-color);
  text-transform: uppercase;
}

.status-badge::before {
  content: "";
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--status-color);
  margin-right: 7px;
  box-shadow: 0 0 8px var(--status-color);
  animation: livePulse 1.8s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

/* Team modules */
.team-block {
  display: flex;
  align-items: center;
  padding: 0 14px 0 12px;
  gap: 10px;
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.25));
}

.home-block {
  border-right: 1px solid var(--border-subtle);
}

.color-bar {
  width: 5px;
  height: 60%;
  border-radius: 3px;
  box-shadow: 0 0 10px currentColor;
}

.home-bar {
  background-color: var(--home-color);
  color: var(--home-color);
}

.away-bar {
  background-color: var(--away-color);
  color: var(--away-color);
}

.team-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-fallback {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}

/* Text Mask Reveal Wrappers */
.mask-wrap {
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.reveal-text {
  display: inline-block;
}

.team-abbr {
  font-size: clamp(20px, 2.2vh, 26px);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-main);
  text-transform: uppercase;
}

.score-box {
  min-width: 44px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  padding: 0 10px;
  font-size: clamp(24px, 2.8vh, 32px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #fff;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, color 0.2s ease;
}

.score-box.flash {
  color: #ffe066;
  transform: scale(1.18);
}

/* Match metadata & clock */
.info-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  background: #0d121c;
  min-width: 105px;
}

.clock-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.clock-text {
  font-size: clamp(18px, 2.2vh, 24px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #ffffff;
  letter-spacing: 0.04em;
}

.extra-time {
  background: #ff3b56;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.extra-time:empty {
  display: none;
}

.period-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
`;

class ApexScorebugMaster extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    scene.innerHTML = `
      <div class="bug-container">
        <div class="status-badge" id="statusPill"></div>

        <!-- Home Team -->
        <div class="team-block home-block">
          <div class="color-bar home-bar"></div>
          <div class="team-logo" id="homeLogoContainer"></div>
          <div class="mask-wrap">
            <span class="reveal-text team-abbr" id="homeAbbr"></span>
          </div>
        </div>
        <div class="score-box" id="homeScore"></div>

        <!-- Away Team -->
        <div class="team-block away-block">
          <div class="color-bar away-bar"></div>
          <div class="team-logo" id="awayLogoContainer"></div>
          <div class="mask-wrap">
            <span class="reveal-text team-abbr" id="awayAbbr"></span>
          </div>
        </div>
        <div class="score-box" id="awayScore"></div>

        <!-- Game Info & Clock -->
        <div class="info-block">
          <div class="clock-row">
            <div class="mask-wrap">
              <span class="reveal-text clock-text" id="clock"></span>
            </div>
            <span class="extra-time" id="extraTime"></span>
          </div>
          <span class="period-text" id="period"></span>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      container: scene.querySelector(".bug-container"),
      statusPill: scene.querySelector("#statusPill"),
      homeAbbr: scene.querySelector("#homeAbbr"),
      homeScore: scene.querySelector("#homeScore"),
      homeLogoContainer: scene.querySelector("#homeLogoContainer"),
      awayAbbr: scene.querySelector("#awayAbbr"),
      awayScore: scene.querySelector("#awayScore"),
      awayLogoContainer: scene.querySelector("#awayLogoContainer"),
      clock: scene.querySelector("#clock"),
      extraTime: scene.querySelector("#extraTime"),
      period: scene.querySelector("#period")
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params?.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  _waitForAnimation(el, fallbackMs = 520) {
    return new Promise(resolve => {
      let resolved = false;
      const onEnd = (e) => {
        if (e && e.target !== el && e.target !== this._elements.container) {
          return;
        }
        if (resolved) return;
        resolved = true;
        el.removeEventListener("animationend", onEnd);
        resolve();
      };
      el.addEventListener("animationend", onEnd);
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener("animationend", onEnd);
        resolve();
      }, fallbackMs);
    });
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    const { scene } = this._elements;
    this._isVisible = true;

    if (skip) {
      scene.className = "scene active instant";
      this._currentStep = 1;
      return { statusCode: 200, currentStep: 1 };
    }

    scene.className = "scene anim-in";
    await this._waitForAnimation(scene, 520);
    scene.className = "scene active";
    this._currentStep = 1;
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    const { scene } = this._elements;
    this._isVisible = false;

    if (skip) {
      scene.className = "scene";
      this._currentStep = undefined;
      return { statusCode: 200 };
    }

    scene.className = "scene anim-out";
    await this._waitForAnimation(scene, 250);
    scene.className = "scene";
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const prevHomeScore = this._state.homeScore;
    const prevAwayScore = this._state.awayScore;
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();

    if (this._state.homeScore !== prevHomeScore) {
      this._flashElement(this._elements.homeScore);
    }
    if (this._state.awayScore !== prevAwayScore) {
      this._flashElement(this._elements.awayScore);
    }

    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async goToTime() {
    return { statusCode: 200 };
  }

  async setActionsSchedule() {
    return { statusCode: 200 };
  }

  _flashElement(el) {
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 400);
  }

  _applyState() {
    const {
      homeAbbr, homeTeam, homeScore, homeColor, homeLogo,
      awayAbbr, awayTeam, awayScore, awayColor, awayLogo,
      clock, period, extraTime, statusPill
    } = this._state;

    const el = this._elements;

    el.statusPill.textContent = statusPill || "LIVE";
    el.homeAbbr.textContent = homeAbbr || (homeTeam ? homeTeam.substring(0, 3) : "HOM");
    el.homeScore.textContent = String(homeScore ?? 0);
    el.awayAbbr.textContent = awayAbbr || (awayTeam ? awayTeam.substring(0, 3) : "AWY");
    el.awayScore.textContent = String(awayScore ?? 0);
    el.clock.textContent = clock || "00:00";
    el.period.textContent = period || "";
    el.extraTime.textContent = extraTime || "";

    if (homeColor) this.style.setProperty("--home-color", homeColor);
    if (awayColor) this.style.setProperty("--away-color", awayColor);

    this._renderLogo(el.homeLogoContainer, homeLogo, el.homeAbbr.textContent);
    this._renderLogo(el.awayLogoContainer, awayLogo, el.awayAbbr.textContent);
  }

  _renderLogo(container, url, abbr) {
    container.innerHTML = "";
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = abbr;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      container.append(img);
    } else {
      const badge = document.createElement("div");
      badge.className = "logo-fallback";
      badge.textContent = (abbr || "?").substring(0, 2);
      container.append(badge);
    }
  }
}

export default ApexScorebugMaster;
