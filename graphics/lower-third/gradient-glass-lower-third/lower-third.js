/**
 * Gradient Glass Lower Third Module
 * Modern frosted glass graphic featuring fluid gradients, animated edge glows,
 * traveling light flare, floating ambient background orb, and frame-accurate playback.
 */

const DEFAULT_STATE = {
  name: "Elena Rostova",
  title: "Senior Technology Editor",
  category: "SPECIAL REPORT",
  showCategory: true,
  primaryColor: "#7c3aed",
  secondaryColor: "#06b6d4",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  --primary-color: #7c3aed;
  --secondary-color: #06b6d4;
  --edge-angle: 135deg;
  --flare-left: -30%;
  --shine-x: -50%;
}

* {
  box-sizing: border-box;
}

.scene {
  position: absolute;
  left: max(5vw, 64px);
  bottom: calc(max(6vh, 64px) + env(safe-area-inset-bottom));
  opacity: 0;
  display: none;
  will-change: transform, opacity;
}

/* Gentle Floating Ambient Glow Orb behind glass card */
.ambient-orb {
  position: absolute;
  top: -30px;
  left: -20px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-color) 0%, var(--secondary-color) 45%, transparent 70%);
  filter: blur(50px);
  opacity: 0.35;
  pointer-events: none;
  will-change: transform, opacity;
}

/* Overflow visible so category tag badge extending outside is never clipped */
.glass-card {
  position: relative;
  min-width: clamp(460px, 45vw, 760px);
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow:
    0 24px 48px -12px rgba(0, 0, 0, 0.55),
    0 12px 24px -8px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  overflow: visible;
}

/* Inner Background Layer for clipped shine sweep */
.glass-inner-bg {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  overflow: hidden;
  pointer-events: none;
}

/* Animated Edge Glow Overlay */
.edge-glow-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1.5px;
  background: linear-gradient(var(--edge-angle), var(--primary-color), var(--secondary-color), var(--primary-color));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.75;
}

/* Top Accent Rail with gentle traveling light flare */
.accent-rail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 16px 16px 0 0;
  transform-origin: left center;
  overflow: hidden;
  will-change: transform;
}

.rail-flare {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--flare-left);
  width: 35%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent);
  pointer-events: none;
}

/* Moving Background Glass Shine Sweep */
.glass-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.10) 50%, transparent 55%);
  transform: translate3d(var(--shine-x), 0, 0);
  pointer-events: none;
}

/* Category / Tag badge positioned top-left over top edge */
.category-tag {
  position: absolute;
  top: -16px;
  left: 36px;
  z-index: 5;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  font-size: clamp(13px, 1.0vw, 16px);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 18px;
  border-radius: 20px;
  box-shadow:
    0 8px 20px rgba(124, 58, 237, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.25);
  will-change: transform, opacity;
}

