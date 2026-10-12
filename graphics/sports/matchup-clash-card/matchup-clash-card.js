/**
 * Matchup Clash Card
 * Confrontation card displaying Team A vs Team B, recent form pills, venue, and kickoff.
 * Kinetic header drop, inward team slides, impact bounce "VS" badge, form pill pops, and asymmetric bilateral split wipe exit.
 */

const DEFAULT_STATE = {
  competition: "PREMIER LEAGUE • MATCHDAY 28",
  teamAName: "ARSENAL",
  teamAColor: "#db0007",
  teamALogo: "",
  teamAForm: ["W", "W", "D", "W", "L"],
  teamBName: "CHELSEA",
  teamBColor: "#034694",
  teamBLogo: "",
  teamBForm: ["W", "L", "W", "D", "W"],
  venue: "EMIRATES STADIUM, LONDON",
  kickoff: "TODAY • 20:00 BST"
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
  width: min(880px, 92vw);
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

.clash-card {
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
.competition-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: linear-gradient(90deg, var(--team-a-color), #0a0e17 50%, var(--team-b-color));
  border-bottom: 1px solid var(--border-subtle);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.16em;
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

/* Main Faceoff Arena */
.faceoff-arena {
  display: flex;
  align-items: stretch;
  padding: 30px 40px;
  position: relative;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.4));
}

.team-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  will-change: transform, opacity;
}

.team-logo-box {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
}

.team-logo-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-fallback {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
}

