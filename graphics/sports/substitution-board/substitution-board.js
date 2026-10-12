/**
 * Substitution Board
 * Dual-pane substitution graphic showing player in and player out.
 * Kinetic masked header slice, dual pane reveal, indicator springs, text mask slide-ups, and asymmetric center collapse exit.
 */

const DEFAULT_STATE = {
  teamName: "ARSENAL",
  minute: "65'",
  playerInName: "GABRIEL JESUS",
  playerInNumber: "9",
  playerOutName: "KAI HAVERTZ",
  playerOutNumber: "29",
  teamColor: "#db0007"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --team-color: #db0007;
  --text-main: #f0f3f8;
  --text-dim: #9aa3b4;
  --bg-panel: rgba(11, 15, 24, 0.95);
  --border-subtle: rgba(255, 255, 255, 0.14);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base Scene: Zero Initial Paint */
.scene {
  position: absolute;
  bottom: max(6vh, 60px);
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  width: min(780px, 92vw);
}

.scene.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%);
  clip-path: none;
}

.scene.instant {
  animation: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  clip-path: none !important;
  transform: translateX(-50%) !important;
}

.scene.instant * {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

.sub-container {
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(16px);
}

/* Header */
.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 18px;
  background: linear-gradient(90deg, var(--team-color), #0f141f);
  color: #fff;
  border-bottom: 1px solid var(--border-subtle);
}

.mask-wrap {
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.reveal-text {
  display: inline-block;
  will-change: transform, opacity;
}

.sub-title {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.minute-badge {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Dual Players Row */
.players-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.player-pane {
  display: flex;
  align-items: center;
  padding: 10px 18px;
  gap: 12px;
  background: rgba(0, 0, 0, 0.25);
}

.pane-in {
  border-right: 1px solid var(--border-subtle);
}

.indicator-box {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  color: #fff;
}

.indicator-in {
  background: #00c853;
  box-shadow: 0 0 12px rgba(0, 200, 83, 0.5);
}

.indicator-out {
  background: #d50000;
  box-shadow: 0 0 12px rgba(213, 0, 0, 0.5);
}

.player-info {
  display: flex;
  flex-direction: column;
}

.action-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.label-in { color: #00e676; }
.label-out { color: #ff5252; }

.player-details {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.squad-num {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.name-text {
  font-size: clamp(18px, 2.2vh, 24px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Header slices open
   Phase 2: Player panes drop open
   Phase 3: Indicator boxes spring in
   Phase 4: Player names and numbers slide up from masks
   ============================================================ */
.scene.anim-in .sub-container {
  animation: subContainerFade 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes subContainerFade {
  0% {
    box-shadow: 0 0 0 transparent;
  }
  100% {
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65);
  }
}

.scene.anim-in .sub-header {
  animation: headerSlice 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes headerSlice {
  0% {
    clip-path: polygon(-50px -50px, -50px -50px, -70px calc(100% + 50px), -70px calc(100% + 50px));
    opacity: 0.3;
  }
  100% {
    clip-path: polygon(-50px -50px, calc(100% + 50px) -50px, calc(100% + 50px) calc(100% + 50px), -50px calc(100% + 50px));
    opacity: 1;
  }
}

.scene.anim-in .players-row {
  animation: panesDrop 420ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards;
}

@keyframes panesDrop {
  0% {
    clip-path: inset(100% 0 0 0);
    transform: translateY(15px);
    opacity: 0;
  }
  100% {
    clip-path: inset(-20px -30px -30px -30px);
    transform: translateY(0);
    opacity: 1;
  }
}

.scene.anim-in .indicator-box {
  animation: indicatorSpring 440ms cubic-bezier(0.34, 1.56, 0.64, 1) 140ms backwards;
}

@keyframes indicatorSpring {
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.scene.anim-in .reveal-text {
  animation: subNameSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 180ms backwards;
}

@keyframes subNameSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Panes collapse inward, header snaps shut (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .players-row {
  animation: panesOutCollapse 160ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes panesOutCollapse {
  0% {
    clip-path: inset(0 0 0 0);
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 40% 0 40%);
    transform: scaleX(0.8);
    opacity: 0;
  }
}

.scene.anim-out .sub-header {
  animation: headerOutSnap 180ms cubic-bezier(0.7, 0, 0.84, 0) 40ms forwards;
}

@keyframes headerOutSnap {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-12px);
    opacity: 0;
  }
}
`;

class ApexSubstitutionBoard extends HTMLElement {
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
      <div class="sub-container">
        <div class="sub-header">
          <div class="mask-wrap"><span class="sub-title reveal-text">SUBSTITUTION</span></div>
          <div class="header-right">
            <div class="mask-wrap"><span class="team-label reveal-text" id="teamName"></span></div>
            <span class="minute-badge" id="minute"></span>
          </div>
        </div>

        <div class="players-row">
          <!-- Player IN -->
          <div class="player-pane pane-in">
            <div class="indicator-box indicator-in">▲</div>
            <div class="player-info">
              <span class="action-label label-in">IN</span>
              <div class="player-details">
                <span class="squad-num" id="playerInNumber"></span>
                <div class="mask-wrap"><span class="name-text reveal-text" id="playerInName"></span></div>
              </div>
            </div>
          </div>

          <!-- Player OUT -->
          <div class="player-pane pane-out">
            <div class="indicator-box indicator-out">▼</div>
            <div class="player-info">
              <span class="action-label label-out">OUT</span>
              <div class="player-details">
                <span class="squad-num" id="playerOutNumber"></span>
                <div class="mask-wrap"><span class="name-text reveal-text" id="playerOutName"></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      container: scene.querySelector(".sub-container"),
      teamName: scene.querySelector("#teamName"),
      minute: scene.querySelector("#minute"),
      playerInNumber: scene.querySelector("#playerInNumber"),
      playerInName: scene.querySelector("#playerInName"),
      playerOutNumber: scene.querySelector("#playerOutNumber"),
      playerOutName: scene.querySelector("#playerOutName")
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

  _waitForAnimation(el, fallbackMs = 500) {
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
    await this._waitForAnimation(scene, 480);
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
    await this._waitForAnimation(scene, 230);
    scene.className = "scene";
    this._currentStep = undefined;
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

  async goToTime() {
    return { statusCode: 200 };
  }

  async setActionsSchedule() {
    return { statusCode: 200 };
  }

  _applyState() {
    const { teamName, minute, playerInName, playerInNumber, playerOutName, playerOutNumber, teamColor } = this._state;
    const el = this._elements;

    el.teamName.textContent = teamName || "";
    el.minute.textContent = minute || "";
    el.playerInNumber.textContent = playerInNumber ? `#${playerInNumber}` : "";
    el.playerInName.textContent = playerInName || "";
    el.playerOutNumber.textContent = playerOutNumber ? `#${playerOutNumber}` : "";
    el.playerOutName.textContent = playerOutName || "";

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }
  }
}

export default ApexSubstitutionBoard;
