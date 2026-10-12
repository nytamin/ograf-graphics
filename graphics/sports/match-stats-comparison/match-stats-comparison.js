/**
 * Match Stats Comparison
 * Dual-column comparison board with animated meters for possession, shots, xG, and accuracy.
 * Kinetic unmasking, team strip drop, inward value slide, outward dual bar fill, and asymmetric center collapse exit.
 */

const DEFAULT_STATE = {
  title: "MATCH STATISTICS • FULL TIME",
  teamAName: "ARSENAL",
  teamAColor: "#db0007",
  teamBName: "CHELSEA",
  teamBColor: "#034694",
  stats: [
    { label: "POSSESSION", valA: "58%", valB: "42%", pctA: 58 },
    { label: "TOTAL SHOTS", valA: "16", valB: "9", pctA: 64 },
    { label: "SHOTS ON TARGET", valA: "7", valB: "3", pctA: 70 },
    { label: "EXPECTED GOALS (xG)", valA: "2.41", valB: "0.85", pctA: 74 },
    { label: "PASS ACCURACY", valA: "88%", valB: "79%", pctA: 53 },
    { label: "FOULS COMMITTED", valA: "9", valB: "14", pctA: 39 }
  ]
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --team-a-color: #db0007;
  --team-b-color: #034694;
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

.stats-card {
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

.card-header {
  padding: 12px 24px;
  background: #0d121c;
  border-bottom: 1px solid var(--border-subtle);
  color: #fff;
  text-align: center;
  font-size: clamp(16px, 2vh, 20px);
  font-weight: 900;
  letter-spacing: 0.14em;
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

.teams-strip {
  display: flex;
  justify-content: space-between;
  padding: 12px 28px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--border-subtle);
}

.team-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(20px, 2.5vh, 26px);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-a { background: var(--team-a-color); box-shadow: 0 0 10px var(--team-a-color); }
.dot-b { background: var(--team-b-color); box-shadow: 0 0 10px var(--team-b-color); }

/* Stats List */
.stats-list {
  display: flex;
  flex-direction: column;
  padding: 16px 28px 24px;
  gap: 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  will-change: transform, opacity;
}

.stat-labels {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.val-a {
  font-size: clamp(18px, 2.2vh, 22px);
  font-weight: 900;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  min-width: 60px;
  text-align: left;
}

.stat-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.val-b {
  font-size: clamp(18px, 2.2vh, 22px);
  font-weight: 900;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  min-width: 60px;
  text-align: right;
}

/* Dual Comparison Bar */
.bar-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

.bar-a {
  height: 100%;
  background: var(--team-a-color);
  width: 0%;
  transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.bar-b {
  height: 100%;
  background: var(--team-b-color);
  width: 0%;
  transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card wipes open
   Phase 2: Header title and team strip slide into view
   Phase 3: Stat items cascade
   Phase 4: Bars animate outward from center
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .stats-card {
  animation: statsCardWipe 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes statsCardWipe {
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
  animation: statsTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes statsTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .team-pill {
  animation: teamPillDropIn 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards;
}

@keyframes teamPillDropIn {
  0% { transform: translateY(-15px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .stat-item {
  animation: statItemCascade 380ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes statItemCascade {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Bars retract (100ms), card wipes shut to center (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .stats-card {
  animation: statsCardCenterWipe 190ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes statsCardCenterWipe {
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

class ApexMatchStatsComparison extends HTMLElement {
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
      <div class="stats-card">
        <div class="card-header">
          <div class="mask-wrap"><span class="reveal-text" id="title"></span></div>
        </div>
        <div class="teams-strip">
          <div class="team-pill">
            <div class="color-dot dot-a"></div>
            <div class="mask-wrap"><span class="reveal-text" id="nameA"></span></div>
          </div>
          <div class="team-pill">
            <div class="mask-wrap"><span class="reveal-text" id="nameB"></span></div>
            <div class="color-dot dot-b"></div>
          </div>
        </div>
        <div class="stats-list" id="statsList"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".stats-card"),
      title: scene.querySelector("#title"),
      nameA: scene.querySelector("#nameA"),
      nameB: scene.querySelector("#nameB"),
      statsList: scene.querySelector("#statsList")
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
      this._animateBars();
      return { statusCode: 200, currentStep: 1 };
    }

    scene.className = "scene anim-in";
    setTimeout(() => this._animateBars(), 200);
    await this._waitForAnimation(scene, 520);
    scene.className = "scene active";
    this._currentStep = 1;
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    const { scene } = this._elements;
    this._isVisible = false;
    this._resetBars();

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
    if (this._isVisible) {
      this._animateBars();
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

  _animateBars() {
    const barsA = this.shadowRoot.querySelectorAll(".bar-a");
    const barsB = this.shadowRoot.querySelectorAll(".bar-b");
    barsA.forEach(b => {
      const pct = b.getAttribute("data-target") || "50";
      b.style.width = `${pct}%`;
    });
    barsB.forEach(b => {
      const pct = b.getAttribute("data-target") || "50";
      b.style.width = `${pct}%`;
    });
  }

  _resetBars() {
    const barsA = this.shadowRoot.querySelectorAll(".bar-a");
    const barsB = this.shadowRoot.querySelectorAll(".bar-b");
    barsA.forEach(b => { b.style.width = "0%"; });
    barsB.forEach(b => { b.style.width = "0%"; });
  }

  _applyState() {
    const { title, teamAName, teamAColor, teamBName, teamBColor, stats } = this._state;
    const el = this._elements;

    el.title.textContent = title || "MATCH STATISTICS";
    el.nameA.textContent = teamAName || "";
    el.nameB.textContent = teamBName || "";

    if (teamAColor) this.style.setProperty("--team-a-color", teamAColor);
    if (teamBColor) this.style.setProperty("--team-b-color", teamBColor);

    el.statsList.innerHTML = "";
    const items = Array.isArray(stats)
      ? stats
      : typeof stats === "string"
      ? stats.split(",").map(s => {
          const parts = s.split(":").map(p => p.trim());
          return { label: parts[0] || "", valA: parts[1] || "0", valB: parts[2] || "0", pctA: parseFloat(parts[3] || "50") };
        })
      : [];

    items.forEach((item, i) => {
      const label = item.label || "";
      const valA = String(item.valA ?? "0");
      const valB = String(item.valB ?? "0");
      const pctA = Math.min(100, Math.max(0, item.pctA ?? 50));
      const pctB = 100 - pctA;

      const statDiv = document.createElement("div");
      statDiv.className = "stat-item";
      statDiv.style.animationDelay = `${140 + i * 26}ms`;

      statDiv.innerHTML = `
        <div class="stat-labels">
          <span class="val-a">${valA}</span>
          <span class="stat-name">${label}</span>
          <span class="val-b">${valB}</span>
        </div>
        <div class="bar-track">
          <div class="bar-a" data-target="${pctA}"></div>
          <div class="bar-b" data-target="${pctB}"></div>
        </div>
      `;

      el.statsList.append(statDiv);
    });
  }
}

export default ApexMatchStatsComparison;