.team-name {
  font-size: clamp(26px, 3.2vh, 36px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-pill {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  will-change: transform, opacity;
}

.form-w { background: #00c853; }
.form-d { background: #78909c; }
.form-l { background: #d50000; }

/* VS Badge */
.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  position: relative;
}

.vs-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #0f141f;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.08em;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
  will-change: transform, opacity;
}

/* Footer */
.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #0a0e17;
  border-top: 1px solid var(--border-subtle);
  color: var(--text-dim);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kickoff-highlight {
  color: #00d2ff;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Competition bar drops into place
   Phase 2: Teams slide inward from left and right
   Phase 3: Central VS badge slams down with impact bounce
   Phase 4: Form pills pop into view
   Phase 5: Footer text reveals
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .clash-card {
  animation: cardFadeIn 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes cardFadeIn {
  0% {
    transform: scale(0.95);
    opacity: 0;
    box-shadow: 0 0 0 transparent;
  }
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
  }
}

.scene.anim-in .competition-bar {
  animation: compBarDrop 400ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes compBarDrop {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .side-a {
  animation: teamASlideIn 440ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards;
}

@keyframes teamASlideIn {
  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.scene.anim-in .side-b {
  animation: teamBSlideIn 440ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards;
}

@keyframes teamBSlideIn {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.scene.anim-in .vs-circle {
  animation: vsSlamDown 460ms cubic-bezier(0.34, 1.56, 0.64, 1) 160ms backwards;
}

@keyframes vsSlamDown {
  0% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.scene.anim-in .form-pill {
  animation: formPillPop 320ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.scene.anim-in .form-pill:nth-child(1) { animation-delay: 220ms; }
.scene.anim-in .form-pill:nth-child(2) { animation-delay: 250ms; }
.scene.anim-in .form-pill:nth-child(3) { animation-delay: 280ms; }
.scene.anim-in .form-pill:nth-child(4) { animation-delay: 310ms; }
.scene.anim-in .form-pill:nth-child(5) { animation-delay: 340ms; }

@keyframes formPillPop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.scene.anim-in .reveal-text {
  animation: clashTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 140ms backwards;
}

@keyframes clashTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   VS badge collapses, Team A and B wipe outward (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .vs-circle {
  animation: vsOutCollapse 140ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes vsOutCollapse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

.scene.anim-out .side-a {
  animation: teamAOut 180ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes teamAOut {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-40px); opacity: 0; }
}

.scene.anim-out .side-b {
  animation: teamBOut 180ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes teamBOut {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(40px); opacity: 0; }
}

.scene.anim-out .clash-card {
  animation: clashCardOut 190ms cubic-bezier(0.7, 0, 0.84, 0) 40ms forwards;
}

@keyframes clashCardOut {
  0% { clip-path: inset(0 0 0 0); opacity: 1; }
  100% { clip-path: inset(0 50% 0 50%); opacity: 0; }
}
`;

class ApexMatchupClashCard extends HTMLElement {
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
      <div class="clash-card">
        <div class="competition-bar">
          <div class="mask-wrap"><span class="reveal-text" id="competition"></span></div>
        </div>

        <div class="faceoff-arena">
          <!-- Team A -->
          <div class="team-side side-a">
            <div class="team-logo-box" id="logoBoxA"></div>
            <div class="mask-wrap"><span class="team-name reveal-text" id="nameA"></span></div>
            <div class="form-row" id="formA"></div>
          </div>

          <!-- VS Emblem -->
          <div class="vs-divider">
            <div class="vs-circle">VS</div>
          </div>

          <!-- Team B -->
          <div class="team-side side-b">
            <div class="team-logo-box" id="logoBoxB"></div>
            <div class="mask-wrap"><span class="team-name reveal-text" id="nameB"></span></div>
            <div class="form-row" id="formB"></div>
          </div>
        </div>

        <div class="footer-bar">
          <div class="mask-wrap"><span class="reveal-text" id="venue"></span></div>
          <div class="mask-wrap"><span class="kickoff-highlight reveal-text" id="kickoff"></span></div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".clash-card"),
      competition: scene.querySelector("#competition"),
      logoBoxA: scene.querySelector("#logoBoxA"),
      nameA: scene.querySelector("#nameA"),
      formA: scene.querySelector("#formA"),
      logoBoxB: scene.querySelector("#logoBoxB"),
      nameB: scene.querySelector("#nameB"),
      formB: scene.querySelector("#formB"),
      venue: scene.querySelector("#venue"),
      kickoff: scene.querySelector("#kickoff")
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
    const {
      competition, teamAName, teamAColor, teamALogo, teamAForm,
      teamBName, teamBColor, teamBLogo, teamBForm, venue, kickoff
    } = this._state;
    const el = this._elements;

    el.competition.textContent = competition || "";
    el.nameA.textContent = teamAName || "";
    el.nameB.textContent = teamBName || "";
    el.venue.textContent = venue || "";
    el.kickoff.textContent = kickoff || "";

    if (teamAColor) this.style.setProperty("--team-a-color", teamAColor);
    if (teamBColor) this.style.setProperty("--team-b-color", teamBColor);

    this._renderLogo(el.logoBoxA, teamALogo, teamAName);
    this._renderLogo(el.logoBoxB, teamBLogo, teamBName);

    this._renderForm(el.formA, teamAForm);
    this._renderForm(el.formB, teamBForm);
  }

  _renderLogo(container, url, name) {
    container.innerHTML = "";
    if (url) {
      const img = document.createElement("img");
      img.className = "team-logo-img";
      img.src = url;
      img.alt = name || "Logo";
      container.append(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "logo-fallback";
      fb.textContent = (name ? name.substring(0, 2) : "★").toUpperCase();
      container.append(fb);
    }
  }

  _renderForm(container, formList) {
    container.innerHTML = "";
    const items = Array.isArray(formList)
      ? formList
      : typeof formList === "string"
      ? formList.split(",").map(s => s.trim())
      : [];

    items.forEach((result, i) => {
      const r = String(result).toUpperCase();
      const pill = document.createElement("div");
      pill.className = `form-pill ${r === "W" ? "form-w" : r === "L" ? "form-l" : "form-d"}`;
      pill.style.animationDelay = `${220 + i * 28}ms`;
      pill.textContent = r;
      container.append(pill);
    });
  }
}

export default ApexMatchupClashCard;
