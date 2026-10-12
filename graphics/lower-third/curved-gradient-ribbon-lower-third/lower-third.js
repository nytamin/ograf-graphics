/**
 * Curved Gradient Ribbon Lower Third Module
 * Dynamic interlocking curved ribbon graphic with multi-stop color gradients,
 * gentle specular ribbon sheen, soft background glow, and frame-accurate playback.
 */

const DEFAULT_STATE = {
  name: "Marcus Vance",
  title: "Chief Global Strategist",
  location: "LONDON STUDIO",
  showLocation: true,
  primaryGradientStart: "#0f172a",
  primaryGradientEnd: "#1e3a8a",
  accentGradientStart: "#f59e0b",
  accentGradientEnd: "#ef4444",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  --p-start: #0f172a;
  --p-end: #1e3a8a;
  --a-start: #f59e0b;
  --a-end: #ef4444;
  --sheen-left: -30%;
  --ribbon-angle: 90deg;
  --pulse-ring: 0px;
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

/* Gentle, ultra-soft ambient backdrop glow behind ribbon stack */
.ambient-glow {
  position: absolute;
  top: -20px;
  left: 40px;
  width: 380px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(37, 99, 235, 0.25) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 75%);
  filter: blur(60px);
  opacity: 0.25;
  pointer-events: none;
  will-change: transform, opacity;
}

.ribbon-stack {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0px;
}

.top-ribbon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: clamp(480px, 48vw, 780px);
  background: linear-gradient(var(--ribbon-angle), var(--p-start), var(--p-end));
  border-radius: 40px 16px 16px 40px;
  padding: 24px 36px 24px 20px;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.6),
    0 8px 18px -4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  overflow: hidden;
  will-change: transform, opacity;
}

/* Gentle Traveling Specular Ribbon Sheen */
.ribbon-sheen {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--sheen-left);
  width: 35%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.25), transparent);
  transform: skewX(-20deg);
  pointer-events: none;
}

/* Gentle Top Ribbon Edge Highlight */
.top-edge-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--a-start), rgba(255, 255, 255, 0.6), transparent);
  opacity: 0.7;
  pointer-events: none;
}

.icon-badge {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--a-start), var(--a-end));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow:
    0 6px 16px rgba(245, 158, 11, 0.45),
    0 0 var(--pulse-ring) var(--a-start);
  will-change: transform, box-shadow;
}

