/**
 * Goal Celebration Breakout
 * High-impact kinetic breakout banner with shot telemetry and energy sweep.
 * Kinetic blade slice, smooth impact bounce "GOAL!" slam (zero jump at end), diagonal shimmer sweep, and asymmetric sonic wipe exit.
 */

const DEFAULT_STATE = {
  eventHeadline: "GOAL!",
  scorerName: "DECLAN RICE 90+7'",
  telemetry: "SHOT SPEED: 98.4 KM/H • DISTANCE: 26.2 METERS",
  teamColor: "#db0007"
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
  --border-subtle: rgba(255, 255, 255, 0.16);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base Scene: Zero Initial Paint */
.scene {
  position: absolute;
  top: max(10vh, 100px);
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  width: min(860px, 92vw);
  display: flex;
  flex-direction: column;
}

.scene.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%);
  clip-path: none;
}

.scene.instant {
  animation: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  clip-path: none !important;
  transform: translateX(-50%) !important;
}

.scene.instant * {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

.breakout-card {
  position: relative;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(219, 0, 7, 0.35);
  backdrop-filter: blur(16px);
}

/* Diagonal speed stripe */
.stripe-accent {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -20px;
  width: 140px;
  background: var(--team-color);
  transform: skewX(-20deg);
  box-shadow: 0 0 25px var(--team-color);
}

.content-box {
  position: relative;
  z-index: 2;
  padding: 24px 36px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.headline-text {
  font-size: clamp(48px, 6.5vh, 72px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 0.95;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
  font-style: italic;
  will-change: transform, opacity;
  transform-origin: left bottom;
}

.scorer-text {
  font-size: clamp(22px, 2.8vh, 32px);
  font-weight: 800;
  color: #ffe066;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-top: 6px;
}

.telemetry-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: clamp(12px, 1.5vh, 15px);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  text-transform: uppercase;
}

.telemetry-val {
  color: #ffffff;
}

/* Light shimmer sweep */
.shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  pointer-events: none;
  z-index: 3;
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card wipes open with unclipped drop shadow
   Phase 2: Stripe accent slices into place
   Phase 3: Massive "GOAL!" crashes down with spring settle (zero jump)
   Phase 4: Shimmer sweeps across
   Phase 5: Scorer name & telemetry slide up from masks
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .breakout-card {
  animation: breakoutWipeIn 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes breakoutWipeIn {
  0% {
    clip-path: polygon(-60px -60px, -60px -60px, -90px calc(100% + 60px), -90px calc(100% + 60px));
    opacity: 0;
    transform: translateY(-20px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: translateY(0);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(219, 0, 7, 0.35);
  }
}

.scene.anim-in .stripe-accent {
  animation: stripeSliceIn 380ms cubic-bezier(0.16, 1, 0.3, 1) 60ms backwards;
}

@keyframes stripeSliceIn {
  0% { transform: skewX(-20deg) scaleX(0); }
  100% { transform: skewX(-20deg) scaleX(1); }
}

.scene.anim-in .headline-text {
  animation: goalSlamBounce 440ms cubic-bezier(0.16, 1, 0.3, 1) 60ms forwards;
}

@keyframes goalSlamBounce {
  0% {
    transform: translateY(-50px) scale(1.3);
    opacity: 0;
  }
  60% {
    transform: translateY(3px) scale(0.98);
    opacity: 1;
  }
  85% {
    transform: translateY(-1px) scale(1.01);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.scene.anim-in .shimmer {
  animation: shimmerPass 550ms ease-in-out 180ms forwards;
}

@keyframes shimmerPass {
  0% { left: -100%; }
  100% { left: 200%; }
}

.scene.anim-in .reveal-text {
  animation: breakoutTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 160ms backwards;
}

@keyframes breakoutTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Sonic Wipe — Zips off-screen to the right with shear (180ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .breakout-card {
  animation: sonicWipeOut 180ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes sonicWipeOut {
  0% {
    transform: translateX(0) skewX(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(120%) skewX(-15deg);
    opacity: 0;
  }
}
`;

class ApexGoalBreakout extends HTMLElement {
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
      <div class="breakout-card">
        <div class="stripe-accent"></div>
        <div class="shimmer" id="shimmer"></div>
        <div class="content-box">
          <div class="headline-text" id="eventHeadline"></div>
          <div class="mask-wrap"><div class="scorer-text reveal-text" id="scorerName"></div></div>
          <div class="telemetry-bar">
            <div class="mask-wrap"><span class="telemetry-val reveal-text" id="telemetry"></span></div>
          </div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".breakout-card"),
      eventHeadline: scene.querySelector("#eventHeadline"),
      scorerName: scene.querySelector("#scorerName"),
      telemetry: scene.querySelector("#telemetry"),
      shimmer: scene.querySelector("#shimmer")
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
    await this._waitForAnimation(scene, 210);
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
    const { eventHeadline, scorerName, telemetry, teamColor } = this._state;
    const el = this._elements;

    el.eventHeadline.textContent = eventHeadline || "GOAL!";
    el.scorerName.textContent = scorerName || "";
    el.telemetry.textContent = telemetry || "";

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }
  }
}

export default ApexGoalBreakout;
