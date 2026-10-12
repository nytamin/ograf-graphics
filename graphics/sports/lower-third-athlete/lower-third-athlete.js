/**
 * Athlete Lower Third
 * Two-tier broadcast identity bar for players and athletes.
 * Kinetic angled unmasking, jersey badge spring, text slide-ups, accordion stat unroll, and asymmetric fold & sweep exit.
 */

const DEFAULT_STATE = {
  firstName: "ERLING",
  lastName: "HAALAND",
  playerNumber: "9",
  position: "STRIKER",
  statHighlight: "27 GOALS IN 24 APPEARANCES THIS SEASON",
  teamColor: "#6cabdd",
  teamLogo: ""
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --team-color: #6cabdd;
  --text-main: #f0f3f8;
  --text-dim: #9aa3b4;
  --bg-panel: rgba(11, 15, 24, 0.94);
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
  left: max(5vw, 65px);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  display: flex;
  flex-direction: column;
  gap: 3px;
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

/* Tier 1: Main Name & Badge Bar */
.main-bar {
  position: relative;
  display: flex;
  align-items: stretch;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(14px);
  height: clamp(52px, 6vh, 68px);
}

.accent-slice {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--team-color);
  z-index: 5;
}

.num-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: var(--team-color);
  color: #fff;
  font-size: clamp(24px, 3vh, 32px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.25);
  min-width: 60px;
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

.name-block {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 0 24px;
  align-self: center;
}

.first-name {
  font-size: clamp(16px, 2vh, 22px);
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.last-name {
  font-size: clamp(26px, 3.2vh, 36px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.logo-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid var(--border-subtle);
  margin-left: auto;
}

.logo-img {
  max-width: 40px;
  max-height: 40px;
  object-fit: contain;
}

.logo-fallback {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
}

/* Tier 2: Subtitle & Stat Ticker */
.sub-bar {
  display: flex;
  align-items: center;
  background: #0d121c;
  border: 1px solid var(--border-subtle);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  height: clamp(32px, 3.8vh, 42px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.pos-tag {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
  border-right: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 800;
  color: var(--team-color);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stat-ticker {
  padding: 0 20px;
  font-size: clamp(13px, 1.6vh, 16px);
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Accent slice shoots vertically
   Phase 2: Main bar wipes open laterally
   Phase 3: Number badge springs in
   Phase 4: Names slide up from masks
   Phase 5: Sub-bar drops accordion-style
   Phase 6: Position & stat text slide into view
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .main-bar {
  animation: mainBarWipe 440ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes mainBarWipe {
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
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }
}

.scene.anim-in .accent-slice {
  animation: sliceGrow 340ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes sliceGrow {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

.scene.anim-in .num-badge {
  animation: numSpring 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms backwards;
}

@keyframes numSpring {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.scene.anim-in .name-block .reveal-text {
  animation: nameSlideUp 380ms cubic-bezier(0.16, 1, 0.3, 1) 140ms backwards;
}

@keyframes nameSlideUp {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .sub-bar {
  animation: subBarAccordion 380ms cubic-bezier(0.16, 1, 0.3, 1) 200ms backwards;
}

@keyframes subBarAccordion {
  0% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-8px);
    opacity: 0;
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: inset(-20px -40px -30px -40px);
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
}

.scene.anim-in .sub-bar .reveal-text {
  animation: subTextReveal 360ms cubic-bezier(0.16, 1, 0.3, 1) 260ms backwards;
}

@keyframes subTextReveal {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Sub-bar folds up, main bar sweeps left (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .sub-bar {
  animation: subBarFold 140ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes subBarFold {
  0% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-6px);
    opacity: 0;
  }
}

.scene.anim-out .main-bar {
  animation: mainBarOutSweep 190ms cubic-bezier(0.7, 0, 0.84, 0) 40ms forwards;
}

@keyframes mainBarOutSweep {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-35px);
    opacity: 0;
  }
}
`;

class ApexLowerThirdAthlete extends HTMLElement {
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
      <div class="main-bar">
        <div class="accent-slice"></div>
        <div class="num-badge" id="playerNumber"></div>
        <div class="name-block">
          <div class="mask-wrap"><span class="first-name reveal-text" id="firstName"></span></div>
          <div class="mask-wrap"><span class="last-name reveal-text" id="lastName"></span></div>
        </div>
        <div class="logo-slot" id="logoSlot"></div>
      </div>
      <div class="sub-bar">
        <div class="pos-tag">
          <div class="mask-wrap"><span class="reveal-text" id="position"></span></div>
        </div>
        <div class="stat-ticker">
          <div class="mask-wrap"><span class="reveal-text" id="statHighlight"></span></div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      mainBar: scene.querySelector(".main-bar"),
      subBar: scene.querySelector(".sub-bar"),
      playerNumber: scene.querySelector("#playerNumber"),
      firstName: scene.querySelector("#firstName"),
      lastName: scene.querySelector("#lastName"),
      logoSlot: scene.querySelector("#logoSlot"),
      position: scene.querySelector("#position"),
      statHighlight: scene.querySelector("#statHighlight")
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
        if (e && e.target !== el && e.target !== this._elements.mainBar) {
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
    const { firstName, lastName, playerNumber, position, statHighlight, teamColor, teamLogo } = this._state;
    const el = this._elements;

    el.playerNumber.textContent = playerNumber || "";
    el.firstName.textContent = firstName || "";
    el.lastName.textContent = lastName || "";
    el.position.textContent = position || "";
    el.statHighlight.textContent = statHighlight || "";

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }

    el.logoSlot.innerHTML = "";
    if (teamLogo) {
      const img = document.createElement("img");
      img.className = "logo-img";
      img.src = teamLogo;
      img.alt = "Logo";
      el.logoSlot.append(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "logo-fallback";
      fb.textContent = (lastName ? lastName.substring(0, 2) : "★").toUpperCase();
      el.logoSlot.append(fb);
    }
  }
}

export default ApexLowerThirdAthlete;
