/**
 * Tournament Bracket Visualizer
 * Knockout tree showing Semifinals into Grand Final with winner highlighting.
 * Kinetic header wipe, semifinal box reveals, animated SVG connector drawing, final box expansion, and asymmetric connector retract & implosion exit.
 */

const DEFAULT_STATE = {
  title: "CHAMPIONS LEAGUE • SEMIFINALS & FINAL",
  semi1: {
    teamA: "REAL MADRID",
    scoreA: "2",
    teamB: "BAYERN MUNICH",
    scoreB: "1",
    winner: "A"
  },
  semi2: {
    teamA: "BORUSSIA DORTMUND",
    scoreA: "2",
    teamB: "PARIS SG",
    scoreB: "0",
    winner: "A"
  },
  final: {
    teamA: "REAL MADRID",
    scoreA: "2",
    teamB: "BORUSSIA DORTMUND",
    scoreB: "0",
    winner: "A"
  },
  accentColor: "#00d2ff"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --accent-color: #00d2ff;
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
  width: min(960px, 94vw);
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

.bracket-card {
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

.bracket-header {
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

/* Bracket Grid */
.tree-container {
  display: grid;
  grid-template-columns: 1fr 60px 1.2fr;
  align-items: center;
  padding: 30px 40px;
  gap: 16px;
  position: relative;
}

.semis-col {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.round-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--accent-color);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.match-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
}

.match-team {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.match-team:last-child {
  border-bottom: none;
}

.match-team.winner {
  background: rgba(0, 210, 255, 0.12);
  color: #00d2ff;
  border-left: 3px solid #00d2ff;
}

.team-score {
  font-size: 16px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  padding-left: 10px;
}

/* Connectors */
.connector-col {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.connector-svg {
  width: 100%;
  height: 180px;
}

.connector-path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  will-change: stroke-dashoffset;
}

/* Final Column */
.final-col {
  display: flex;
  flex-direction: column;
}

.final-card {
  border: 1px solid rgba(0, 210, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.15);
}

.trophy-badge {
  font-size: 12px;
  font-weight: 900;
  color: #ffe066;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Bracket card wipes open
   Phase 2: Header title slides up
   Phase 3: Semifinal boxes slide in from left
   Phase 4: SVG connectors draw across
   Phase 5: Grand Final box expands with halo
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .bracket-card {
  animation: bracketWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bracketWipeIn {
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
  animation: bracketTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes bracketTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .semis-col .match-box {
  animation: semiBoxSlide 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.scene.anim-in .semis-col > div:nth-child(1) .match-box { animation-delay: 120ms; }
.scene.anim-in .semis-col > div:nth-child(2) .match-box { animation-delay: 160ms; }

@keyframes semiBoxSlide {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.scene.anim-in .connector-path {
  animation: connectorDraw 460ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards;
}

@keyframes connectorDraw {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}

.scene.anim-in .final-card {
  animation: finalBoxPop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) 280ms backwards;
}

@keyframes finalBoxPop {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Connector paths retract, boxes implode (220ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .connector-path {
  animation: connectorRetract 130ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes connectorRetract {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -200; }
}

.scene.anim-out .match-box {
  animation: matchBoxImplode 150ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes matchBoxImplode {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.88); opacity: 0; }
}

.scene.anim-out .bracket-card {
  animation: bracketOutFade 190ms cubic-bezier(0.7, 0, 0.84, 0) 40ms forwards;
}

@keyframes bracketOutFade {
  0% { clip-path: inset(0 0 0 0); opacity: 1; }
  100% { clip-path: inset(0 50% 0 50%); opacity: 0; }
}
`;

class ApexTournamentBracket extends HTMLElement {
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
      <div class="bracket-card">
        <div class="bracket-header">
          <div class="mask-wrap"><span class="reveal-text" id="title"></span></div>
        </div>

        <div class="tree-container">
          <!-- Semifinals -->
          <div class="semis-col">
            <div>
              <div class="round-label">SEMIFINAL 1</div>
              <div class="match-box" id="semi1Box">
                <div class="match-team" id="semi1TeamA">
                  <span class="t-name" id="s1Na"></span>
                  <span class="team-score" id="s1Sa"></span>
                </div>
                <div class="match-team" id="semi1TeamB">
                  <span class="t-name" id="s1Nb"></span>
                  <span class="team-score" id="s1Sb"></span>
                </div>
              </div>
            </div>

            <div>
              <div class="round-label">SEMIFINAL 2</div>
              <div class="match-box" id="semi2Box">
                <div class="match-team" id="semi2TeamA">
                  <span class="t-name" id="s2Na"></span>
                  <span class="team-score" id="s2Sa"></span>
                </div>
                <div class="match-team" id="semi2TeamB">
                  <span class="t-name" id="s2Nb"></span>
                  <span class="team-score" id="s2Sb"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector SVG -->
          <div class="connector-col">
            <svg class="connector-svg" viewBox="0 0 60 180" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2">
              <path class="connector-path" d="M 0 35 H 30 V 90 H 60" />
              <path class="connector-path" d="M 0 145 H 30 V 90" />
            </svg>
          </div>

          <!-- Grand Final -->
          <div class="final-col">
            <div class="round-label">CHAMPIONSHIP FINAL</div>
            <div class="match-box final-card" id="finalBox">
              <div class="trophy-badge">🏆 GRAND FINAL</div>
              <div class="match-team" id="finalTeamA">
                <span class="t-name" id="fNa"></span>
                <span class="team-score" id="fSa"></span>
              </div>
              <div class="match-team" id="finalTeamB">
                <span class="t-name" id="fNb"></span>
                <span class="team-score" id="fSb"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".bracket-card"),
      title: scene.querySelector("#title"),
      s1Na: scene.querySelector("#s1Na"),
      s1Sa: scene.querySelector("#s1Sa"),
      semi1TeamA: scene.querySelector("#semi1TeamA"),
      s1Nb: scene.querySelector("#s1Nb"),
      s1Sb: scene.querySelector("#s1Sb"),
      semi1TeamB: scene.querySelector("#semi1TeamB"),
      s2Na: scene.querySelector("#s2Na"),
      s2Sa: scene.querySelector("#s2Sa"),
      semi2TeamA: scene.querySelector("#semi2TeamA"),
      s2Nb: scene.querySelector("#s2Nb"),
      s2Sb: scene.querySelector("#s2Sb"),
      semi2TeamB: scene.querySelector("#semi2TeamB"),
      fNa: scene.querySelector("#fNa"),
      fSa: scene.querySelector("#fSa"),
      finalTeamA: scene.querySelector("#finalTeamA"),
      fNb: scene.querySelector("#fNb"),
      fSb: scene.querySelector("#fSb"),
      finalTeamB: scene.querySelector("#finalTeamB")
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

  _waitForAnimation(el, fallbackMs = 540) {
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
    const { title, semi1, semi2, final, accentColor } = this._state;
    const el = this._elements;

    el.title.textContent = title || "TOURNAMENT BRACKET";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }

    // Semifinal 1
    el.s1Na.textContent = semi1?.teamA || "";
    el.s1Sa.textContent = semi1?.scoreA || "";
    el.s1Nb.textContent = semi1?.teamB || "";
    el.s1Sb.textContent = semi1?.scoreB || "";
    el.semi1TeamA.classList.toggle("winner", semi1?.winner === "A");
    el.semi1TeamB.classList.toggle("winner", semi1?.winner === "B");

    // Semifinal 2
    el.s2Na.textContent = semi2?.teamA || "";
    el.s2Sa.textContent = semi2?.scoreA || "";
    el.s2Nb.textContent = semi2?.teamB || "";
    el.s2Sb.textContent = semi2?.scoreB || "";
    el.semi2TeamA.classList.toggle("winner", semi2?.winner === "A");
    el.semi2TeamB.classList.toggle("winner", semi2?.winner === "B");

    // Grand Final
    el.fNa.textContent = final?.teamA || "";
    el.fSa.textContent = final?.scoreA || "";
    el.fNb.textContent = final?.teamB || "";
    el.fSb.textContent = final?.scoreB || "";
    el.finalTeamA.classList.toggle("winner", final?.winner === "A");
    el.finalTeamB.classList.toggle("winner", final?.winner === "B");
  }
}

export default ApexTournamentBracket;
