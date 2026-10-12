/**
 * Game Pulse Banner
 * Cinematic lower banner celebrating goals, points, touchdowns, and pivotal moments.
 * Team color initial full flood shrinking to tab, text slide-ups, shimmer sweep, smooth drop shadow fade, and asymmetric lateral collapse exit.
 */

const DEFAULT_STATE = {
  eventType: "GOAL",
  headline: "BUKAYO SAKA  68'",
  subtext: "Assist: Martin Ødegaard • 14th goal of the season",
  teamColor: "#db0007",
  teamLogo: "",
  badgeText: "#7"
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
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  width: min(850px, 90vw);
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

.banner-card {
  position: relative;
  display: flex;
  align-items: stretch;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(16px);
}

.color-flood {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--team-color);
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 0 30px var(--team-color);
}

.shimmer-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  transform: translateX(-100%);
  z-index: 10;
  pointer-events: none;
}

.event-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--team-color);
  color: #fff;
  padding: 0 20px;
  min-width: 130px;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.event-tab::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.25);
}

.mask-wrap {
  overflow: hidden;
  display: flex;
  align-items: center;
}

.reveal-text {
  display: block;
  will-change: transform, opacity;
}

.event-type {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.badge-text {
  font-size: 26px;
  font-weight: 900;
  opacity: 0.95;
  line-height: 1;
  margin-top: 2px;
}

.content-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 24px;
  gap: 4px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.3));
  position: relative;
  z-index: 1;
}

.headline {
  font-size: clamp(24px, 2.8vh, 32px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.subtext {
  font-size: clamp(14px, 1.6vh, 17px);
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.logo-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid var(--border-subtle);
  min-width: 80px;
  position: relative;
  z-index: 1;
}

.logo-img {
  max-width: 44px;
  max-height: 44px;
  object-fit: contain;
}

.logo-fallback {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card wipes open with unclipped drop shadow
   Phase 2: Team color flood covers 100% of card initially,
            then shrinks down to the left event-tab (130px)
   Phase 3: Headline and subtext reveal behind shrinking flood
   Phase 4: Shimmer line sweeps across top
   Phase 5: Logo badge pops in with dynamic spring
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .banner-card {
  animation: bannerCardWipe 480ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bannerCardWipe {
  0% {
    clip-path: polygon(-60px -60px, -60px -60px, -90px calc(100% + 60px), -90px calc(100% + 60px));
    opacity: 0;
    transform: translateY(20px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: translateY(0);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.3);
  }
}

.scene.anim-in .color-flood {
  animation: colorFloodShrink 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes colorFloodShrink {
  0% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
  25% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
  85% {
    opacity: 1;
    clip-path: inset(0 calc(100% - 130px) 0 0);
  }
  100% {
    opacity: 0;
    clip-path: inset(0 calc(100% - 130px) 0 0);
  }
}

.scene.anim-in .reveal-text {
  animation: pulseTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 160ms backwards;
}

@keyframes pulseTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .shimmer-bar {
  animation: shimmerSweep 500ms ease-out 220ms forwards;
}

@keyframes shimmerSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.scene.anim-in .logo-slot {
  animation: logoBadgePop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 240ms backwards;
}

@keyframes logoBadgePop {
  0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* ============================================================
   OUT ANIMATION:
   Directional collapse to left edge (200ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .banner-card {
  animation: bannerOutCollapse 200ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes bannerOutCollapse {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-30px);
    opacity: 0;
  }
}
`;

class ApexGamePulseBanner extends HTMLElement {
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
      <div class="banner-card">
        <div class="color-flood"></div>
        <div class="shimmer-bar"></div>
        <div class="event-tab">
          <div class="mask-wrap"><span class="event-type reveal-text" id="eventType"></span></div>
          <div class="mask-wrap"><span class="badge-text reveal-text" id="badgeText"></span></div>
        </div>
        <div class="content-block">
          <div class="mask-wrap"><div class="headline reveal-text" id="headline"></div></div>
          <div class="mask-wrap"><div class="subtext reveal-text" id="subtext"></div></div>
        </div>
        <div class="logo-slot" id="logoSlot"></div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".banner-card"),
      colorFlood: scene.querySelector(".color-flood"),
      eventType: scene.querySelector("#eventType"),
      badgeText: scene.querySelector("#badgeText"),
      headline: scene.querySelector("#headline"),
      subtext: scene.querySelector("#subtext"),
      logoSlot: scene.querySelector("#logoSlot")
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
    const { eventType, headline, subtext, teamColor, teamLogo, badgeText } = this._state;
    const el = this._elements;

    el.eventType.textContent = eventType || "EVENT";
    el.badgeText.textContent = badgeText || "";
    el.headline.textContent = headline || "";
    el.subtext.textContent = subtext || "";

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
      fb.textContent = (badgeText || "★").replace("#", "");
      el.logoSlot.append(fb);
    }
  }
}

export default ApexGamePulseBanner;
