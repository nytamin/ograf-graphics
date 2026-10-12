/**
 * Disciplinary Card & Penalty Popup
 * Kinetic 3D-tilt card entrance, detail panel mask wipe, text slide-ups, and asymmetric card-drop shutter exit.
 */

const DEFAULT_STATE = {
  cardType: "YELLOW CARD",
  playerName: "DECLAN RICE",
  playerNumber: "41",
  teamName: "ARSENAL",
  infraction: "Tactical Foul",
  timeText: "42'",
  cardColor: "#ffd600"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --card-color: #ffd600;
  --text-main: #f0f3f8;
  --text-dim: #9aa3b4;
  --bg-panel: rgba(11, 15, 24, 0.94);
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
  top: max(12vh, 120px);
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

.card-container {
  display: flex;
  align-items: stretch;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(14px);
  min-height: 56px;
}

.visual-card {
  width: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-color);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.25);
  position: relative;
  perspective: 400px;
}

.card-icon {
  width: 22px;
  height: 32px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 18px;
  gap: 2px;
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

.top-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-type-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--card-color);
  text-transform: uppercase;
}

.time-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-num {
  font-size: 20px;
  font-weight: 900;
  color: var(--card-color);
  font-variant-numeric: tabular-nums;
}

.player-name {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.team-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.infraction-text {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  font-style: italic;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card container wipes open
   Phase 2: Visual card springs in with 3D tilt
   Phase 3: Text elements slide up from masks
   Phase 4: Time pill & infraction reveal
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .card-container {
  animation: cardWipeIn 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes cardWipeIn {
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
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  }
}

.scene.anim-in .visual-card {
  animation: cardIconTilt 440ms cubic-bezier(0.34, 1.56, 0.64, 1) 60ms backwards;
}

@keyframes cardIconTilt {
  0% { transform: scale(0.5) rotate(-16deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.scene.anim-in .reveal-text {
  animation: cardTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 120ms backwards;
}

@keyframes cardTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .infraction-text {
  animation: infractionFade 360ms ease-out 180ms backwards;
}

@keyframes infractionFade {
  0% { opacity: 0; transform: translateX(8px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* ============================================================
   OUT ANIMATION:
   Detail panel wipes shut leftward, card drops down (190ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .card-container {
  animation: cardOutCollapse 190ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes cardOutCollapse {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 100% 0 0);
    transform: translateY(15px);
    opacity: 0;
  }
}
`;

class ApexPenaltyDisciplinary extends HTMLElement {
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
      <div class="card-container">
        <div class="visual-card">
          <div class="card-icon"></div>
        </div>
        <div class="details">
          <div class="top-row">
            <div class="mask-wrap"><span class="card-type-label reveal-text" id="cardType"></span></div>
            <span class="time-pill" id="timeText"></span>
            <div class="mask-wrap"><span class="team-badge reveal-text" id="teamName"></span></div>
          </div>
          <div class="player-row">
            <span class="player-num" id="playerNumber"></span>
            <div class="mask-wrap"><span class="player-name reveal-text" id="playerName"></span></div>
          </div>
          <div class="infraction-text" id="infraction"></div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".card-container"),
      cardType: scene.querySelector("#cardType"),
      timeText: scene.querySelector("#timeText"),
      teamName: scene.querySelector("#teamName"),
      playerNumber: scene.querySelector("#playerNumber"),
      playerName: scene.querySelector("#playerName"),
      infraction: scene.querySelector("#infraction")
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
        if (e && e.target !== el && e.target !== this._elements.card) {
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
    await this._waitForAnimation(scene, 210);
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
    const { cardType, playerName, playerNumber, teamName, infraction, timeText, cardColor } = this._state;
    const el = this._elements;

    el.cardType.textContent = cardType || "CARD";
    el.timeText.textContent = timeText || "";
    el.teamName.textContent = teamName || "";
    el.playerNumber.textContent = playerNumber ? `#${playerNumber}` : "";
    el.playerName.textContent = playerName || "";
    el.infraction.textContent = infraction || "";

    if (cardColor) {
      this.style.setProperty("--card-color", cardColor);
    }
  }
}

export default ApexPenaltyDisciplinary;
