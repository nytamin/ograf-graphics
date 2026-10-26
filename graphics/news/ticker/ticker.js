/**
 * News Package - Lower Ticker (graphics/news/ticker)
 * Broadcast news ticker with 15-degree skewed gradient boxes,
 * 2px skeuomorphic beveled borders, SVG mask + SMIL swipe animations,
 * and right-to-left scrolling with seamless off-screen text updates.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_15 = Math.tan((SKEW_DEG * Math.PI) / 180);
const COS_15 = Math.cos((SKEW_DEG * Math.PI) / 180);

// Geometry in 1920x1080 SVG coordinate space
const H_BAR = 54;
const DX_BAR = H_BAR * TAN_15; // ~14.47
const W_ACCENT = 18;
const GAP_X = 5;
const TOTAL_BAR_W = 1728;
const PAD_LABEL_X = 24;
const MIN_LABEL_W = 160;
const SEG_GAP = 72;

const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  label: "LATEST NEWS",
  text: "GLOBAL MARKETS RALLY AFTER CENTRAL BANK RATE DECISION • PARLIAMENTARY VOTE SCHEDULED FOR 20:00 CET • SEVERE WEATHER ADVISORY ISSUED FOR COASTAL DISTRICTS",
  infiniteScroll: true,
  speed: 160,
  primaryColor: "#0f2b5b",
  secondaryColor: "#162032",
  accentColor: "#d32f2f",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Impact", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
}

.scene.visible {
  opacity: 1;
  visibility: visible;
}

svg.canvas {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.label-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 28px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 2px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.75));
}

.ticker-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 27px;
  font-weight: 700;
  fill: #f4f8ff;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.7));
}

.ticker-sep {
  fill: var(--sep-color, #ef5350);
  font-weight: 900;
}
`;

function adjustHexColor(hex, percent) {
  const cleaned = String(hex || "#0f2b5b").replace(/^#/, "");
  const num = parseInt(
    cleaned.length === 3
      ? cleaned.split("").map((c) => c + c).join("")
      : cleaned,
    16
  );
  if (Number.isNaN(num)) return "#0f2b5b";

  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  if (percent > 0) {
    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));
  } else {
    const factor = 1 + percent / 100;
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
  }

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function computeSkewedBox(x, y, w, h) {
  const safeW = Math.max(0, w);
  const dx = h * TAN_15;

  const tl = [x + dx, y];
  const tr = [x + dx + safeW, y];
  const br = [x + safeW, y + h];
  const bl = [x, y + h];

  const points = `${tl[0].toFixed(2)},${tl[1].toFixed(2)} ${tr[0].toFixed(2)},${tr[1].toFixed(2)} ${br[0].toFixed(2)},${br[1].toFixed(2)} ${bl[0].toFixed(2)},${bl[1].toFixed(2)}`;

  const sheenH = h * 0.46;
  const sheenDx = (h - sheenH) * TAN_15;
  const stl = tl;
  const str = tr;
  const sbr = [x + sheenDx + safeW, y + sheenH];
  const sbl = [x + sheenDx, y + sheenH];
  const sheenPoints = `${stl[0].toFixed(2)},${stl[1].toFixed(2)} ${str[0].toFixed(2)},${str[1].toFixed(2)} ${sbr[0].toFixed(2)},${sbr[1].toFixed(2)} ${sbl[0].toFixed(2)},${sbl[1].toFixed(2)}`;

  const insetPerp = 1 / COS_15;
  const insetSlope = TAN_15;

  const itl = [tl[0] - insetSlope + insetPerp, y + 1];
  const itr = [tr[0] - insetSlope - insetPerp, y + 1];
  const ibr = [br[0] + insetSlope - insetPerp, y + h - 1];
  const ibl = [bl[0] + insetSlope + insetPerp, y + h - 1];

  const lightBevel = `${ibl[0].toFixed(2)},${ibl[1].toFixed(2)} ${itl[0].toFixed(2)},${itl[1].toFixed(2)} ${itr[0].toFixed(2)},${itr[1].toFixed(2)}`;
  const shadowBevel = `${itr[0].toFixed(2)},${itr[1].toFixed(2)} ${ibr[0].toFixed(2)},${ibr[1].toFixed(2)} ${ibl[0].toFixed(2)},${ibl[1].toFixed(2)}`;
  const insetPoints = `${itl[0].toFixed(2)},${itl[1].toFixed(2)} ${itr[0].toFixed(2)},${itr[1].toFixed(2)} ${ibr[0].toFixed(2)},${ibr[1].toFixed(2)} ${ibl[0].toFixed(2)},${ibl[1].toFixed(2)}`;

  return { points, sheenPoints, lightBevel, shadowBevel, insetPoints };
}

class NewsTickerGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._rafId = null;
    this._lastTickTime = 0;

    // Scrolling text state
    this._segments = [];
    this._activeLoopText = DEFAULT_STATE.text;
    this._pendingQueue = [];

    this._layout = {
      labelX: W_ACCENT + GAP_X,
      labelW: MIN_LABEL_W,
      hasLabel: true,
      trackX: W_ACCENT + GAP_X + MIN_LABEL_W + GAP_X,
      trackW: 1400,
      viewportLeft: 220,
      viewportRight: 1720,
    };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const svg = this._buildSvg();
    scene.appendChild(svg);
    root.append(style, scene);

    this._scene = scene;
    this._svg = svg;
  }

  connectedCallback() {}

  _buildSvg() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "canvas");
    svg.setAttribute("viewBox", "0 0 1920 1080");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    svg.innerHTML = `
      <defs>
        <filter id="box-drop-shadow" x="-5%" y="-25%" width="110%" height="165%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.55" />
        </filter>

        <linearGradient id="label-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="label-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="label-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="label-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="track-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="track-stop-1" offset="52%" stop-color="#162032" />
          <stop id="track-stop-2" offset="100%" stop-color="#0c121d" />
        </linearGradient>

        <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="accent-stop-0" offset="0%" stop-color="#ef5350" />
          <stop id="accent-stop-1" offset="50%" stop-color="#d32f2f" />
          <stop id="accent-stop-2" offset="100%" stop-color="#9a1b1b" />
        </linearGradient>

        <linearGradient id="accent-pulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="accent-pulse-stop-0" offset="0%" stop-color="#ff8a80" />
          <stop id="accent-pulse-stop-1" offset="50%" stop-color="#ff5252" />
          <stop id="accent-pulse-stop-2" offset="100%" stop-color="#e53935" />
        </linearGradient>

        <filter id="accent-idle-glow" x="-60%" y="-40%" width="220%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
        </filter>

        <filter id="border-idle-glow" x="-10%" y="-35%" width="120%" height="170%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-350" y1="0" x2="100" y2="90">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.46" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animate id="anim-border-shimmer-x1" attributeName="x1" begin="indefinite" dur="4.2s" repeatCount="indefinite"
            values="-350; 1780; -350" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate id="anim-border-shimmer-x2" attributeName="x2" begin="indefinite" dur="4.2s" repeatCount="indefinite"
            values="100; 2230; 100" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </linearGradient>

        <linearGradient id="plate-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
        </linearGradient>

        <linearGradient id="bevel-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.68">
            <animate id="anim-bevel-stop-0" attributeName="stop-opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
              values="0.65;0.84;0.65" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.42">
            <animate id="anim-bevel-stop-1" attributeName="stop-opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
              values="0.40;0.56;0.40" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </stop>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.22" />
        </linearGradient>

        <linearGradient id="bevel-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.78" />
        </linearGradient>

        <!-- Skewed interior clipPath for scrolling ticker text -->
        <clipPath id="ticker-viewport-clip">
          <polygon id="ticker-clip-poly" points="0,0 0,0 0,0 0,0" />
        </clipPath>

        <!-- Main Reveal Mask driven by native SMIL <animate> -->
        <mask id="ticker-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-50" width="2200" height="250">
          <polygon id="ticker-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="anim-ticker-mask" attributeName="points" begin="indefinite" dur="0.64s" fill="freeze" />
          </polygon>
        </mask>
      </defs>

      <!-- Hidden measurement text element -->
      <g opacity="0" pointer-events="none">
        <text id="measure-text" class="ticker-text" x="-9999" y="-9999"></text>
      </g>

      <g id="graphic-root" transform="translate(88, 978)">
        <!-- MASKED CONTENT (Label Box + Ticker Track Box) -->
        <g id="ticker-masked-group" mask="url(#ticker-reveal-mask)" filter="url(#box-drop-shadow)">
          <!-- Ticker Track Box -->
          <g id="track-layer">
            <polygon id="track-bg" fill="url(#track-grad)" />
            <polygon id="track-sheen" fill="url(#plate-sheen)" />

            <!-- Clipped Scrolling Text Viewport -->
            <g clip-path="url(#ticker-viewport-clip)">
              <g id="ticker-scroll-container"></g>
            </g>

            <polyline id="track-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter" />
            <polyline id="track-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter" />
            <polygon id="track-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-track-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.16;0.40;0.16" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>

          <!-- Category Label Box -->
          <g id="label-layer">
            <polygon id="label-bg" fill="url(#label-grad)" />
            <polygon id="label-sheen" fill="url(#plate-sheen)" />
            <text id="label-text" class="label-text" x="0" y="0"></text>
            <polyline id="label-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter" />
            <polyline id="label-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter" />
            <polygon id="label-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-label-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.18;0.44;0.18" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>
        </g>

        <!-- Secondary Out-Animation Accent Wiper -->
        <g id="wiper-group" opacity="0" filter="url(#box-drop-shadow)">
          <animate id="anim-wiper-opacity" attributeName="opacity" begin="indefinite" dur="0.56s" fill="freeze" />
          <polygon id="wiper-bg" fill="url(#accent-grad)">
            <animate id="anim-wiper-bg" attributeName="points" begin="indefinite" dur="0.56s" fill="freeze" />
          </polygon>
          <polygon id="wiper-sheen" fill="url(#plate-sheen)">
            <animate id="anim-wiper-sheen" attributeName="points" begin="indefinite" dur="0.56s" fill="freeze" />
          </polygon>
          <polyline id="wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-wiper-shadow" attributeName="points" begin="indefinite" dur="0.56s" fill="freeze" />
          </polyline>
          <polyline id="wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-wiper-light" attributeName="points" begin="indefinite" dur="0.56s" fill="freeze" />
          </polyline>
        </g>

        <!-- Primary Left Accent Box (Swipes right-to-left on In, settles on left, pulses while idle) -->
        <g id="accent-layer" opacity="0" filter="url(#box-drop-shadow)">
          <animate id="anim-accent-opacity" attributeName="opacity" begin="indefinite" dur="0.64s" fill="freeze" />
          <polygon id="accent-glow-poly" fill="url(#accent-pulse-grad)" filter="url(#accent-idle-glow)" opacity="0">
            <animate id="anim-accent-glow-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.75;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-bg" fill="url(#accent-grad)">
            <animate id="anim-accent-bg" attributeName="points" begin="indefinite" dur="0.64s" fill="freeze" />
          </polygon>
          <polygon id="accent-pulse-overlay" fill="url(#accent-pulse-grad)" opacity="0">
            <animate id="anim-accent-overlay-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.55;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-sheen" fill="url(#plate-sheen)">
            <animate id="anim-accent-sheen" attributeName="points" begin="indefinite" dur="0.64s" fill="freeze" />
          </polygon>
          <polyline id="accent-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-shadow" attributeName="points" begin="indefinite" dur="0.64s" fill="freeze" />
          </polyline>
          <polyline id="accent-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-light" attributeName="points" begin="indefinite" dur="0.64s" fill="freeze" />
          </polyline>
        </g>
      </g>
    `;

    const q = (sel) => svg.querySelector(sel);
    this._els = {
      rootGroup: q("#graphic-root"),
      labelStop0: q("#label-stop-0"),
      labelStop1: q("#label-stop-1"),
      labelStop2: q("#label-stop-2"),
      trackStop0: q("#track-stop-0"),
      trackStop1: q("#track-stop-1"),
      trackStop2: q("#track-stop-2"),
      accentStop0: q("#accent-stop-0"),
      accentStop1: q("#accent-stop-1"),
      accentStop2: q("#accent-stop-2"),
      accentPulseStop0: q("#accent-pulse-stop-0"),
      accentPulseStop1: q("#accent-pulse-stop-1"),
      accentPulseStop2: q("#accent-pulse-stop-2"),
      borderGlowTint: q("#border-glow-tint"),
      animBorderShimmerX1: q("#anim-border-shimmer-x1"),
      animBorderShimmerX2: q("#anim-border-shimmer-x2"),
      animBevelStop0: q("#anim-bevel-stop-0"),
      animBevelStop1: q("#anim-bevel-stop-1"),

      tickerClipPoly: q("#ticker-clip-poly"),
      tickerMaskPoly: q("#ticker-mask-poly"),
      animTickerMask: q("#anim-ticker-mask"),
      measureText: q("#measure-text"),
      scrollContainer: q("#ticker-scroll-container"),

      trackBg: q("#track-bg"),
      trackSheen: q("#track-sheen"),
      trackBevelLight: q("#track-bevel-light"),
      trackBevelShadow: q("#track-bevel-shadow"),
      trackBorderGlow: q("#track-border-glow"),
      animTrackBorderGlowPulse: q("#anim-track-border-glow-pulse"),

      labelLayer: q("#label-layer"),
      labelBg: q("#label-bg"),
      labelSheen: q("#label-sheen"),
      labelText: q("#label-text"),
      labelBevelLight: q("#label-bevel-light"),
      labelBevelShadow: q("#label-bevel-shadow"),
      labelBorderGlow: q("#label-border-glow"),
      animLabelBorderGlowPulse: q("#anim-label-border-glow-pulse"),

      wiperGroup: q("#wiper-group"),
      animWiperOpacity: q("#anim-wiper-opacity"),
      wiperBg: q("#wiper-bg"),
      animWiperBg: q("#anim-wiper-bg"),
      wiperSheen: q("#wiper-sheen"),
      animWiperSheen: q("#anim-wiper-sheen"),
      wiperLight: q("#wiper-light"),
      animWiperLight: q("#anim-wiper-light"),
      wiperShadow: q("#wiper-shadow"),
      animWiperShadow: q("#anim-wiper-shadow"),

      accentLayer: q("#accent-layer"),
      animAccentOpacity: q("#anim-accent-opacity"),
      accentGlowPoly: q("#accent-glow-poly"),
      animAccentGlowPulse: q("#anim-accent-glow-pulse"),
      accentBg: q("#accent-bg"),
      animAccentBg: q("#anim-accent-bg"),
      accentPulseOverlay: q("#accent-pulse-overlay"),
      animAccentOverlayPulse: q("#anim-accent-overlay-pulse"),
      accentSheen: q("#accent-sheen"),
      animAccentSheen: q("#anim-accent-sheen"),
      accentBevelLight: q("#accent-bevel-light"),
      animAccentBevelLight: q("#anim-accent-bevel-light"),
      accentBevelShadow: q("#accent-bevel-shadow"),
      animAccentBevelShadow: q("#anim-accent-bevel-shadow"),
    };

    return svg;
  }

  _clearTimers() {
    for (const t of this._timers) {
      clearTimeout(t);
    }
    this._timers = [];
  }

  _schedule(fn, delayMs) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this._timers = this._timers.filter((item) => item !== id);
        fn();
        resolve();
      }, delayMs);
      this._timers.push(id);
    });
  }

  _triggerSmil(targetEl, animEl, attrName, valuesArray, durationSec, keyTimesStr, keySplinesStr) {
    if (!animEl || !targetEl) return;
    const firstVal = valuesArray[0];
    const lastVal = valuesArray[valuesArray.length - 1];
    targetEl.setAttribute(attrName, firstVal);

    animEl.setAttribute("values", valuesArray.join("; "));
    animEl.setAttribute("dur", `${durationSec}s`);
    if (keyTimesStr) {
      animEl.setAttribute("keyTimes", keyTimesStr);
    } else {
      animEl.removeAttribute("keyTimes");
    }
    if (keySplinesStr) {
      animEl.setAttribute("calcMode", "spline");
      animEl.setAttribute("keySplines", keySplinesStr);
    } else {
      animEl.setAttribute("calcMode", "linear");
      animEl.removeAttribute("keySplines");
    }
    animEl.setAttribute("fill", "freeze");

    try {
      animEl.beginElement();
    } catch (_) {
      targetEl.setAttribute(attrName, lastVal);
    }
  }

  _animateSkewedBox(els, keyframes, durSec, keyTimesStr, splineStr) {
    this._triggerSmil(els.bg, els.animBg, "points", keyframes.map((k) => k.points), durSec, keyTimesStr, splineStr);
    if (els.sheen && els.animSheen) {
      this._triggerSmil(els.sheen, els.animSheen, "points", keyframes.map((k) => k.sheenPoints), durSec, keyTimesStr, splineStr);
    }
    this._triggerSmil(els.light, els.animLight, "points", keyframes.map((k) => k.lightBevel), durSec, keyTimesStr, splineStr);
    this._triggerSmil(els.shadow, els.animShadow, "points", keyframes.map((k) => k.shadowBevel), durSec, keyTimesStr, splineStr);
  }

  _setStaticSvgAttr(targetEl, animEl, attrName, value) {
    if (!targetEl) return;
    targetEl.setAttribute(attrName, value);
    if (animEl) {
      animEl.removeAttribute("keyTimes");
      animEl.removeAttribute("keySplines");
      animEl.setAttribute("calcMode", "linear");
      animEl.setAttribute("dur", "0.001s");
      animEl.setAttribute("values", `${value}; ${value}`);
      animEl.setAttribute("fill", "freeze");
      try {
        animEl.beginElement();
      } catch (_) {}
    }
  }

  _setStaticSkewedBox(els, boxGeom) {
    this._setStaticSvgAttr(els.bg, els.animBg, "points", boxGeom.points);
    if (els.sheen && els.animSheen) {
      this._setStaticSvgAttr(els.sheen, els.animSheen, "points", boxGeom.sheenPoints);
    }
    this._setStaticSvgAttr(els.light, els.animLight, "points", boxGeom.lightBevel);
    this._setStaticSvgAttr(els.shadow, els.animShadow, "points", boxGeom.shadowBevel);
  }

  _updateGradients() {
    const { primaryColor, secondaryColor, accentColor } = this._state;
    const {
      labelStop0, labelStop1, labelStop2,
      trackStop0, trackStop1, trackStop2,
      accentStop0, accentStop1, accentStop2,
      accentPulseStop0, accentPulseStop1, accentPulseStop2,
      borderGlowTint,
    } = this._els;

    labelStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    labelStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    labelStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -30));

    trackStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    trackStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    trackStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -32));

    accentStop0.setAttribute("stop-color", adjustHexColor(accentColor, 22));
    accentStop1.setAttribute("stop-color", adjustHexColor(accentColor, 0));
    accentStop2.setAttribute("stop-color", adjustHexColor(accentColor, -28));

    accentPulseStop0.setAttribute("stop-color", adjustHexColor(accentColor, 58));
    accentPulseStop1.setAttribute("stop-color", adjustHexColor(accentColor, 36));
    accentPulseStop2.setAttribute("stop-color", adjustHexColor(accentColor, 15));

    if (borderGlowTint) {
      borderGlowTint.setAttribute("stop-color", adjustHexColor(primaryColor, 68));
    }
    this.style.setProperty("--sep-color", adjustHexColor(accentColor, 28));
  }

  _startIdlePulse() {
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_BAR);
    this._els.accentGlowPoly.setAttribute("points", parkedAccentBox.points);
    this._els.accentPulseOverlay.setAttribute("points", parkedAccentBox.points);
    try {
      this._els.animAccentGlowPulse.beginElement();
      this._els.animAccentOverlayPulse.beginElement();
      this._els.animBorderShimmerX1.beginElement();
      this._els.animBorderShimmerX2.beginElement();
      this._els.animBevelStop0.beginElement();
      this._els.animBevelStop1.beginElement();
      this._els.animTrackBorderGlowPulse.beginElement();
      this._els.animLabelBorderGlowPulse.beginElement();
    } catch (_) {}
  }

  _stopIdlePulse() {
    try {
      this._els.animAccentGlowPulse.endElement();
      this._els.animAccentOverlayPulse.endElement();
      this._els.animBorderShimmerX1.endElement();
      this._els.animBorderShimmerX2.endElement();
      this._els.animBevelStop0.endElement();
      this._els.animBevelStop1.endElement();
      this._els.animTrackBorderGlowPulse.endElement();
      this._els.animLabelBorderGlowPulse.endElement();
    } catch (_) {}
    this._els.accentGlowPoly.setAttribute("opacity", "0");
    this._els.accentPulseOverlay.setAttribute("opacity", "0");
    this._els.trackBorderGlow.setAttribute("opacity", "0");
    this._els.labelBorderGlow.setAttribute("opacity", "0");
  }

  _measureTextWidth(textElement, fallbackCharWidth) {
    try {
      const len = textElement.getComputedTextLength();
      if (len && len > 0) return len;
    } catch (_) {}
    try {
      const bbox = textElement.getBBox();
      if (bbox && bbox.width > 0) return bbox.width;
    } catch (_) {}
    return (textElement.textContent || "").length * fallbackCharWidth;
  }

  _measureTickerStringWidth(str) {
    this._els.measureText.textContent = str;
    return this._measureTextWidth(this._els.measureText, 14.5);
  }

  _computeAndApplyStaticGeometry() {
    const labelStr = (this._state.label || "").trim();
    const hasLabel = labelStr.length > 0;

    this._els.labelText.textContent = labelStr;
    this._els.labelLayer.style.display = hasLabel ? "" : "none";

    const rawLabelW = hasLabel ? this._measureTextWidth(this._els.labelText, 15) : 0;
    const labelX = W_ACCENT + GAP_X;
    const labelW = hasLabel ? Math.max(MIN_LABEL_W, Math.ceil(rawLabelW + PAD_LABEL_X * 2)) : 0;

    const trackX = hasLabel ? labelX + labelW + GAP_X : W_ACCENT + GAP_X;
    const trackW = Math.max(600, TOTAL_BAR_W - trackX);

    const viewportLeft = trackX + 4;
    const viewportRight = trackX + DX_BAR + trackW - 4;

    this._layout = { labelX, labelW, hasLabel, trackX, trackW, viewportLeft, viewportRight };

    if (hasLabel) {
      const labelBox = computeSkewedBox(labelX, 0, labelW, H_BAR);
      this._els.labelBg.setAttribute("points", labelBox.points);
      this._els.labelSheen.setAttribute("points", labelBox.sheenPoints);
      this._els.labelBevelLight.setAttribute("points", labelBox.lightBevel);
      this._els.labelBevelShadow.setAttribute("points", labelBox.shadowBevel);
      this._els.labelBorderGlow.setAttribute("points", labelBox.insetPoints);

      const labelTextX = labelX + DX_BAR * 0.5 + (labelW - rawLabelW) * 0.5;
      const labelTextY = H_BAR * 0.5;
      this._els.labelText.setAttribute("x", labelTextX.toFixed(2));
      this._els.labelText.setAttribute("y", labelTextY.toFixed(2));
    }

    const trackBox = computeSkewedBox(trackX, 0, trackW, H_BAR);
    this._els.trackBg.setAttribute("points", trackBox.points);
    this._els.trackSheen.setAttribute("points", trackBox.sheenPoints);
    this._els.trackBevelLight.setAttribute("points", trackBox.lightBevel);
    this._els.trackBevelShadow.setAttribute("points", trackBox.shadowBevel);
    this._els.trackBorderGlow.setAttribute("points", trackBox.insetPoints);

    // Clip scrolling text strictly inside the 2px border of the skewed track box
    const clipBox = computeSkewedBox(trackX + 3, 2, trackW - 6, H_BAR - 4);
    this._els.tickerClipPoly.setAttribute("points", clipBox.points);
  }

  // ==========================================================================
  // Scrolling Ticker & Off-Screen Update Queue Engine
  // ==========================================================================

  _clearSegments() {
    this._segments = [];
    this._els.scrollContainer.innerHTML = "";
  }

  _createSegmentElement(rawText) {
    const clean = String(rawText || "").trim();
    const g = document.createElementNS(SVG_NS, "g");
    const textEl = document.createElementNS(SVG_NS, "text");
    textEl.setAttribute("class", "ticker-text");
    textEl.setAttribute("x", "0");
    textEl.setAttribute("y", (H_BAR * 0.5).toFixed(2));
    textEl.textContent = clean;

    g.appendChild(textEl);
    this._els.scrollContainer.appendChild(g);

    const width = Math.max(80, this._measureTextWidth(textEl, 14.5));
    return { g, textEl, textContent: clean, width };
  }

  _spawnSegment(rawText, xPos) {
    const { g, textEl, textContent, width } = this._createSegmentElement(rawText);
    g.setAttribute("transform", `translate(${xPos.toFixed(2)}, 0)`);
    const seg = { g, textEl, textContent, x: xPos, width };
    this._segments.push(seg);
    return seg;
  }

  _startScrollLoop() {
    this._stopScrollLoop();
    this._clearSegments();
    this._activeLoopText = (this._state.text || "").trim();
    this._pendingQueue = [];

    if (!this._activeLoopText) return;

    const { viewportRight } = this._layout;
    // Start first segment right at the right edge of the track so it scrolls in immediately
    this._spawnSegment(this._activeLoopText, viewportRight);

    this._lastTickTime = performance.now();
    const tick = (now) => {
      if (!this._isVisible) return;
      const dt = Math.min(0.1, Math.max(0, (now - this._lastTickTime) / 1000));
      this._lastTickTime = now;
      this._stepScroll(dt);
      if (this._isVisible) {
        this._rafId = requestAnimationFrame(tick);
      }
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _stopScrollLoop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _stepScroll(dt) {
    const speed = Math.max(20, Number(this._state.speed) || 160);
    const dx = speed * dt;
    const { viewportLeft, viewportRight } = this._layout;

    // 1. Advance all active segments from right to left
    for (const seg of this._segments) {
      seg.x -= dx;
      seg.g.setAttribute("transform", `translate(${seg.x.toFixed(2)}, 0)`);
    }

    // 2. Remove segments that have completely scrolled out of view on the left
    while (this._segments.length > 0 && this._segments[0].x + this._segments[0].width < viewportLeft - 16) {
      const removed = this._segments.shift();
      removed.g.remove();
    }

    // 3. Spawn next segment off-screen on the right if needed
    const lastSeg = this._segments[this._segments.length - 1];
    const shouldSpawnMore = Boolean(this._state.infiniteScroll) || this._pendingQueue.length > 0;

    if (shouldSpawnMore) {
      const tailX = lastSeg ? lastSeg.x + lastSeg.width + SEG_GAP : viewportRight;
      if (tailX <= viewportRight + 40) {
        const nextText = this._pendingQueue.length > 0
          ? this._pendingQueue.shift()
          : this._activeLoopText;
        if (nextText) {
          this._activeLoopText = nextText;
          const spawnX = Math.max(viewportRight, tailX);
          this._spawnSegment(nextText, spawnX);
        }
      }
    } else if (this._segments.length === 0) {
      // End-of-text reached when infiniteScroll is false: animate out automatically!
      this._stopScrollLoop();
      this._animateOut(false).then(() => {
        this._currentStep = undefined;
      });
    }
  }

  /**
   * Handles live text updates:
   * - If a segment is currently out of view on the right (seg.x >= viewportRight), update it in place.
   * - If all segments are currently in view (seg.x < viewportRight), do NOT touch in-view text;
   *   queue the new text to append seamlessly right after the current segment off-screen.
   */
  _handleTickerTextUpdate(newRawText) {
    const newText = String(newRawText || "").trim();
    if (!newText) return;

    const { viewportRight } = this._layout;
    this._activeLoopText = newText;

    if (!this._isVisible || this._segments.length === 0) {
      return;
    }

    // Check if there is an already-spawned segment completely out of view on the right
    const firstOffscreenIdx = this._segments.findIndex((seg) => seg.x >= viewportRight);
    if (firstOffscreenIdx !== -1) {
      const targetSeg = this._segments[firstOffscreenIdx];
      targetSeg.textContent = newText;
      targetSeg.textEl.textContent = newText;
      targetSeg.width = Math.max(80, this._measureTextWidth(targetSeg.textEl, 14.5));

      // Remove any trailing offscreen segments after it so the loop stays clean
      for (let i = this._segments.length - 1; i > firstOffscreenIdx; i--) {
        this._segments[i].g.remove();
        this._segments.pop();
      }
      this._pendingQueue = [];
    } else {
      // All segments are currently visible in-view: queue the new text to append after current
      this._pendingQueue = [newText];
    }
  }

  // ==========================================================================
  // SVG Mask & SMIL Swipe Animations
  // ==========================================================================

  _setMasksHidden() {
    this._stopIdlePulse();
    const zeroMask = computeSkewedBox(TOTAL_BAR_W, -4, 0, H_BAR + 8).points;
    const startAccentBox = computeSkewedBox(TOTAL_BAR_W, 0, W_ACCENT, H_BAR);

    this._setStaticSvgAttr(this._els.tickerMaskPoly, this._els.animTickerMask, "points", zeroMask);
    this._setStaticSvgAttr(this._els.accentLayer, this._els.animAccentOpacity, "opacity", "0");
    this._setStaticSkewedBox(
      {
        bg: this._els.accentBg,
        animBg: this._els.animAccentBg,
        sheen: this._els.accentSheen,
        animSheen: this._els.animAccentSheen,
        light: this._els.accentBevelLight,
        animLight: this._els.animAccentBevelLight,
        shadow: this._els.accentBevelShadow,
        animShadow: this._els.animAccentBevelShadow,
      },
      startAccentBox
    );
    this._setStaticSvgAttr(this._els.wiperGroup, this._els.animWiperOpacity, "opacity", "0");
  }

  _setMasksFullyRevealed() {
    const fullMask = computeSkewedBox(W_ACCENT, -4, TOTAL_BAR_W - W_ACCENT + 8, H_BAR + 8).points;
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_BAR);

    this._setStaticSvgAttr(this._els.tickerMaskPoly, this._els.animTickerMask, "points", fullMask);
    this._setStaticSvgAttr(this._els.accentLayer, this._els.animAccentOpacity, "opacity", "1");
    this._setStaticSkewedBox(
      {
        bg: this._els.accentBg,
        animBg: this._els.animAccentBg,
        sheen: this._els.accentSheen,
        animSheen: this._els.animAccentSheen,
        light: this._els.accentBevelLight,
        animLight: this._els.animAccentBevelLight,
        shadow: this._els.accentBevelShadow,
        animShadow: this._els.animAccentBevelShadow,
      },
      parkedAccentBox
    );
    this._setStaticSvgAttr(this._els.wiperGroup, this._els.animWiperOpacity, "opacity", "0");
    this._startIdlePulse();
  }

  async _animateIn(skipAnimation) {
    this._clearTimers();
    this._updateGradients();
    this._scene.classList.add("visible");
    this._computeAndApplyStaticGeometry();

    if (skipAnimation) {
      this._setMasksFullyRevealed();
      this._isVisible = true;
      this._startScrollLoop();
      return;
    }

    if (this._isVisible) return;
    this._isVisible = true;

    this._setMasksHidden();
    this._startScrollLoop();

    const dur = 0.64;
    const aStart = computeSkewedBox(TOTAL_BAR_W, 0, W_ACCENT, H_BAR);
    const aEnd = computeSkewedBox(0, 0, W_ACCENT, H_BAR);

    const maskRightEdge = TOTAL_BAR_W + W_ACCENT * 0.5;
    const mStartLeft = TOTAL_BAR_W + W_ACCENT * 0.5;
    const mEndLeft = W_ACCENT * 0.5;
    const mStart = computeSkewedBox(mStartLeft, -4, 0, H_BAR + 8).points;
    const mEnd = computeSkewedBox(mEndLeft, -4, maskRightEdge - mEndLeft, H_BAR + 8).points;

    this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["0", "1", "1"], dur, "0;0.05;1");
    this._animateSkewedBox(
      {
        bg: this._els.accentBg,
        animBg: this._els.animAccentBg,
        sheen: this._els.accentSheen,
        animSheen: this._els.animAccentSheen,
        light: this._els.accentBevelLight,
        animLight: this._els.animAccentBevelLight,
        shadow: this._els.accentBevelShadow,
        animShadow: this._els.animAccentBevelShadow,
      },
      [aStart, aEnd],
      dur,
      "0;1",
      EASE_OUT_SPLINE
    );
    this._triggerSmil(this._els.tickerMaskPoly, this._els.animTickerMask, "points", [mStart, mEnd], dur, "0;1", EASE_OUT_SPLINE);

    await this._schedule(() => {
      this._setMasksFullyRevealed();
    }, 650);
  }

  async _animateOut(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation || !this._isVisible) {
      this._isVisible = false;
      this._stopScrollLoop();
      this._clearSegments();
      this._setMasksHidden();
      this._scene.classList.remove("visible");
      return;
    }

    this._isVisible = false;
    const dur = 0.56;

    const wStart = computeSkewedBox(TOTAL_BAR_W, 0, W_ACCENT, H_BAR);
    const wEnd = computeSkewedBox(0, 0, W_ACCENT, H_BAR);

    const maskLeft = W_ACCENT * 0.5;
    const mStartRight = TOTAL_BAR_W + W_ACCENT * 0.5;
    const mEndRight = W_ACCENT * 0.5;
    const mStart = computeSkewedBox(maskLeft, -4, mStartRight - maskLeft, H_BAR + 8).points;
    const mEnd = computeSkewedBox(maskLeft, -4, mEndRight - maskLeft, H_BAR + 8).points;

    this._triggerSmil(this._els.tickerMaskPoly, this._els.animTickerMask, "points", [mStart, mEnd], dur, "0;1", EASE_OUT_SPLINE);
    this._triggerSmil(this._els.wiperGroup, this._els.animWiperOpacity, "opacity", ["0", "1", "1", "0"], dur, "0;0.05;0.90;1");
    this._animateSkewedBox(
      {
        bg: this._els.wiperBg,
        animBg: this._els.animWiperBg,
        sheen: this._els.wiperSheen,
        animSheen: this._els.animWiperSheen,
        light: this._els.wiperLight,
        animLight: this._els.animWiperLight,
        shadow: this._els.wiperShadow,
        animShadow: this._els.animWiperShadow,
      },
      [wStart, wEnd],
      dur,
      "0;1",
      EASE_OUT_SPLINE
    );

    this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["1", "1", "0"], dur, "0;0.86;1");

    await this._schedule(() => {
      this._stopScrollLoop();
      this._clearSegments();
      this._setMasksHidden();
      this._scene.classList.remove("visible");
    }, 580);
  }

  // ==========================================================================
  // OGraf Lifecycle Methods
  // ==========================================================================

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params?.data || {}) };
    this._activeLoopText = (this._state.text || "").trim();
    this._updateGradients();

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {}
    }

    this._computeAndApplyStaticGeometry();
    this._setMasksHidden();
    this._scene.classList.remove("visible");
    return { statusCode: 200 };
  }

  async dispose() {
    this._clearTimers();
    this._stopScrollLoop();
    this._clearSegments();
    this._isVisible = false;
    this._currentStep = undefined;
    if (this._scene) {
      this._scene.remove();
    }
    return { statusCode: 200 };
  }

  async playAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateIn(skipAnimation);
    this._currentStep = 1;
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    await this._animateOut(skipAnimation);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const incomingData = params?.data || {};
    const prevLabel = this._state.label;
    const prevText = this._state.text;

    this._state = { ...this._state, ...incomingData };
    this._updateGradients();

    if (incomingData.label !== undefined && incomingData.label !== prevLabel) {
      this._computeAndApplyStaticGeometry();
    }

    if (incomingData.text !== undefined && incomingData.text !== prevText) {
      this._handleTickerTextUpdate(incomingData.text);
    }

    return { statusCode: 200 };
  }

  async customAction(_params) {
    return { statusCode: 200 };
  }

  async goToTime(_params) {
    return { statusCode: 200 };
  }

  async setActionsSchedule(_params) {
    return { statusCode: 200 };
  }
}

export default NewsTickerGraphic;
