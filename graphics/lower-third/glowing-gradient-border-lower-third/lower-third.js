/**
 * Glowing Gradient Border Lower Third Module
 * Broadcast news lower-third graphic featuring dual glowing neon gradient border rails,
 * slow & gentle edge glow pulses, subtle background grid scanner, ambient depth glow,
 * and frame-accurate playback.
 */

const DEFAULT_STATE = {
  name: "Dr. Sarah Chen",
  title: "Head of Artificial Intelligence",
  badgeText: "EXCLUSIVE COVERAGE",
  showBadge: true,
  glowColorStart: "#10b981",
  glowColorEnd: "#06b6d4",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
  --glow-start: #10b981;
  --glow-end: #06b6d4;
  --top-beam-x: -20%;
  --bot-beam-x: 120%;
  --left-beam-y: -20%;
  --beam-opacity: 0;
  --scanner-x: -50%;
  --pulse-glow: 18px;
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

/* Gentle Ambient Backdrop Glow Orb */
.backdrop-glow {
  position: absolute;
  inset: -30px;
  border-radius: 24px;
  background: radial-gradient(circle at 20% 50%, var(--glow-start) 0%, var(--glow-end) 40%, transparent 70%);
  filter: blur(45px);
  opacity: 0.35;
  pointer-events: none;
  will-change: transform, opacity;
}

/* Set overflow: visible so badge extending outside top edge is never cut off */
.glowing-card {
  position: relative;
  min-width: clamp(480px, 46vw, 780px);
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 12px;
  padding: 30px 42px 30px 48px;
  box-shadow:
    0 24px 50px -12px rgba(0, 0, 0, 0.65),
    0 8px 20px -6px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: visible;
}

/* Inner Background Layer to contain scanner overflow cleanly */
.card-inner-bg {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  pointer-events: none;
}

/* Subtle Cyber Grid & Diagonal Scanner */
.bg-grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.bg-scanner {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.08) 45%, rgba(6, 182, 212, 0.12) 50%, transparent 55%);
  transform: translate3d(var(--scanner-x), 0, 0);
  pointer-events: none;
}

/* Left Bar & Gentle Beam Pulse */
.left-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  background: linear-gradient(180deg, var(--glow-start), var(--glow-end));
  border-radius: 12px 0 0 12px;
  box-shadow: 0 0 var(--pulse-glow) var(--glow-start);
  transform-origin: center center;
  overflow: hidden;
  will-change: transform;
}

.left-beam {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--left-beam-y);
  height: 50px;
  background: linear-gradient(180deg, transparent, #ffffff, var(--glow-start), transparent);
  box-shadow: 0 0 15px #ffffff, 0 0 25px var(--glow-start);
  opacity: var(--beam-opacity);
}

/* Top & Bottom Rails with Gentle Traveling Light Beams */
.top-rail {
  position: absolute;
  top: 0;
  left: 6px;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--glow-start), var(--glow-end), transparent);
  box-shadow: 0 0 var(--pulse-glow) var(--glow-start);
  transform-origin: left center;
  overflow: hidden;
  will-change: transform;
}

.top-beam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--top-beam-x);
  width: 100px;
  background: linear-gradient(90deg, transparent, #ffffff, var(--glow-start), transparent);
  box-shadow: 0 0 16px #ffffff, 0 0 25px var(--glow-start);
  opacity: var(--beam-opacity);
}

.bottom-rail {
  position: absolute;
  bottom: 0;
  left: 6px;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--glow-start), var(--glow-end), transparent);
  box-shadow: 0 0 var(--pulse-glow) var(--glow-start);
  transform-origin: left center;
  overflow: hidden;
  will-change: transform;
}

.bottom-beam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--bot-beam-x);
  width: 100px;
  background: linear-gradient(90deg, transparent, var(--glow-end), #ffffff, transparent);
  box-shadow: 0 0 16px #ffffff, 0 0 25px var(--glow-end);
  opacity: var(--beam-opacity);
}

.badge {
  position: absolute;
  top: -16px;
  right: 36px;
  z-index: 5;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--glow-start);
  color: var(--glow-start);
  font-size: clamp(12px, 0.9vw, 15px);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 16px;
  border-radius: 6px;
  box-shadow:
    0 0 16px rgba(16, 185, 129, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.3);
  will-change: transform, opacity;
}

