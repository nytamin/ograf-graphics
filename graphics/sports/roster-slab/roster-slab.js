/**
 * Roster Slab & Reserves
 * Vertical sidebar displaying team roster, bench, or reserve lineup.
 * Kinetic angled unmasking, header text slide-ups, staggered row cascades, and asymmetric right-edge wipe exit.
 */

const DEFAULT_STATE = {
  title: "BENCH & RESERVES",
  teamName: "ARSENAL",
  teamColor: "#db0007",
  players: [
    { number: "1", name: "RAMSDALE", position: "GK" },
    { number: "15", name: "KIWIOR", position: "DEF" },
    { number: "18", name: "TOMIYASU", position: "DEF" },
    { number: "20", name: "JORGINHO", position: "MID" },
    { number: "21", name: "VIEIRA", position: "MID" },
    { number: "19", name: "TROSSARD", position: "FWD" },
    { number: "14", name: "NKETIAH", position: "FWD" },
    { number: "24", name: "NELSON", position: "FWD" }
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
  top: max(8vh, 60px);
  bottom: max(8vh, 60px);
  right: max(5vw, 65px);
  width: min(420px, 32vw);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  display: flex;
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

.slab-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
}

/* Header */
.slab-header {
  padding: 14px 20px;
  background: linear-gradient(90deg, var(--team-color), #0d121c);
  border-bottom: 1px solid var(--border-subtle);
  color: #fff;
  display: flex;
  flex-direction: column;
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

.slab-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.team-name {
  font-size: clamp(22px, 2.6vh, 28px);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Roster Rows */
.roster-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  gap: 6px;
  overflow-y: hidden;
}

.roster-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  gap: 12px;
  will-change: transform, opacity;
}

.item-num {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.item-name {
  flex: 1;
  font-size: clamp(15px, 1.8vh, 18px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.item-pos {
  font-size: 11px;
  font-weight: 800;
  color: var(--team-color);
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 3px;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Slab wipes in from right
   Phase 2: Header title & team slide up
   Phase 3: Roster items cascade in
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .slab-card {
  animation: slabWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slabWipeIn {
  0% {
    clip-path: polygon(calc(100% + 60px) -60px, calc(100% + 60px) -60px, calc(100% + 90px) calc(100% + 60px), calc(100% + 90px) calc(100% + 60px));
    opacity: 0;
    transform: translateX(30px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: translateX(0);
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7);
  }
}

.scene.anim-in .reveal-text {
  animation: slabTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes slabTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .roster-item {
  animation: rosterItemCascade 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes rosterItemCascade {
  0% { transform: translateX(35px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Roster items slide right, slab collapses to right edge (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .roster-item {
  animation: rosterItemOut 140ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes rosterItemOut {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(25px); opacity: 0; }
}

.scene.anim-out .slab-card {
  animation: slabOutCollapse 190ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes slabOutCollapse {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 100%);
    transform: translateX(35px);
    opacity: 0;
  }
}
`;

class ApexRosterSlab extends HTMLElement {
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
      <div class="slab-card">
        <div class="slab-header">
          <div class="mask-wrap"><span class="slab-title reveal-text" id="title"></span></div>
          <div class="mask-wrap"><span class="team-name reveal-text" id="teamName"></span></div>
        </div>
        <div class="roster-list" id="rosterList"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".slab-card"),
      title: scene.querySelector("#title"),
      teamName: scene.querySelector("#teamName"),
      rosterList: scene.querySelector("#rosterList")
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
    const { title, teamName, teamColor, players } = this._state;
    const el = this._elements;

    el.title.textContent = title || "ROSTER";
    el.teamName.textContent = teamName || "";

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }

    el.rosterList.innerHTML = "";
    const items = Array.isArray(players)
      ? players
      : typeof players === "string"
      ? players.split(",").map(p => {
          const parts = p.split(":").map(s => s.trim());
          return { number: parts[0] || "", name: parts[1] || "", position: parts[2] || "" };
        })
      : [];

    items.forEach((p, i) => {
      const num = p.number ?? "";
      const name = p.name ?? "";
      const pos = p.position ?? "";

      const row = document.createElement("div");
      row.className = "roster-item";
      row.style.animationDelay = `${120 + i * 28}ms`;
      row.innerHTML = `
        <div class="item-num">${num}</div>
        <div class="item-name">${name}</div>
        <div class="item-pos">${pos}</div>
      `;
      el.rosterList.append(row);
    });
  }
}

export default ApexRosterSlab;
