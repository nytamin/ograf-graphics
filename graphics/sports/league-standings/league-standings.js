/**
 * League Standings Table
 * Comprehensive league table standings with qualification zones, GD, and points.
 * Kinetic table wipe, column header reveal, ripple row cascade, qualification glow, and asymmetric vertical center snap exit.
 */

const DEFAULT_STATE = {
  title: "PREMIER LEAGUE • TABLE STANDINGS",
  accentColor: "#38003c",
  rows: [
    { pos: 1, team: "LIVERPOOL", played: 28, won: 20, drawn: 7, lost: 1, gd: "+39", points: 67, zone: "ucl" },
    { pos: 2, team: "MAN CITY", played: 28, won: 19, drawn: 6, lost: 3, gd: "+35", points: 63, zone: "ucl" },
    { pos: 3, team: "ARSENAL", played: 28, won: 18, drawn: 7, lost: 3, gd: "+38", points: 61, zone: "ucl" },
    { pos: 4, team: "ASTON VILLA", played: 28, won: 17, drawn: 4, lost: 7, gd: "+18", points: 55, zone: "ucl" },
    { pos: 5, team: "TOTTENHAM", played: 28, won: 16, drawn: 5, lost: 7, gd: "+16", points: 53, zone: "uel" },
    { pos: 18, team: "LUTON TOWN", played: 28, won: 5, drawn: 6, lost: 17, gd: "-18", points: 21, zone: "rel" },
    { pos: 19, team: "BURNLEY", played: 28, won: 4, drawn: 5, lost: 19, gd: "-31", points: 17, zone: "rel" },
    { pos: 20, team: "SHEFFIELD UTD", played: 28, won: 3, drawn: 5, lost: 20, gd: "-50", points: 14, zone: "rel" }
  ]
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --accent-color: #38003c;
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

.table-card {
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

.table-header {
  padding: 12px 24px;
  background: linear-gradient(90deg, var(--accent-color), #0d121c);
  border-bottom: 1px solid var(--border-subtle);
  color: #fff;
  font-size: clamp(18px, 2.2vh, 24px);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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

.columns-header {
  display: grid;
  grid-template-columns: 44px 1fr 44px 44px 44px 44px 54px 64px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  text-align: center;
}

.col-team { text-align: left; padding-left: 10px; }

.rows-list {
  display: flex;
  flex-direction: column;
  padding: 6px 12px;
  gap: 4px;
}

.standings-row {
  display: grid;
  grid-template-columns: 44px 1fr 44px 44px 44px 44px 54px 64px;
  align-items: center;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  font-size: clamp(14px, 1.7vh, 17px);
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  text-align: center;
  position: relative;
  will-change: transform, opacity;
}

.zone-ucl { border-left: 3px solid #00c853; background: rgba(0, 200, 83, 0.04); }
.zone-uel { border-left: 3px solid #00d2ff; background: rgba(0, 210, 255, 0.04); }
.zone-rel { border-left: 3px solid #d50000; background: rgba(213, 0, 0, 0.04); }

.cell-pos {
  font-weight: 900;
  color: var(--text-dim);
}

.cell-team {
  text-align: left;
  padding-left: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 0.03em;
}

.cell-pts {
  font-weight: 900;
  color: #ffe066;
  font-size: 18px;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Table card wipes open
   Phase 2: Header title slides up
   Phase 3: Columns header unrolls
   Phase 4: Standings rows cascade in top-to-bottom
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .table-card {
  animation: tableWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes tableWipeIn {
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

.scene.anim-in .reveal-text {
  animation: tableTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes tableTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .columns-header {
  animation: colHeaderFade 360ms ease-out 120ms backwards;
}

@keyframes colHeaderFade {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.scene.anim-in .standings-row {
  animation: standingsRowCascade 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes standingsRowCascade {
  0% { transform: translateY(-15px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Rows collapse vertically, table snaps shut to center (220ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .standings-row {
  animation: rowCollapseOut 140ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes rowCollapseOut {
  0% { transform: scaleY(1); opacity: 1; }
  100% { transform: scaleY(0.4); opacity: 0; }
}

.scene.anim-out .table-card {
  animation: tableCenterSnap 180ms cubic-bezier(0.7, 0, 0.84, 0) 40ms forwards;
}

@keyframes tableCenterSnap {
  0% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
  100% {
    clip-path: inset(50% 0 50% 0);
    opacity: 0;
  }
}
`;

class ApexLeagueStandings extends HTMLElement {
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
      <div class="table-card">
        <div class="table-header">
          <div class="mask-wrap"><span class="reveal-text" id="title"></span></div>
        </div>
        <div class="columns-header">
          <span>POS</span>
          <span class="col-team">CLUB</span>
          <span>P</span>
          <span>W</span>
          <span>D</span>
          <span>L</span>
          <span>GD</span>
          <span>PTS</span>
        </div>
        <div class="rows-list" id="rowsList"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".table-card"),
      title: scene.querySelector("#title"),
      rowsList: scene.querySelector("#rowsList")
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

  _waitForAnimation(el, fallbackMs = 450) {
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
    await this._waitForAnimation(scene, 540);
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
    await this._waitForAnimation(scene, 240);
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
    const { title, accentColor, rows } = this._state;
    const el = this._elements;

    el.title.textContent = title || "STANDINGS";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }

    el.rowsList.innerHTML = "";
    const items = Array.isArray(rows)
      ? rows
      : typeof rows === "string"
      ? rows.split(",").map(r => {
          const parts = r.split(":").map(s => s.trim());
          return {
            pos: parts[0] || "",
            team: parts[1] || "",
            played: parts[2] || "0",
            won: parts[3] || "0",
            drawn: parts[4] || "0",
            lost: parts[5] || "0",
            gd: parts[6] || "0",
            points: parts[7] || "0",
            zone: parts[8] || "none"
          };
        })
      : [];

    items.forEach((r, i) => {
      const pos = r.pos ?? "";
      const team = r.team ?? "";
      const p = r.played ?? "0";
      const w = r.won ?? "0";
      const d = r.drawn ?? "0";
      const l = r.lost ?? "0";
      const gd = r.gd ?? "0";
      const pts = r.points ?? "0";
      const zone = String(r.zone || "none").toLowerCase();

      const row = document.createElement("div");
      row.className = `standings-row zone-${zone}`;
      row.style.animationDelay = `${140 + i * 24}ms`;

      row.innerHTML = `
        <span class="cell-pos">${pos}</span>
        <span class="cell-team">${team}</span>
        <span>${p}</span>
        <span>${w}</span>
        <span>${d}</span>
        <span>${l}</span>
        <span>${gd}</span>
        <span class="cell-pts">${pts}</span>
      `;
      el.rowsList.append(row);
    });
  }
}

export default ApexLeagueStandings;