.badge[hidden] {
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
  font-size: clamp(38px, 2.7vw, 54px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  will-change: transform, opacity;
}

.title {
  font-size: clamp(20px, 1.5vw, 28px);
  font-weight: 600;
  color: rgba(226, 232, 240, 0.92);
  line-height: 1.25;
  letter-spacing: 0.01em;
  will-change: transform, opacity;
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

class GlowingGradientBorderLowerThird extends HTMLElement {
  constructor() {
    super();
    this._initialData = {};
    this._state = { ...DEFAULT_STATE };
    this._mode = "realtime";
    this._currentStep = undefined;
    this._schedule = [];

    this._durationIn = 1000; // ms
    this._durationOut = 600;  // ms

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

    const backdropGlow = document.createElement("div");
    backdropGlow.className = "backdrop-glow";

    const card = document.createElement("div");
    card.className = "glowing-card";

    const cardInnerBg = document.createElement("div");
    cardInnerBg.className = "card-inner-bg";

    const bgGrid = document.createElement("div");
    bgGrid.className = "bg-grid-pattern";

    const bgScanner = document.createElement("div");
    bgScanner.className = "bg-scanner";

    cardInnerBg.append(bgGrid, bgScanner);

    const leftBar = document.createElement("div");
    leftBar.className = "left-bar";

    const leftBeam = document.createElement("div");
    leftBeam.className = "left-beam";
    leftBar.append(leftBeam);

    const topRail = document.createElement("div");
    topRail.className = "top-rail";

    const topBeam = document.createElement("div");
    topBeam.className = "top-beam";
    topRail.append(topBeam);

    const bottomRail = document.createElement("div");
    bottomRail.className = "bottom-rail";

    const bottomBeam = document.createElement("div");
    bottomBeam.className = "bottom-beam";
    bottomRail.append(bottomBeam);

    const badge = document.createElement("div");
    badge.className = "badge";

    const content = document.createElement("div");
    content.className = "content";

    const nameEl = document.createElement("div");
    nameEl.className = "name";

    const titleEl = document.createElement("div");
    titleEl.className = "title";

    content.append(nameEl, titleEl);
    card.append(cardInnerBg, leftBar, topRail, bottomRail, badge, content);
    scene.append(backdropGlow, card);
    root.append(style, scene);

    this._elements = { scene, card, backdropGlow, cardInnerBg, bgGrid, bgScanner, leftBar, leftBeam, topRail, topBeam, bottomRail, bottomBeam, badge, nameEl, titleEl };
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
        document.fonts.load("800 48px 'Space Grotesk'"),
        document.fonts.load("600 24px 'Space Grotesk'"),
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
    const { name, title, badgeText, showBadge, glowColorStart, glowColorEnd } = this._state;
    const { nameEl, titleEl, badge } = this._elements;

    nameEl.textContent = name || "";
    titleEl.textContent = title || "";
    badge.textContent = badgeText || "";

    const hasBadge = Boolean(showBadge && badgeText);
    badge.hidden = !hasBadge;

    if (glowColorStart) this.style.setProperty("--glow-start", glowColorStart);
    if (glowColorEnd) this.style.setProperty("--glow-end", glowColorEnd);
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
    const { scene, leftBar, topRail, bottomRail, badge, nameEl, titleEl, backdropGlow } = this._elements;

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
    const slideX = -35 * (1 - inEase) + 25 * outEase;

    scene.style.opacity = String(overallOpacity);
    scene.style.transform = `translate3d(${slideX}px, 0, 0)`;

    // Left bar grows vertically from center
    leftBar.style.transform = `scaleY(${inEase})`;

    // Top & bottom rails expand horizontally from left
    const railScale = clamp(inProgress * 1.2, 0, 1);
    const railEase = easeOutCubic(railScale);
    topRail.style.transform = `scaleX(${railEase})`;
    bottomRail.style.transform = `scaleX(${railEase})`;

    // Badge scale and opacity
    const badgeEase = easeOutBack(clamp((inProgress - 0.2) / 0.8, 0, 1));
    badge.style.transform = `scale(${0.78 + 0.22 * badgeEase})`;
    badge.style.opacity = String(clamp((inProgress - 0.2) / 0.5, 0, 1));

    // Text content offsets
    const nameEase = easeOutCubic(clamp((inProgress - 0.1) / 0.9, 0, 1));
    const titleEase = easeOutCubic(clamp((inProgress - 0.2) / 0.8, 0, 1));

    nameEl.style.transform = `translate3d(${-16 * (1 - nameEase)}px, 0, 0)`;
    nameEl.style.opacity = String(nameEase);

    titleEl.style.transform = `translate3d(${-16 * (1 - titleEase)}px, 0, 0)`;
    titleEl.style.opacity = String(titleEase);

    // Continuous time-driven deterministic edge glows & background movements (Gentle & Slow Lifecycle)
    const t = typeof timeMs === "number" ? timeMs : 0;

    // Periodic 9-second beam cycle (Appears, moves slowly for a while, disappears)
    const cycleMs = t % 9000;
    let beamOpacity = 0;
    let travelProgress = 0;

    if (cycleMs < 1500) {
      beamOpacity = 0;
      travelProgress = 0;
    } else if (cycleMs < 2700) {
      beamOpacity = easeOutCubic((cycleMs - 1500) / 1200);
      travelProgress = (cycleMs - 1500) / 6000;
    } else if (cycleMs < 7500) {
      beamOpacity = 1;
      travelProgress = (cycleMs - 1500) / 6000;
    } else if (cycleMs < 8700) {
      beamOpacity = 1 - easeInCubic((cycleMs - 7500) / 1200);
      travelProgress = (cycleMs - 1500) / 6000;
    } else {
      beamOpacity = 0;
      travelProgress = 1;
    }

    this.style.setProperty("--beam-opacity", String(beamOpacity));

    const topBeamX = -20 + travelProgress * 135;
    this.style.setProperty("--top-beam-x", `${topBeamX}%`);

    const botBeamX = 115 - travelProgress * 135;
    this.style.setProperty("--bot-beam-x", `${botBeamX}%`);

    const leftBeamY = -15 + travelProgress * 130;
    this.style.setProperty("--left-beam-y", `${leftBeamY}%`);

    const scannerX = (t * 0.02) % 220 - 60;
    this.style.setProperty("--scanner-x", `${scannerX}%`);

    const glowBlur = 14 + 5 * Math.sin(t * 0.001);
    this.style.setProperty("--pulse-glow", `${glowBlur}px`);

    const backdropX = Math.sin(t * 0.0006) * 20;
    const backdropScale = 1 + 0.06 * Math.cos(t * 0.0008);
    backdropGlow.style.transform = `translate3d(${backdropX}px, 0, 0) scale(${backdropScale})`;
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

export default GlowingGradientBorderLowerThird;