.category-tag[hidden] {
  display: none;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
  font-size: clamp(36px, 2.6vw, 52px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.015em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.title {
  font-size: clamp(20px, 1.5vw, 28px);
  font-weight: 500;
  color: rgba(241, 245, 249, 0.9);
  line-height: 1.25;
}
`;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return Math.pow(t, 3);
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

class GradientGlassLowerThird extends HTMLElement {
  constructor() {
    super();
    this._initialData = {};
    this._state = { ...DEFAULT_STATE };
    this._mode = "realtime";
    this._currentStep = undefined;
    this._schedule = [];

    // Gentle, slower transition durations
    this._durationIn = 950;  // ms
    this._durationOut = 550; // ms

    this._playbackState = "hidden";
    this._animStartTime = 0;
    this._rafId = null;
    this._manualPlayTime = null;
    this._manualStopTime = null;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const ambientOrb = document.createElement("div");
    ambientOrb.className = "ambient-orb";

    const card = document.createElement("div");
    card.className = "glass-card";

    const glassInnerBg = document.createElement("div");
    glassInnerBg.className = "glass-inner-bg";

    const glassShine = document.createElement("div");
    glassShine.className = "glass-shine";
    glassInnerBg.append(glassShine);

    const edgeGlowBorder = document.createElement("div");
    edgeGlowBorder.className = "edge-glow-border";

    const accentRail = document.createElement("div");
    accentRail.className = "accent-rail";

    const railFlare = document.createElement("div");
    railFlare.className = "rail-flare";
    accentRail.append(railFlare);

    const categoryTag = document.createElement("div");
    categoryTag.className = "category-tag";

    const content = document.createElement("div");
    content.className = "content";

    const nameEl = document.createElement("div");
    nameEl.className = "name";

    const titleEl = document.createElement("div");
    titleEl.className = "title";

    content.append(nameEl, titleEl);
    card.append(glassInnerBg, edgeGlowBorder, accentRail, categoryTag, content);
    scene.append(ambientOrb, card);
    root.append(style, scene);

    this._elements = { scene, card, ambientOrb, glassInnerBg, edgeGlowBorder, glassShine, accentRail, railFlare, categoryTag, nameEl, titleEl };
  }

  connectedCallback() {
    this._renderFrame(0, 0, 0);
  }

  async load(params) {
    this._initialData = params?.data ? JSON.parse(JSON.stringify(params.data)) : {};
    this._mode = params?.renderType || "realtime";
    this._state = { ...DEFAULT_STATE, ...(params?.data || {}) };
    this._applyState();

    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load("800 48px Inter"),
        document.fonts.load("500 24px Inter"),
      ]).catch(() => undefined);
    }

    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelRealtimeLoop();
    this._elements.scene.remove();
    this.shadowRoot.innerHTML = "";
    return { statusCode: 200 };
  }

  async playAction(params) {
    const targetStep = this._resolveTargetStep(params);
    const skipAnimation = params?.skipAnimation === true;

    if (targetStep === undefined) {
      return this.stopAction(params);
    }

    this._currentStep = targetStep;
    this._manualPlayTime = performance.now();
    this._manualStopTime = null;

    if (skipAnimation) {
      this._cancelRealtimeLoop();
      this._playbackState = "visible";
      this._renderFrame(1, 0, performance.now() - this._manualPlayTime);
      this._startContinuousLoop();
      return { statusCode: 200, currentStep: this._currentStep };
    }

    return new Promise((resolve) => {
      this._cancelRealtimeLoop();
      this._playbackState = "anim_in";
      this._animStartTime = performance.now();

      const tick = () => {
        const now = performance.now();
        const elapsed = now - this._animStartTime;
        const inProgress = clamp(elapsed / this._durationIn, 0, 1);

        this._renderFrame(inProgress, 0, elapsed);

        if (inProgress < 1) {
          this._rafId = requestAnimationFrame(tick);
        } else {
          this._playbackState = "visible";
          this._startContinuousLoop();
          resolve({ statusCode: 200, currentStep: this._currentStep });
        }
      };

      this._rafId = requestAnimationFrame(tick);
    });
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    this._currentStep = undefined;
    this._manualStopTime = performance.now();

    if (skipAnimation) {
      this._cancelRealtimeLoop();
      this._playbackState = "hidden";
      this._renderFrame(0, 0, 0);
      return { statusCode: 200 };
    }

    return new Promise((resolve) => {
      this._cancelRealtimeLoop();
      this._playbackState = "anim_out";
      this._animStartTime = performance.now();

      const tick = () => {
        const now = performance.now();
        const elapsed = now - this._animStartTime;
        const outProgress = clamp(elapsed / this._durationOut, 0, 1);

        const totalElapsed = this._manualPlayTime !== null ? now - this._manualPlayTime : elapsed;
        this._renderFrame(1, outProgress, totalElapsed);

        if (outProgress < 1) {
          this._rafId = requestAnimationFrame(tick);
        } else {
          this._playbackState = "hidden";
          this._renderFrame(0, 0, 0);
          this._rafId = null;
          resolve({ statusCode: 200 });
        }
      };

      this._rafId = requestAnimationFrame(tick);
    });
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    const timestamp = typeof params?.timestamp === "number" ? params.timestamp : 0;
    this._cancelRealtimeLoop();
    this._renderAtTimestamp(timestamp);
    return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    const schedule = params?.schedule || [];
    this._schedule = schedule.slice().sort((a, b) => a.timestamp - b.timestamp);
    return { statusCode: 200 };
  }

  _applyState() {
    const { name, title, category, showCategory, primaryColor, secondaryColor } = this._state;
    const { nameEl, titleEl, categoryTag } = this._elements;

    nameEl.textContent = name || "";
    titleEl.textContent = title || "";
    categoryTag.textContent = category || "";

    const hasCategory = Boolean(showCategory && category);
    categoryTag.hidden = !hasCategory;

    if (primaryColor) {
      this.style.setProperty("--primary-color", primaryColor);
    }
    if (secondaryColor) {
      this.style.setProperty("--secondary-color", secondaryColor);
    }
  }

  _startContinuousLoop() {
    this._cancelRealtimeLoop();
    const loop = () => {
      if (this._playbackState !== "visible") return;
      const elapsed = performance.now() - (this._manualPlayTime || 0);
      this._renderFrame(1, 0, elapsed);
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _renderAtTimestamp(timestamp) {
    if (this._schedule.length > 0) {
      let activePlay = null;
      let activeStop = null;
      let currentState = { ...(typeof DEFAULT_STATE !== "undefined" ? DEFAULT_STATE : {}), ...JSON.parse(JSON.stringify(this._initialData)) };

      for (const item of this._schedule) {
        if (item.timestamp > timestamp) break;
        if (item.action.type === "playAction") {
          activePlay = item.timestamp;
        } else if (item.action.type === "stopAction") {
          activeStop = item.timestamp;
        } else if (item.action.type === "updateAction") {
          currentState = { ...currentState, ...(item.action.params?.data || {}) };
        }
      }

      this._state = currentState;
      this._applyState();

      if (activePlay === null || timestamp < activePlay) {
        this._renderFrame(0, 0, timestamp);
        return;
      }

      if (activeStop === null || activePlay > activeStop) {
        const inProgress = clamp((timestamp - activePlay) / this._durationIn, 0, 1);
        this._renderFrame(inProgress, 0, timestamp);
        return;
      }

      if (timestamp < activeStop) {
        const inProgress = clamp((timestamp - activePlay) / this._durationIn, 0, 1);
        this._renderFrame(inProgress, 0, timestamp);
      } else {
        const outProgress = clamp((timestamp - activeStop) / this._durationOut, 0, 1);
        this._renderFrame(1, outProgress, timestamp);
      }
    } else {
      const playTime = this._manualPlayTime !== null ? this._manualPlayTime : 0;
      const stopTime = this._manualStopTime;

      if (timestamp < playTime) {
        this._renderFrame(0, 0, timestamp);
      } else if (stopTime === null || timestamp < stopTime) {
        const inProgress = clamp((timestamp - playTime) / this._durationIn, 0, 1);
        this._renderFrame(inProgress, 0, timestamp);
      } else {
        const outProgress = clamp((timestamp - stopTime) / this._durationOut, 0, 1);
        this._renderFrame(1, outProgress, timestamp);
      }
    }
  }

  _renderFrame(inProgress, outProgress, timeMs) {
    const { scene, accentRail, categoryTag, ambientOrb } = this._elements;

    if (inProgress <= 0 || outProgress >= 1) {
      scene.style.opacity = "0";
      scene.style.display = "none";
      scene.style.transform = "none";
      return;
    }

    scene.style.display = "block";

    const inEase = easeOutCubic(inProgress);
    const inBack = easeOutBack(inProgress);
    const outEase = easeInCubic(outProgress);

    const overallOpacity = inEase * (1 - outEase);
    const slideX = -40 * (1 - inEase) + 25 * outEase;
    const slideY = 15 * (1 - inEase) - 10 * outEase;
    const scale = (0.94 + 0.06 * inEase) * (1 - 0.04 * outEase);

    scene.style.opacity = String(overallOpacity);
    scene.style.transform = `translate3d(${slideX}px, ${slideY}px, 0) scale(${scale})`;

    accentRail.style.transform = `scaleX(${inEase})`;

    const tagScale = 0.82 + 0.18 * inBack;
    const tagOffsetY = -8 * (1 - inEase);
    categoryTag.style.transform = `translate3d(0, ${tagOffsetY}px, 0) scale(${tagScale})`;
    categoryTag.style.opacity = String(inEase);

    // Continuous time-driven deterministic animations (Slower & Gentler)
    const t = typeof timeMs === "number" ? timeMs : 0;

    // 1. Slow, gentle edge glow border angle rotation
    const edgeAngle = (t * 0.015) % 360;
    this.style.setProperty("--edge-angle", `${edgeAngle}deg`);

    // 2. Slow top rail flare position
    const flareLeft = (t * 0.035) % 160 - 30;
    this.style.setProperty("--flare-left", `${flareLeft}%`);

    // 3. Gentle glass shine sweep
    const shineX = (t * 0.02) % 220 - 60;
    this.style.setProperty("--shine-x", `${shineX}%`);

    // 4. Smooth, peaceful ambient orb oscillation
    const orbX = Math.sin(t * 0.0006) * 30;
    const orbY = Math.cos(t * 0.0008) * 12;
    const orbPulse = 0.6 + 0.1 * Math.sin(t * 0.001);
    ambientOrb.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) scale(${orbPulse})`;
  }

  _cancelRealtimeLoop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _resolveTargetStep(params) {
    const stepCount = 1;
    const goto = params?.goto;
    const delta = typeof params?.delta === "number" ? params.delta : 1;

    if (typeof goto === "number") {
      return goto >= stepCount ? undefined : Math.max(0, goto);
    }

    const current = typeof this._currentStep === "number" ? this._currentStep : -1;
    const target = current + delta;

    if (target >= stepCount) {
      return undefined;
    }

    return Math.max(0, target);
  }
}

export default GradientGlassLowerThird;
