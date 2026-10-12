/**
 * Standalone Match Clock & Stoppage Pill
 * Kinetic angled reveal, text mask slide-ups, elastic stoppage pop, cascading shootout dots, and asymmetric lateral speed wipe.
 */

const DEFAULT_STATE = {
  clock: "90:00",
  period: "2ND HALF",
  stoppageTime: "+5'",
  accentColor: "#00d2ff",
  penaltyDots: ["goal", "goal", "miss", "pending", "pending"]
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
  top: max(4vh, 42px);
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

/* Clock Card */
.clock-card {
  position: relative;
  display: flex;
  align-items: center;
  height: clamp(44px, 5vh, 56px);
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
}

.accent-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), rgba(0, 210, 255, 0.3));
  transform-origin: left;
}

.period-badge {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.3));
  border-right: 1px solid var(--border-subtle);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--accent-color);
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

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  font-size: clamp(22px, 2.5vh, 28px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #fff;
  letter-spacing: 0.04em;
}

.stoppage-pill {
  background: #ff3b56;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(255, 59, 86, 0.4);
}

.stoppage-pill:empty {
  display: none;
}

.shootout-track {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 14px;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  border-left: 1px solid var(--border-subtle);
}

.shootout-track:empty {
  display: none;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease;
}

.dot.goal {
  background: #00f59b;
  box-shadow: 0 0 8px #00f59b;
}

.dot.miss {
  background: #ff3b56;
  box-shadow: 0 0 8px #ff3b56;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card wipes open via angled clip-path
   Phase 2: Accent line draws across top edge
   Phase 3: Period badge & clock numbers slide up from text masks
   Phase 4: Stoppage pill pops with elastic scale
   Phase 5: Penalty dots cascade in sequence
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .clock-card {
  animation: clockCardWipe 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes clockCardWipe {
  0% {
    clip-path: polygon(-50px -50px, -50px -50px, -80px calc(100% + 50px), -80px calc(100% + 50px));
    opacity: 0;
    transform: translateX(-12px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-50px -50px, calc(100% + 50px) -50px, calc(100% + 50px) calc(100% + 50px), -50px calc(100% + 50px));
    opacity: 1;
    transform: translateX(0);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
}

.scene.anim-in .accent-line {
  animation: accentDraw 350ms cubic-bezier(0.16, 1, 0.3, 1) 60ms backwards;
}

@keyframes accentDraw {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.scene.anim-in .reveal-text {
  animation: clockTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes clockTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .stoppage-pill {
  animation: stoppagePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 180ms backwards;
}

@keyframes stoppagePop {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.scene.anim-in .dot {
  animation: dotPop 320ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.scene.anim-in .dot:nth-child(1) { animation-delay: 220ms; }
.scene.anim-in .dot:nth-child(2) { animation-delay: 260ms; }
.scene.anim-in .dot:nth-child(3) { animation-delay: 300ms; }
.scene.anim-in .dot:nth-child(4) { animation-delay: 340ms; }
.scene.anim-in .dot:nth-child(5) { animation-delay: 380ms; }

@keyframes dotPop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Directional lateral speed-shutter wipe to left (190ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .clock-card {
  animation: clockOutWipe 190ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes clockOutWipe {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 100%);
    transform: translateX(-20px);
    opacity: 0;
  }
}
`;

class ApexMatchClockExtra extends HTMLElement {
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
      <div class="clock-card">
        <div class="accent-line"></div>
        <div class="period-badge">
          <div class="mask-wrap"><span id="period" class="reveal-text"></span></div>
        </div>
        <div class="time-display">
          <div class="mask-wrap"><span id="clockText" class="reveal-text"></span></div>
          <span class="stoppage-pill" id="stoppageTime"></span>
        </div>
        <div class="shootout-track" id="shootoutTrack"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".clock-card"),
      period: scene.querySelector("#period"),
      clockText: scene.querySelector("#clockText"),
      stoppageTime: scene.querySelector("#stoppageTime"),
      shootoutTrack: scene.querySelector("#shootoutTrack")
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
    await this._waitForAnimation(scene, 220);
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
    const { clock, period, stoppageTime, accentColor, penaltyDots } = this._state;
    const el = this._elements;

    el.clockText.textContent = clock || "00:00";
    el.period.textContent = period || "";
    el.stoppageTime.textContent = stoppageTime || "";

    if (accentColor) {
      this.style.setProperty("--accent-color", accentColor);
    }

    // Render penalty shootout dots
    el.shootoutTrack.innerHTML = "";
    const items = Array.isArray(penaltyDots)
      ? penaltyDots
      : typeof penaltyDots === "string" && penaltyDots.trim()
      ? penaltyDots.split(",").map(s => s.trim())
      : [];

    items.forEach(status => {
      const s = String(status).trim().toLowerCase();
      const dot = document.createElement("div");
      dot.className = "dot";
      if (s === "g" || s === "goal" || s === "1") {
        dot.classList.add("goal");
      } else if (s === "m" || s === "miss" || s === "0") {
        dot.classList.add("miss");
      }
      el.shootoutTrack.append(dot);
    });
  }
}

export default ApexMatchClockExtra;
