/**
 * Coach & Official Tag
 * Lower-third banner for managers, coaches, and match officials.
 * Kinetic role badge expansion, masked name bar wipe, text slide-ups, drawer note drop, and asymmetric fold & sweep exit.
 */

const DEFAULT_STATE = {
  name: "MIKEL ARTETA",
  role: "HEAD COACH",
  organization: "ARSENAL FC",
  recordNote: "5TH SEASON IN CHARGE • 62% WIN RATE",
  accentColor: "#db0007",
  logoUrl: ""
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --accent-color: #db0007;
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

.main-bar {
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

.role-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: var(--accent-color);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform-origin: left;
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
  gap: 12px;
  padding: 0 22px;
  align-self: center;
}

.name-text {
  font-size: clamp(24px, 3vh, 34px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.org-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.logo-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid var(--border-subtle);
  margin-left: auto;
}

.logo-img {
  max-width: 38px;
  max-height: 38px;
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

.sub-bar {
  display: flex;
  align-items: center;
  background: #0d121c;
  border: 1px solid var(--border-subtle);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  height: clamp(30px, 3.6vh, 40px);
  padding: 0 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.record-text {
  font-size: clamp(12px, 1.5vh, 15px);
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Main bar wipes open
   Phase 2: Role badge expands from left
   Phase 3: Names slide up from masks
   Phase 4: Drawer sub-bar slides down
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .main-bar {
  animation: coachBarWipe 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes coachBarWipe {
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

.scene.anim-in .role-pill {
  animation: roleExpand 360ms cubic-bezier(0.16, 1, 0.3, 1) 60ms backwards;
}

@keyframes roleExpand {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.scene.anim-in .reveal-text {
  animation: coachTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 120ms backwards;
}

@keyframes coachTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .sub-bar {
  animation: subBarSlideDown 380ms cubic-bezier(0.16, 1, 0.3, 1) 180ms backwards;
}

@keyframes subBarSlideDown {
  0% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-10px);
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

/* ============================================================
   OUT ANIMATION:
   Sub-bar slides up behind main bar, main bar sweeps left (190ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .sub-bar {
  animation: subBarHideUp 130ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes subBarHideUp {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-8px);
    opacity: 0;
  }
}

.scene.anim-out .main-bar {
  animation: mainBarOutFast 180ms cubic-bezier(0.7, 0, 0.84, 0) 30ms forwards;
}

@keyframes mainBarOutFast {
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

class ApexCoachOfficialTag extends HTMLElement {
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
        <div class="role-pill" id="role"></div>
        <div class="name-block">
          <div class="mask-wrap"><span class="name-text reveal-text" id="name"></span></div>
          <div class="mask-wrap"><span class="org-text reveal-text" id="organization"></span></div>
        </div>
        <div class="logo-slot" id="logoSlot"></div>
      </div>
      <div class="sub-bar">
        <div class="mask-wrap"><span class="record-text reveal-text" id="recordNote"></span></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      mainBar: scene.querySelector(".main-bar"),
      subBar: scene.querySelector(".sub-bar"),
      role: scene.querySelector("#role"),
      name: scene.querySelector("#name"),
      organization: scene.querySelector("#organization"),
      logoSlot: scene.querySelector("#logoSlot"),
      recordNote: scene.querySelector("#recordNote")
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
    await this._waitForAnimation(scene, 500);
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
    const { name, role, organization, recordNote, accentColor, logoUrl } = this._state;
    const el = this._elements;

    el.name.textContent = name || "";
    el.role.textContent = role || "";
    el.organization.textContent = organization || "";
    el.recordNote.textContent = recordNote || "";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }

    el.logoSlot.innerHTML = "";
    if (logoUrl) {
      const img = document.createElement("img");
      img.className = "logo-img";
      img.src = logoUrl;
      img.alt = "Logo";
      el.logoSlot.append(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "logo-fallback";
      fb.textContent = (organization ? organization.substring(0, 2) : "★").toUpperCase();
      el.logoSlot.append(fb);
    }
  }
}

export default ApexCoachOfficialTag;
