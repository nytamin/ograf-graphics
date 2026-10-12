/**
 * Tactical Pitch Lineup
 * Full-screen tactical pitch displaying starting 11 in formation with animated player nodes.
 * Kinetic pitch lines draw, tiered formation stagger pop, and asymmetric node implosion & center wipe exit.
 */

const DEFAULT_STATE = {
  teamName: "ARSENAL",
  formation: "4 - 3 - 3",
  manager: "MIKEL ARTETA",
  teamColor: "#db0007",
  players: [
    { number: "22", name: "RAYA", position: "GK" },
    { number: "4", name: "WHITE", position: "RB" },
    { number: "2", name: "SALIBA", position: "CB" },
    { number: "6", name: "GABRIEL", position: "CB" },
    { number: "17", name: "ZINCHENKO", position: "LB" },
    { number: "8", name: "ØDEGAARD", position: "RCM" },
    { number: "41", name: "RICE", position: "CDM" },
    { number: "29", name: "HAVERTZ", position: "LCM" },
    { number: "7", name: "SAKA", position: "RW" },
    { number: "9", name: "JESUS", position: "ST" },
    { number: "11", name: "MARTINELLI", position: "LW" }
  ]
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  width: min(920px, 92vw);
  height: min(620px, 82vh);
  display: flex;
  flex-direction: column;
}

.scene.active {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%);
  clip-path: none;
}

.scene.instant {
  animation: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  clip-path: none !important;
  transform: translate(-50%, -50%) !important;
}

.scene.instant * {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

.lineup-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(16px);
}

/* Header */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(90deg, var(--team-color), #0d121c);
  border-bottom: 1px solid var(--border-subtle);
  color: #fff;
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

.team-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.team-name {
  font-size: clamp(22px, 2.8vh, 30px);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.formation-badge {
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.manager-text {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}

/* Pitch Area */
.pitch-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(20, 32, 48, 0.8), rgba(9, 13, 20, 0.95));
}

.pitch-lines {
  position: absolute;
  inset: 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  pointer-events: none;
}

.center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%);
  transform-origin: center;
}

.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.penalty-box-bottom {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-bottom: none;
}

/* Player Nodes */
.player-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  will-change: transform, opacity;
}

.player-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--team-color);
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  font-variant-numeric: tabular-nums;
}

.player-name-tag {
  background: rgba(10, 14, 22, 0.9);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Lineup board wipes open laterally
   Phase 2: Center lines & markings expand
   Phase 3: Header text slides up
   Phase 4: Player nodes pop in staggered tiers
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .lineup-board {
  animation: lineupBoardWipe 480ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes lineupBoardWipe {
  0% {
    clip-path: polygon(-60px -60px, -60px -60px, -90px calc(100% + 60px), -90px calc(100% + 60px));
    opacity: 0;
    transform: scale(0.96);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  }
}

.scene.anim-in .pitch-lines {
  animation: pitchFadeIn 450ms ease-out 100ms backwards;
}

@keyframes pitchFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.scene.anim-in .center-line {
  animation: centerLineDraw 400ms cubic-bezier(0.16, 1, 0.3, 1) 120ms backwards;
}

@keyframes centerLineDraw {
  0% { transform: translateY(-50%) scaleX(0); }
  100% { transform: translateY(-50%) scaleX(1); }
}

.scene.anim-in .center-circle {
  animation: centerCircleGrow 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 140ms backwards;
}

@keyframes centerCircleGrow {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.scene.anim-in .reveal-text {
  animation: lineupTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 120ms backwards;
}

@keyframes lineupTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .player-node {
  animation: playerPopIn 440ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes playerPopIn {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Player nodes implode (120ms), board wipes shut to center (210ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .player-node {
  animation: playerImplode 140ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes playerImplode {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
}

.scene.anim-out .lineup-board {
  animation: boardCenterWipe 180ms cubic-bezier(0.7, 0, 0.84, 0) 50ms forwards;
}

@keyframes boardCenterWipe {
  0% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 50% 0 50%);
    opacity: 0;
  }
}
`;

// Standard 4-3-3 Coordinate Grid (X%, Y% from top)
const FORMATION_COORDS_433 = [
  { x: 50, y: 88 }, // GK
  { x: 18, y: 68 }, // RB
  { x: 38, y: 72 }, // CB
  { x: 62, y: 72 }, // CB
  { x: 82, y: 68 }, // LB
  { x: 28, y: 46 }, // RCM
  { x: 50, y: 52 }, // CDM
  { x: 72, y: 46 }, // LCM
  { x: 20, y: 22 }, // RW
  { x: 50, y: 16 }, // ST
  { x: 80, y: 22 }  // LW
];

class ApexLineupPitchBoard extends HTMLElement {
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
      <div class="lineup-board">
        <div class="board-header">
          <div class="team-title">
            <div class="mask-wrap"><span class="team-name reveal-text" id="teamName"></span></div>
            <span class="formation-badge" id="formation"></span>
          </div>
          <div class="mask-wrap"><div class="manager-text reveal-text" id="manager"></div></div>
        </div>
        <div class="pitch-container">
          <div class="pitch-lines">
            <div class="center-line"></div>
            <div class="center-circle"></div>
            <div class="penalty-box-bottom"></div>
          </div>
          <div id="nodesContainer"></div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      board: scene.querySelector(".lineup-board"),
      teamName: scene.querySelector("#teamName"),
      formation: scene.querySelector("#formation"),
      manager: scene.querySelector("#manager"),
      nodesContainer: scene.querySelector("#nodesContainer")
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

  _waitForAnimation(el, fallbackMs = 580) {
    return new Promise(resolve => {
      let resolved = false;
      const onEnd = (e) => {
        if (e && e.target !== el && e.target !== this._elements.board) {
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
    await this._waitForAnimation(scene, 580);
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
    const { teamName, formation, manager, teamColor, players } = this._state;
    const el = this._elements;

    el.teamName.textContent = teamName || "";
    el.formation.textContent = formation || "";
    el.manager.textContent = manager ? `MANAGER: ${manager}` : "";

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }

    // Render 11 Player Nodes
    el.nodesContainer.innerHTML = "";
    const playerList = Array.isArray(players)
      ? players
      : typeof players === "string"
      ? players.split(",").map((entry, i) => {
          const parts = entry.trim().split(" ");
          return { number: parts[0] || String(i + 1), name: parts.slice(1).join(" ") || `PLAYER ${i + 1}` };
        })
      : [];

    FORMATION_COORDS_433.forEach((coord, i) => {
      const p = playerList[i] || { number: String(i + 1), name: `PLAYER ${i + 1}` };
      const node = document.createElement("div");
      node.className = "player-node";
      node.style.left = `${coord.x}%`;
      node.style.top = `${coord.y}%`;

      // Tiered stagger delays: GK (180ms), DEF (220-300ms), MID (340-420ms), ATT (460-520ms)
      const delay = 180 + i * 32;
      node.style.animationDelay = `${delay}ms`;

      node.innerHTML = `
        <div class="player-circle">${p.number || (i + 1)}</div>
        <div class="player-name-tag">${p.name || ""}</div>
      `;

      el.nodesContainer.append(node);
    });
  }
}

export default ApexLineupPitchBoard;