.icon-badge svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.name-text {
  font-size: clamp(38px, 2.7vw, 54px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.015em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.bottom-ribbon {
  position: relative;
  z-index: 1;
  margin-top: -8px;
  margin-left: 54px;
  display: inline-flex;
  align-items: center;
  gap: 20px;
  min-width: clamp(380px, 36vw, 600px);
  background: linear-gradient(var(--ribbon-angle), var(--a-start), var(--a-end));
  border-radius: 0 0 16px 16px;
  padding: 18px 32px 14px 28px;
  box-shadow:
    0 16px 32px -8px rgba(0, 0, 0, 0.5),
    0 6px 14px -4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  overflow: hidden;
  will-change: transform, opacity;
}

.title-text {
  font-size: clamp(20px, 1.5vw, 28px);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.location-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(12px, 0.9vw, 15px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 12px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.location-badge[hidden] {
  display: none;
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

class CurvedGradientRibbonLowerThird extends HTMLElement {
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

    const ambientGlow = document.createElement("div");
    ambientGlow.className = "ambient-glow";

    const stack = document.createElement("div");
    stack.className = "ribbon-stack";

    // Top ribbon
    const topRibbon = document.createElement("div");
    topRibbon.className = "top-ribbon";

    const topEdgeHighlight = document.createElement("div");
    topEdgeHighlight.className = "top-edge-highlight";

    const ribbonSheen = document.createElement("div");
    ribbonSheen.className = "ribbon-sheen";

    const iconBadge = document.createElement("div");
    iconBadge.className = "icon-badge";
    iconBadge.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

    const nameText = document.createElement("div");
    nameText.className = "name-text";

    topRibbon.append(topEdgeHighlight, ribbonSheen, iconBadge, nameText);

    // Bottom ribbon
    const bottomRibbon = document.createElement("div");
    bottomRibbon.className = "bottom-ribbon";

    const titleText = document.createElement("div");
    titleText.className = "title-text";

    const locationBadge = document.createElement("div");
    locationBadge.className = "location-badge";

    bottomRibbon.append(titleText, locationBadge);

    stack.append(topRibbon, bottomRibbon);
    scene.append(ambientGlow, stack);
    root.append(style, scene);

    this._elements = { scene, stack, ambientGlow, topRibbon, topEdgeHighlight, ribbonSheen, iconBadge, nameText, bottomRibbon, titleText, locationBadge };
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
        document.fonts.load("800 48px 'Plus Jakarta Sans'"),
        document.fonts.load("700 24px 'Plus Jakarta Sans'"),
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
    const { name, title, location, showLocation, primaryGradientStart, primaryGradientEnd, accentGradientStart, accentGradientEnd } = this._state;
    const { nameText, titleText, locationBadge } = this._elements;

    nameText.textContent = name || "";
    titleText.textContent = title || "";
    locationBadge.textContent = location || "";

    const hasLocation = Boolean(showLocation && location);
    locationBadge.hidden = !hasLocation;

    if (primaryGradientStart) this.style.setProperty("--p-start", primaryGradientStart);
    if (primaryGradientEnd) this.style.setProperty("--p-end", primaryGradientEnd);
    if (accentGradientStart) this.style.setProperty("--a-start", accentGradientStart);
    if (accentGradientEnd) this.style.setProperty("--a-end", accentGradientEnd);
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
    const { scene, topRibbon, iconBadge, bottomRibbon, ambientGlow } = this._elements;

    if (inProgress <= 0 || outProgress >= 1) {
      scene.style.opacity = "0";
      scene.style.display = "none";
      scene.style.transform = "none";
      return;
    }

    scene.style.display = "block";

    const inEaseTop = easeOutCubic(clamp(inProgress / 0.8, 0, 1));
    const inEaseBottom = easeOutCubic(clamp((inProgress - 0.2) / 0.8, 0, 1));
    const inBackBadge = easeOutBack(clamp((inProgress - 0.1) / 0.7, 0, 1));

    const outEase = easeInCubic(outProgress);
    const overallOpacity = Math.max(0, 1 - outEase);

    scene.style.opacity = String(overallOpacity);

    // Top ribbon animation
    const topSlideX = -60 * (1 - inEaseTop) + 35 * outEase;
    topRibbon.style.transform = `translate3d(${topSlideX}px, 0, 0)`;
    topRibbon.style.opacity = String(inEaseTop);

    // Badge animation inside top ribbon
    const badgeScale = 0.75 + 0.25 * inBackBadge;
    iconBadge.style.transform = `scale(${badgeScale})`;

    // Bottom ribbon animation (unfolds downwards)
    const bottomSlideY = -30 * (1 - inEaseBottom) + 18 * outEase;
    const bottomOpacity = inEaseBottom * (1 - outEase);
    bottomRibbon.style.transform = `translate3d(0, ${bottomSlideY}px, 0)`;
    bottomRibbon.style.opacity = String(bottomOpacity);

    // Continuous time-driven deterministic edge glare sheen & background movements (Gentle & Slow)
    const t = typeof timeMs === "number" ? timeMs : 0;

    // 1. Slow, gentle traveling specular ribbon sheen glare
    const sheenLeft = (t * 0.035) % 180 - 30;
    this.style.setProperty("--sheen-left", `${sheenLeft}%`);

    // 2. Liquid moving gradient angle shift (very subtle ±6 deg tilt)
    const ribbonAngle = 90 + Math.sin(t * 0.0006) * 6;
    this.style.setProperty("--ribbon-angle", `${ribbonAngle}deg`);

    // 3. Icon badge subtle pulsing glow halo
    const pulseRing = 6 + 4 * Math.sin(t * 0.0015);
    this.style.setProperty("--pulse-ring", `${pulseRing}px`);

    // 4. Soft, gentle ambient glow oscillation behind ribbon stack
    const glowX = Math.sin(t * 0.0005) * 25;
    const glowY = Math.cos(t * 0.0007) * 8;
    ambientGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
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

export default CurvedGradientRibbonLowerThird;
