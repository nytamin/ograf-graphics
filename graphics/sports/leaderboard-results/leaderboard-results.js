/**
 * Results Leaderboard
 * Ranked classification board for racing, golf, athletics, and time-trial results.
 * Kinetic racing bar flash, header mask unroll, row cascades, podium badge pops, and asymmetric right-slide & collapse exit.
 */

const DEFAULT_STATE = {
  title: "GRAND PRIX • PROVISIONAL CLASSIFICATION",
  accentColor: "#e10600",
  results: [
    { rank: "1", name: "VERSTAPPEN", team: "RED BULL RACING", gap: "LEADER", delta: "-" },
    { rank: "2", name: "NORRIS", team: "MCLAREN", gap: "+1.428", delta: "▲1" },
    { rank: "3", name: "LECLERC", team: "FERRARI", gap: "+4.195", delta: "▼1" },
    { rank: "4", name: "HAMILTON", team: "MERCEDES", gap: "+8.902", delta: "-" },
    { rank: "5", name: "PIASTRI", team: "MCLAREN", gap: "+12.341", delta: "▲2" }
  ]
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --accent-color: #e10600;
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
  width: min(840px, 92vw);
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

.leaderboard-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(16px);
  position: relative;
}

.racing-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent-color);
  box-shadow: 0 0 12px var(--accent-color);
  z-index: 10;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(90deg, var(--accent-color), #0d121c);
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

.header-title {
  font-size: clamp(18px, 2.2vh, 24px);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rows-container {
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
  gap: 6px;
}

.result-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  gap: 16px;
  will-change: transform, opacity;
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  font-variant-numeric: tabular-nums;
  will-change: transform, opacity;
}

.rank-1 { background: linear-gradient(135deg, #ffd700, #ffb300); color: #000; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
.rank-2 { background: linear-gradient(135deg, #e0e0e0, #9e9e9e); color: #000; }
.rank-3 { background: linear-gradient(135deg, #cd7f32, #8d5524); color: #fff; }

.competitor-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.competitor-name {
  font-size: clamp(18px, 2.2vh, 22px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.competitor-team {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.gap-time {
  font-size: clamp(16px, 2vh, 20px);
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  min-width: 90px;
  text-align: right;
}

.delta-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 3px;
  min-width: 32px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.delta-up { background: rgba(0, 200, 83, 0.2); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.4); }
.delta-down { background: rgba(213, 0, 0, 0.2); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.4); }
.delta-none { background: rgba(255, 255, 255, 0.05); color: var(--text-dim); }

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Racing bar slices vertically
   Phase 2: Card frame wipes open
   Phase 3: Header title slides up from mask
   Phase 4: Rows cascade in from left
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .racing-bar {
  animation: barSlice 360ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes barSlice {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

.scene.anim-in .leaderboard-card {
  animation: cardWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes cardWipeIn {
  0% {
    clip-path: polygon(-60px -60px, -60px -60px, -90px calc(100% + 60px), -90px calc(100% + 60px));
    opacity: 0;
    transform: translateX(-15px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: translateX(0);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  }
}

.scene.anim-in .reveal-text {
  animation: leaderTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes leaderTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .result-row {
  animation: rowCascade 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes rowCascade {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.scene.anim-in .rank-badge {
  animation: rankPop 360ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes rankPop {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Rows slide right, card collapses upward (210ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .result-row {
  animation: rowOutRight 150ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes rowOutRight {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(35px); opacity: 0; }
}

.scene.anim-out .leaderboard-card {
  animation: cardOutUp 190ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes cardOutUp {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-20px);
    opacity: 0;
  }
}
`;

class ApexLeaderboardResults extends HTMLElement {
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
      <div class="leaderboard-card">
        <div class="racing-bar"></div>
        <div class="card-header">
          <div class="mask-wrap"><span class="header-title reveal-text" id="title"></span></div>
        </div>
        <div class="rows-container" id="rowsContainer"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".leaderboard-card"),
      title: scene.querySelector("#title"),
      rowsContainer: scene.querySelector("#rowsContainer")
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
    const { title, accentColor, results } = this._state;
    const el = this._elements;

    el.title.textContent = title || "LEADERBOARD";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }

    el.rowsContainer.innerHTML = "";
    const items = Array.isArray(results)
      ? results
      : typeof results === "string"
      ? results.split(",").map(r => {
          const parts = r.split(":").map(s => s.trim());
          return { rank: parts[0] || "1", name: parts[1] || "", team: parts[2] || "", gap: parts[3] || "", delta: parts[4] || "-" };
        })
      : [];

    items.forEach((r, i) => {
      const rank = String(r.rank ?? "1");
      const name = r.name ?? "";
      const team = r.team ?? "";
      const gap = r.gap ?? "";
      const delta = r.delta ?? "-";

      const row = document.createElement("div");
      row.className = "result-row";
      row.style.animationDelay = `${120 + i * 28}ms`;

      let rankClass = "rank-badge";
      if (rank === "1") rankClass += " rank-1";
      else if (rank === "2") rankClass += " rank-2";
      else if (rank === "3") rankClass += " rank-3";

      let deltaClass = "delta-pill delta-none";
      if (String(delta).includes("▲")) deltaClass = "delta-pill delta-up";
      else if (String(delta).includes("▼")) deltaClass = "delta-pill delta-down";

      row.innerHTML = `
        <div class="${rankClass}" style="animation-delay: ${150 + i * 28}ms">${rank}</div>
        <div class="competitor-info">
          <span class="competitor-name">${name}</span>
          <span class="competitor-team">${team}</span>
        </div>
        <span class="gap-time">${gap}</span>
        <span class="${deltaClass}">${delta}</span>
      `;
      el.rowsContainer.append(row);
    });
  }
}

export default ApexLeaderboardResults;
