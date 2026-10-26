/**
 * News Package - Theme Lower Third (graphics/news/theme)
 * Broadcast lower-third with 15-degree skewed gradient boxes,
 * 2px skeuomorphic beveled borders, and native SVG mask + SMIL swipe animations.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_25 = Math.tan((SKEW_DEG * Math.PI) / 180); // ~0.267949192
const COS_25 = Math.cos((SKEW_DEG * Math.PI) / 180); // ~0.965925826

// Geometry constants in 1920x1080 SVG coordinate space
const H_TITLE = 88;
const DX_TITLE = H_TITLE * TAN_25; // ~23.58
const W_ACCENT = 24;
const GAP_X = 6;
const GAP_Y = 7;
const H_SUB = 52;
const DX_SUB = H_SUB * TAN_25; // ~13.93

const PAD_TITLE_X = 38;
const PAD_SUB_X = 28;
const MIN_TITLE_W = 480;
const MIN_SUB_W = 340;

// Fast-out, smooth-deceleration cubic-bezier for single-segment SMIL tweens
const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  title: "ELECTION NIGHT 2026",
  subtitle: "LIVE COVERAGE & POLLING ANALYSIS ACROSS ALL DISTRICTS",
  primaryColor: "#0f2b5b",
  secondaryColor: "#162032",
  accentColor: "#d32f2f",
  position: "bottom-left",
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

.title-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 56px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 2px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7));
}

.subtitle-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 29px;
  font-weight: 700;
  fill: #f2f6fc;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.75));
}
`;

/**
 * Shifts a #rrggbb hex color's brightness by `percent` (-100 to +100).
 */
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

/**
 * Computes vertices for a 25-degree forward-leaning parallelogram (/):
 * Bottom-left is at (x, y + h), top-left is at (x + dx, y).
 * Also returns 1px-inset vertices for crisp 2px skeuomorphic beveled borders.
 */
function computeSkewedBox(x, y, w, h) {
  const safeW = Math.max(0, w);
  const dx = h * TAN_25;

  const tl = [x + dx, y];
  const tr = [x + dx + safeW, y];
  const br = [x + safeW, y + h];
  const bl = [x, y + h];

  const points = `${tl[0].toFixed(2)},${tl[1].toFixed(2)} ${tr[0].toFixed(2)},${tr[1].toFixed(2)} ${br[0].toFixed(2)},${br[1].toFixed(2)} ${bl[0].toFixed(2)},${bl[1].toFixed(2)}`;

  // Upper-half glossy reflection polygon
  const sheenH = h * 0.46;
  const sheenDx = (h - sheenH) * TAN_25;
  const stl = tl;
  const str = tr;
  const sbr = [x + sheenDx + safeW, y + sheenH];
  const sbl = [x + sheenDx, y + sheenH];
  const sheenPoints = `${stl[0].toFixed(2)},${stl[1].toFixed(2)} ${str[0].toFixed(2)},${str[1].toFixed(2)} ${sbr[0].toFixed(2)},${sbr[1].toFixed(2)} ${sbl[0].toFixed(2)},${sbl[1].toFixed(2)}`;

  // 1px inward normal offset so a 2px stroke sits cleanly inside the box perimeter
  const insetPerp = 1 / COS_25; // ~1.1034px horizontal shift for 1px normal
  const insetSlope = TAN_25;    // ~0.4663px horizontal shift for 1px vertical inset

  const itl = [tl[0] - insetSlope + insetPerp, y + 1];
  const itr = [tr[0] - insetSlope - insetPerp, y + 1];
  const ibr = [br[0] + insetSlope - insetPerp, y + h - 1];
  const ibl = [bl[0] + insetSlope + insetPerp, y + h - 1];

  // Top + Left lit bevel (2px wide)
  const lightBevel = `${ibl[0].toFixed(2)},${ibl[1].toFixed(2)} ${itl[0].toFixed(2)},${itl[1].toFixed(2)} ${itr[0].toFixed(2)},${itr[1].toFixed(2)}`;
  // Right + Bottom shadow bevel (2px wide)
  const shadowBevel = `${itr[0].toFixed(2)},${itr[1].toFixed(2)} ${ibr[0].toFixed(2)},${ibr[1].toFixed(2)} ${ibl[0].toFixed(2)},${ibl[1].toFixed(2)}`;
  // Closed 1px-inset perimeter for subtle idle border glow
  const insetPoints = `${itl[0].toFixed(2)},${itl[1].toFixed(2)} ${itr[0].toFixed(2)},${itr[1].toFixed(2)} ${ibr[0].toFixed(2)},${ibr[1].toFixed(2)} ${ibl[0].toFixed(2)},${ibl[1].toFixed(2)}`;

  return { points, sheenPoints, lightBevel, shadowBevel, insetPoints };
}

class NewsThemeGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._layout = {
      titleX: W_ACCENT + GAP_X,
      titleY: 0,
      titleW: MIN_TITLE_W,
      subX: 0,
      subY: H_TITLE + GAP_Y,
      subW: MIN_SUB_W,
      hasSubtitle: true,
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
        <!-- Drop shadow for broadcast depth -->
        <filter id="box-drop-shadow" x="-10%" y="-20%" width="130%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.55" />
        </filter>

        <!-- Title Box Gradient -->
        <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="title-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="title-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="title-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <!-- Sub-title Box Gradient -->
        <linearGradient id="sub-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="sub-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="sub-stop-1" offset="52%" stop-color="#162032" />
          <stop id="sub-stop-2" offset="100%" stop-color="#0c121d" />
        </linearGradient>

        <!-- Accent Box Gradient -->
        <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="accent-stop-0" offset="0%" stop-color="#ef5350" />
          <stop id="accent-stop-1" offset="50%" stop-color="#d32f2f" />
          <stop id="accent-stop-2" offset="100%" stop-color="#9a1b1b" />
        </linearGradient>

        <!-- Brightened Accent Pulse Gradient & Glow Filter for Idle State -->
        <linearGradient id="accent-pulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="accent-pulse-stop-0" offset="0%" stop-color="#ff8a80" />
          <stop id="accent-pulse-stop-1" offset="50%" stop-color="#ff5252" />
          <stop id="accent-pulse-stop-2" offset="100%" stop-color="#e53935" />
        </linearGradient>

        <filter id="accent-idle-glow" x="-60%" y="-40%" width="220%" height="180%">
          <feGaussianBlur stdDeviation="9" result="blur" />
        </filter>

        <!-- Subtle Border Glow Filter & Traveling Specular Shimmer for Idle State -->
        <filter id="border-idle-glow" x="-15%" y="-35%" width="130%" height="170%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="80" y2="120">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.46" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animate id="anim-border-shimmer-x1" attributeName="x1" begin="indefinite" dur="3.6s" repeatCount="indefinite"
            values="-300; 1250; -300" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate id="anim-border-shimmer-x2" attributeName="x2" begin="indefinite" dur="3.6s" repeatCount="indefinite"
            values="80; 1630; 80" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </linearGradient>

        <!-- Subtle top specular sheen for skeuomorphic finish -->
        <linearGradient id="plate-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
        </linearGradient>

        <!-- Bevel edge gradients (2px skeuomorphic borders) -->
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

        <!-- SVG Masks driven by native SMIL <animate> elements -->
        <mask id="title-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-50" width="2200" height="400">
          <polygon id="title-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="anim-title-mask" attributeName="points" begin="indefinite" dur="0.54s" fill="freeze" />
          </polygon>
        </mask>

        <mask id="sub-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-50" width="2200" height="400">
          <polygon id="sub-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="anim-sub-mask" attributeName="points" begin="indefinite" dur="0.48s" fill="freeze" />
          </polygon>
        </mask>
      </defs>

      <!-- Root Positioned Graphic Group -->
      <g id="graphic-root" transform="translate(96, 830)">
        <!-- SUB-TITLE LAYER (Tucked underneath Title Box) -->
        <g id="subtitle-layer">
          <g id="subtitle-masked-group" mask="url(#sub-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="sub-bg" fill="url(#sub-grad)">
              <animate id="anim-sub-bg" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polygon>
            <polygon id="sub-sheen" fill="url(#plate-sheen)">
              <animate id="anim-sub-sheen" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polygon>
            <g id="sub-text-group">
              <animateTransform id="anim-sub-text-slide" attributeName="transform" type="translate"
                begin="indefinite" dur="0.48s" fill="freeze"
                calcMode="spline" keyTimes="0;1" keySplines="${EASE_OUT_SPLINE}" />
              <text id="sub-text" class="subtitle-text" x="0" y="0"></text>
            </g>
            <polyline id="sub-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-sub-bevel-shadow" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polyline>
            <polyline id="sub-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-sub-bevel-light" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polyline>
            <polygon id="sub-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-sub-border-glow" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
              <animate id="anim-sub-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.16;0.40;0.16" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>

          <!-- Swiping Accent Wiper for Sub-title (single continuous ease-out swipe right-to-left) -->
          <g id="sub-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="anim-sub-wiper-opacity" attributeName="opacity" begin="indefinite" dur="0.48s" fill="freeze" />
            <polygon id="sub-wiper-bg" fill="url(#accent-grad)">
              <animate id="anim-sub-wiper-bg" attributeName="points" begin="indefinite" dur="0.48s" fill="freeze" />
            </polygon>
            <polygon id="sub-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="anim-sub-wiper-sheen" attributeName="points" begin="indefinite" dur="0.48s" fill="freeze" />
            </polygon>
            <polyline id="sub-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-sub-wiper-shadow" attributeName="points" begin="indefinite" dur="0.48s" fill="freeze" />
            </polyline>
            <polyline id="sub-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-sub-wiper-light" attributeName="points" begin="indefinite" dur="0.48s" fill="freeze" />
            </polyline>
          </g>
        </g>

        <!-- TITLE LAYER -->
        <g id="title-layer">
          <g id="title-masked-group" mask="url(#title-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="title-bg" fill="url(#title-grad)">
              <animate id="anim-title-bg" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polygon>
            <polygon id="title-sheen" fill="url(#plate-sheen)">
              <animate id="anim-title-sheen" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polygon>
            <g id="title-text-group">
              <animateTransform id="anim-title-text-slide" attributeName="transform" type="translate"
                begin="indefinite" dur="0.54s" fill="freeze"
                calcMode="spline" keyTimes="0;1" keySplines="${EASE_OUT_SPLINE}" />
              <text id="title-text" class="title-text" x="0" y="0"></text>
            </g>
            <polyline id="title-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-title-bevel-shadow" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polyline>
            <polyline id="title-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-title-bevel-light" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
            </polyline>
            <polygon id="title-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-title-border-glow" attributeName="points" begin="indefinite" dur="0.25s" fill="freeze" />
              <animate id="anim-title-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.18;0.44;0.18" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>

          <!-- Secondary Out-Animation Accent Wiper for Title Box (enters from right on Out, swipes left to hide) -->
          <g id="title-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="anim-title-wiper-opacity" attributeName="opacity" begin="indefinite" dur="0.46s" fill="freeze" />
            <polygon id="title-wiper-bg" fill="url(#accent-grad)">
              <animate id="anim-title-wiper-bg" attributeName="points" begin="indefinite" dur="0.46s" fill="freeze" />
            </polygon>
            <polygon id="title-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="anim-title-wiper-sheen" attributeName="points" begin="indefinite" dur="0.46s" fill="freeze" />
            </polygon>
            <polyline id="title-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-title-wiper-shadow" attributeName="points" begin="indefinite" dur="0.46s" fill="freeze" />
            </polyline>
            <polyline id="title-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-title-wiper-light" attributeName="points" begin="indefinite" dur="0.46s" fill="freeze" />
            </polyline>
          </g>
        </g>

        <!-- PRIMARY ACCENT BOX (Enters from right on In, swipes left in one smooth curve, settles on the left side, and pulses while idle) -->
        <g id="accent-layer" opacity="0" filter="url(#box-drop-shadow)">
          <animate id="anim-accent-opacity" attributeName="opacity" begin="indefinite" dur="0.54s" fill="freeze" />
          <polygon id="accent-glow-poly" fill="url(#accent-pulse-grad)" filter="url(#accent-idle-glow)" opacity="0">
            <animate id="anim-accent-glow-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.75;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-bg" fill="url(#accent-grad)">
            <animate id="anim-accent-bg" attributeName="points" begin="indefinite" dur="0.54s" fill="freeze" />
          </polygon>
          <polygon id="accent-pulse-overlay" fill="url(#accent-pulse-grad)" opacity="0">
            <animate id="anim-accent-overlay-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.55;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-sheen" fill="url(#plate-sheen)">
            <animate id="anim-accent-sheen" attributeName="points" begin="indefinite" dur="0.54s" fill="freeze" />
          </polygon>
          <polyline id="accent-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-shadow" attributeName="points" begin="indefinite" dur="0.54s" fill="freeze" />
          </polyline>
          <polyline id="accent-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-light" attributeName="points" begin="indefinite" dur="0.54s" fill="freeze" />
          </polyline>
        </g>
      </g>
    `;

    const q = (sel) => svg.querySelector(sel);
    this._els = {
      rootGroup: q("#graphic-root"),
      titleStop0: q("#title-stop-0"),
      titleStop1: q("#title-stop-1"),
      titleStop2: q("#title-stop-2"),
      subStop0: q("#sub-stop-0"),
      subStop1: q("#sub-stop-1"),
      subStop2: q("#sub-stop-2"),
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

      titleMaskPoly: q("#title-mask-poly"),
      animTitleMask: q("#anim-title-mask"),
      subMaskPoly: q("#sub-mask-poly"),
      animSubMask: q("#anim-sub-mask"),

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

      titleBg: q("#title-bg"),
      animTitleBg: q("#anim-title-bg"),
      titleSheen: q("#title-sheen"),
      animTitleSheen: q("#anim-title-sheen"),
      titleText: q("#title-text"),
      animTitleTextSlide: q("#anim-title-text-slide"),
      titleBevelLight: q("#title-bevel-light"),
      animTitleBevelLight: q("#anim-title-bevel-light"),
      titleBevelShadow: q("#title-bevel-shadow"),
      animTitleBevelShadow: q("#anim-title-bevel-shadow"),
      titleBorderGlow: q("#title-border-glow"),
      animTitleBorderGlow: q("#anim-title-border-glow"),
      animTitleBorderGlowPulse: q("#anim-title-border-glow-pulse"),

      titleWiperGroup: q("#title-wiper-group"),
      animTitleWiperOpacity: q("#anim-title-wiper-opacity"),
      titleWiperBg: q("#title-wiper-bg"),
      animTitleWiperBg: q("#anim-title-wiper-bg"),
      titleWiperSheen: q("#title-wiper-sheen"),
      animTitleWiperSheen: q("#anim-title-wiper-sheen"),
      titleWiperLight: q("#title-wiper-light"),
      animTitleWiperLight: q("#anim-title-wiper-light"),
      titleWiperShadow: q("#title-wiper-shadow"),
      animTitleWiperShadow: q("#anim-title-wiper-shadow"),

      subtitleLayer: q("#subtitle-layer"),
      subBg: q("#sub-bg"),
      animSubBg: q("#anim-sub-bg"),
      subSheen: q("#sub-sheen"),
      animSubSheen: q("#anim-sub-sheen"),
      subText: q("#sub-text"),
      animSubTextSlide: q("#anim-sub-text-slide"),
      subBevelLight: q("#sub-bevel-light"),
      animSubBevelLight: q("#anim-sub-bevel-light"),
      subBevelShadow: q("#sub-bevel-shadow"),
      animSubBevelShadow: q("#anim-sub-bevel-shadow"),
      subBorderGlow: q("#sub-border-glow"),
      animSubBorderGlow: q("#anim-sub-border-glow"),
      animSubBorderGlowPulse: q("#anim-sub-border-glow-pulse"),

      subWiperGroup: q("#sub-wiper-group"),
      animSubWiperOpacity: q("#anim-sub-wiper-opacity"),
      subWiperBg: q("#sub-wiper-bg"),
      animSubWiperBg: q("#anim-sub-wiper-bg"),
      subWiperSheen: q("#sub-wiper-sheen"),
      animSubWiperSheen: q("#anim-sub-wiper-sheen"),
      subWiperLight: q("#sub-wiper-light"),
      animSubWiperLight: q("#anim-sub-wiper-light"),
      subWiperShadow: q("#sub-wiper-shadow"),
      animSubWiperShadow: q("#anim-sub-wiper-shadow"),
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

  /**
   * Triggers a native SVG SMIL <animate> element with keyframe values.
   */
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

  /**
   * Helper to animate all parts of a skewed box (bg, sheen, lightBevel, shadowBevel, borderGlow) via SMIL.
   */
  _animateSkewedBox(els, keyframes, durSec, keyTimesStr, splineStr) {
    this._triggerSmil(els.bg, els.animBg, "points", keyframes.map((k) => k.points), durSec, keyTimesStr, splineStr);
    if (els.sheen && els.animSheen) {
      this._triggerSmil(els.sheen, els.animSheen, "points", keyframes.map((k) => k.sheenPoints), durSec, keyTimesStr, splineStr);
    }
    this._triggerSmil(els.light, els.animLight, "points", keyframes.map((k) => k.lightBevel), durSec, keyTimesStr, splineStr);
    this._triggerSmil(els.shadow, els.animShadow, "points", keyframes.map((k) => k.shadowBevel), durSec, keyTimesStr, splineStr);
    if (els.borderGlow && els.animBorderGlow) {
      this._triggerSmil(els.borderGlow, els.animBorderGlow, "points", keyframes.map((k) => k.insetPoints), durSec, keyTimesStr, splineStr);
    }
  }

  /**
   * Immediately sets an SVG attribute and synchronizes the SMIL <animate> freeze state.
   */
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
      } catch (_) {
        // Fallback if SVG is not attached yet
      }
    }
  }

  _setStaticSkewedBox(els, boxGeom) {
    this._setStaticSvgAttr(els.bg, els.animBg, "points", boxGeom.points);
    if (els.sheen && els.animSheen) {
      this._setStaticSvgAttr(els.sheen, els.animSheen, "points", boxGeom.sheenPoints);
    }
    this._setStaticSvgAttr(els.light, els.animLight, "points", boxGeom.lightBevel);
    this._setStaticSvgAttr(els.shadow, els.animShadow, "points", boxGeom.shadowBevel);
    if (els.borderGlow && els.animBorderGlow) {
      this._setStaticSvgAttr(els.borderGlow, els.animBorderGlow, "points", boxGeom.insetPoints);
    }
  }

  _updateGradients() {
    const { primaryColor, secondaryColor, accentColor } = this._state;
    const {
      titleStop0, titleStop1, titleStop2,
      subStop0, subStop1, subStop2,
      accentStop0, accentStop1, accentStop2,
      accentPulseStop0, accentPulseStop1, accentPulseStop2,
      borderGlowTint,
    } = this._els;

    titleStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    titleStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    titleStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -30));

    subStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    subStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    subStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -32));

    accentStop0.setAttribute("stop-color", adjustHexColor(accentColor, 22));
    accentStop1.setAttribute("stop-color", adjustHexColor(accentColor, 0));
    accentStop2.setAttribute("stop-color", adjustHexColor(accentColor, -28));

    accentPulseStop0.setAttribute("stop-color", adjustHexColor(accentColor, 58));
    accentPulseStop1.setAttribute("stop-color", adjustHexColor(accentColor, 36));
    accentPulseStop2.setAttribute("stop-color", adjustHexColor(accentColor, 15));

    if (borderGlowTint) {
      borderGlowTint.setAttribute("stop-color", adjustHexColor(primaryColor, 68));
    }
  }

  _startIdlePulse() {
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_TITLE);
    this._els.accentGlowPoly.setAttribute("points", parkedAccentBox.points);
    this._els.accentPulseOverlay.setAttribute("points", parkedAccentBox.points);
    try {
      this._els.animAccentGlowPulse.beginElement();
      this._els.animAccentOverlayPulse.beginElement();
      this._els.animBorderShimmerX1.beginElement();
      this._els.animBorderShimmerX2.beginElement();
      this._els.animBevelStop0.beginElement();
      this._els.animBevelStop1.beginElement();
      this._els.animTitleBorderGlowPulse.beginElement();
      this._els.animSubBorderGlowPulse.beginElement();
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
      this._els.animTitleBorderGlowPulse.endElement();
      this._els.animSubBorderGlowPulse.endElement();
    } catch (_) {}
    this._els.accentGlowPoly.setAttribute("opacity", "0");
    this._els.accentPulseOverlay.setAttribute("opacity", "0");
    this._els.titleBorderGlow.setAttribute("opacity", "0");
    this._els.subBorderGlow.setAttribute("opacity", "0");
  }

  _measureTextWidth(textElement, fallbackCharWidth) {
    try {
      const len = textElement.getComputedTextLength();
      if (len && len > 0) return len;
    } catch (_) {
      // Ignore if not in DOM or hidden
    }
    try {
      const bbox = textElement.getBBox();
      if (bbox && bbox.width > 0) return bbox.width;
    } catch (_) {
      // Ignore
    }
    return (textElement.textContent || "").length * fallbackCharWidth;
  }

  _computeAndApplyStaticGeometry(skipBoxAttrReset = false) {
    const titleStr = (this._state.title || "").trim();
    const subStr = (this._state.subtitle || "").trim();
    const hasSubtitle = subStr.length > 0;

    this._els.titleText.textContent = titleStr;
    this._els.subText.textContent = subStr;
    this._els.subtitleLayer.style.display = hasSubtitle ? "" : "none";

    // Measure text widths in SVG user units
    const rawTitleTextW = this._measureTextWidth(this._els.titleText, 27);
    const rawSubTextW = hasSubtitle ? this._measureTextWidth(this._els.subText, 16) : 0;

    const titleX = W_ACCENT + GAP_X; // 30
    const titleY = 0;
    const titleW = Math.max(MIN_TITLE_W, Math.ceil(rawTitleTextW + PAD_TITLE_X * 2));

    // Sub-title sits below Title box with its left 15-deg edge collinear with Title box's left edge
    const subY = H_TITLE + GAP_Y;
    const subX = titleX - GAP_Y * TAN_25 - DX_SUB;
    const subW = hasSubtitle
      ? Math.max(MIN_SUB_W, Math.ceil(rawSubTextW + PAD_SUB_X * 2))
      : 0;

    this._layout = { titleX, titleY, titleW, subX, subY, subW, hasSubtitle };

    // Position upright Title text vertically centered & horizontally padded inside the skewed box
    const titleTextX = titleX + DX_TITLE * 0.5 + PAD_TITLE_X;
    const titleTextY = titleY + H_TITLE * 0.5;
    this._els.titleText.setAttribute("x", titleTextX.toFixed(2));
    this._els.titleText.setAttribute("y", titleTextY.toFixed(2));

    if (hasSubtitle) {
      const subTextX = subX + DX_SUB * 0.5 + PAD_SUB_X;
      const subTextY = subY + H_SUB * 0.5;
      this._els.subText.setAttribute("x", subTextX.toFixed(2));
      this._els.subText.setAttribute("y", subTextY.toFixed(2));
    }

    if (!skipBoxAttrReset) {
      // 1. Title Box static geometry
      const titleBox = computeSkewedBox(titleX, titleY, titleW, H_TITLE);
      this._setStaticSkewedBox(
        {
          bg: this._els.titleBg,
          animBg: this._els.animTitleBg,
          sheen: this._els.titleSheen,
          animSheen: this._els.animTitleSheen,
          light: this._els.titleBevelLight,
          animLight: this._els.animTitleBevelLight,
          shadow: this._els.titleBevelShadow,
          animShadow: this._els.animTitleBevelShadow,
          borderGlow: this._els.titleBorderGlow,
          animBorderGlow: this._els.animTitleBorderGlow,
        },
        titleBox
      );

      // 2. Sub-title Box static geometry
      if (hasSubtitle) {
        const subBox = computeSkewedBox(subX, subY, subW, H_SUB);
        this._setStaticSkewedBox(
          {
            bg: this._els.subBg,
            animBg: this._els.animSubBg,
            sheen: this._els.subSheen,
            animSheen: this._els.animSubSheen,
            light: this._els.subBevelLight,
            animLight: this._els.animSubBevelLight,
            shadow: this._els.subBevelShadow,
            animShadow: this._els.animSubBevelShadow,
            borderGlow: this._els.subBorderGlow,
            animBorderGlow: this._els.animSubBorderGlow,
          },
          subBox
        );
      }
    }

    // 3. Screen placement (bottom-left or bottom-center)
    const totalHeight = hasSubtitle ? H_TITLE + GAP_Y + H_SUB : H_TITLE;
    const totalRightEdge = Math.max(
      titleX + DX_TITLE + titleW,
      hasSubtitle ? subX + DX_SUB + subW : 0
    );
    const rootY = 1080 - 92 - totalHeight;
    const rootX =
      this._state.position === "bottom-center"
        ? Math.max(60, Math.round((1920 - totalRightEdge) / 2))
        : 96;

    this._els.rootGroup.setAttribute("transform", `translate(${rootX}, ${rootY})`);
  }

  _setMasksHidden() {
    this._stopIdlePulse();
    const { titleX, titleY, titleW, subX, subY, subW } = this._layout;
    const zeroTitle = computeSkewedBox(titleX + titleW, titleY - 4, 0, H_TITLE + 8).points;
    const zeroSub = computeSkewedBox(subX + subW, subY - 4, 0, H_SUB + 8).points;
    const startAccentBox = computeSkewedBox(titleX + titleW, 0, W_ACCENT, H_TITLE);

    this._setStaticSvgAttr(this._els.titleMaskPoly, this._els.animTitleMask, "points", zeroTitle);
    this._setStaticSvgAttr(this._els.subMaskPoly, this._els.animSubMask, "points", zeroSub);

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

    this._setStaticSvgAttr(this._els.titleWiperGroup, this._els.animTitleWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(this._els.subWiperGroup, this._els.animSubWiperOpacity, "opacity", "0");
  }

  _setMasksFullyRevealed() {
    const { titleX, titleY, titleW, subX, subY, subW, hasSubtitle } = this._layout;
    const fullTitle = computeSkewedBox(titleX - 2, titleY - 4, titleW + 6, H_TITLE + 8).points;
    const fullSub = computeSkewedBox(subX - 2, subY - 4, (hasSubtitle ? subW : 0) + 6, H_SUB + 8).points;
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_TITLE);

    this._setStaticSvgAttr(this._els.titleMaskPoly, this._els.animTitleMask, "points", fullTitle);
    this._setStaticSvgAttr(this._els.subMaskPoly, this._els.animSubMask, "points", fullSub);

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

    this._setStaticSvgAttr(this._els.titleWiperGroup, this._els.animTitleWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(this._els.subWiperGroup, this._els.animSubWiperOpacity, "opacity", "0");
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
      return;
    }

    if (this._isVisible) {
      return;
    }
    this._isVisible = true;

    const { titleX, titleY, titleW, subX, subY, subW, hasSubtitle } = this._layout;

    // Reset masks to hidden before starting SMIL timeline
    this._setMasksHidden();

    // 1. Primary Red Accent Box starts at the RIGHT edge of the Title Box (x = titleX + titleW)
    //    and glides to x = 0 in ONE single 2-point ease-out tween (starts fast, slows down smoothly).
    const durTitle = 0.54;
    const aStart = computeSkewedBox(titleX + titleW, titleY, W_ACCENT, H_TITLE);
    const aEnd = computeSkewedBox(0, titleY, W_ACCENT, H_TITLE);

    // Title Mask uses the exact same single 2-point (0;1) ease-out spline,
    // keeping its left reveal edge locked to the center of the Accent Box (x + 0.5 * W_ACCENT) at all times.
    const maskRightEdge = titleX + titleW + W_ACCENT * 0.5;
    const mStartLeft = titleX + titleW + W_ACCENT * 0.5;
    const mEndLeft = W_ACCENT * 0.5; // 12 (to the left of titleX = 30, so Title Box is 100% uncovered)
    const mStart = computeSkewedBox(mStartLeft, titleY - 4, 0, H_TITLE + 8).points;
    const mEnd = computeSkewedBox(mEndLeft, titleY - 4, maskRightEdge - mEndLeft, H_TITLE + 8).points;

    this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["0", "1", "1"], durTitle, "0;0.06;1");
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
      durTitle,
      "0;1",
      EASE_OUT_SPLINE
    );
    this._triggerSmil(this._els.titleMaskPoly, this._els.animTitleMask, "points", [mStart, mEnd], durTitle, "0;1", EASE_OUT_SPLINE);

    // Subtle right-to-left text glide inside Title Box using the same single ease-out curve
    this._els.animTitleTextSlide.setAttribute("from", "26 0");
    this._els.animTitleTextSlide.setAttribute("to", "0 0");
    this._els.animTitleTextSlide.setAttribute("dur", `${durTitle}s`);
    try {
      this._els.animTitleTextSlide.beginElement();
    } catch (_) {}

    // 2. Staggered Sub-title Right-to-Left Swipe & Mask Reveal (+80ms) using a single 2-point ease-out curve
    if (hasSubtitle) {
      await this._schedule(() => {
        const durSub = 0.48;
        const subWiperW = W_ACCENT * 0.85;
        const swStartX = subX + subW;
        const swEndX = subX - subWiperW;

        const swStart = computeSkewedBox(swStartX, subY, subWiperW, H_SUB);
        const swEnd = computeSkewedBox(swEndX, subY, subWiperW, H_SUB);

        const subMaskRight = swStartX + subWiperW * 0.5;
        const smStartLeft = swStartX + subWiperW * 0.5;
        const smEndLeft = swEndX + subWiperW * 0.5;
        const smStart = computeSkewedBox(smStartLeft, subY - 4, 0, H_SUB + 8).points;
        const smEnd = computeSkewedBox(smEndLeft, subY - 4, subMaskRight - smEndLeft, H_SUB + 8).points;

        this._triggerSmil(this._els.subWiperGroup, this._els.animSubWiperOpacity, "opacity", ["0", "1", "1", "0"], durSub, "0;0.06;0.84;1");
        this._animateSkewedBox(
          {
            bg: this._els.subWiperBg,
            animBg: this._els.animSubWiperBg,
            sheen: this._els.subWiperSheen,
            animSheen: this._els.animSubWiperSheen,
            light: this._els.subWiperLight,
            animLight: this._els.animSubWiperLight,
            shadow: this._els.subWiperShadow,
            animShadow: this._els.animSubWiperShadow,
          },
          [swStart, swEnd],
          durSub,
          "0;1",
          EASE_OUT_SPLINE
        );
        this._triggerSmil(this._els.subMaskPoly, this._els.animSubMask, "points", [smStart, smEnd], durSub, "0;1", EASE_OUT_SPLINE);

        this._els.animSubTextSlide.setAttribute("from", "20 0");
        this._els.animSubTextSlide.setAttribute("to", "0 0");
        this._els.animSubTextSlide.setAttribute("dur", `${durSub}s`);
        try {
          this._els.animSubTextSlide.beginElement();
        } catch (_) {}
      }, 80);
    }

    await this._schedule(() => {
      this._setMasksFullyRevealed();
    }, hasSubtitle ? 500 : 560);
  }

  async _animateOut(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation || !this._isVisible) {
      this._isVisible = false;
      this._setMasksHidden();
      this._scene.classList.remove("visible");
      return;
    }

    this._isVisible = false;
    const { titleX, titleY, titleW, subX, subY, subW, hasSubtitle } = this._layout;

    // 1. Sub-title: Another red accent bar enters from the RIGHT and swipes LEFT in one continuous ease-out curve
    if (hasSubtitle) {
      const durSub = 0.44;
      const subWiperW = W_ACCENT * 0.85;
      const swStartX = subX + subW;
      const swEndX = subX - subWiperW;

      const swStart = computeSkewedBox(swStartX, subY, subWiperW, H_SUB);
      const swEnd = computeSkewedBox(swEndX, subY, subWiperW, H_SUB);

      const subMaskLeft = swEndX + subWiperW * 0.5;
      const smStartRight = swStartX + subWiperW * 0.5;
      const smEndRight = swEndX + subWiperW * 0.5;
      const smStart = computeSkewedBox(subMaskLeft, subY - 4, smStartRight - subMaskLeft, H_SUB + 8).points;
      const smEnd = computeSkewedBox(subMaskLeft, subY - 4, smEndRight - subMaskLeft, H_SUB + 8).points;

      this._triggerSmil(this._els.subMaskPoly, this._els.animSubMask, "points", [smStart, smEnd], durSub, "0;1", EASE_OUT_SPLINE);
      this._triggerSmil(this._els.subWiperGroup, this._els.animSubWiperOpacity, "opacity", ["0", "1", "1", "0"], durSub, "0;0.06;0.84;1");
      this._animateSkewedBox(
        {
          bg: this._els.subWiperBg,
          animBg: this._els.animSubWiperBg,
          sheen: this._els.subWiperSheen,
          animSheen: this._els.animSubWiperSheen,
          light: this._els.subWiperLight,
          animLight: this._els.animSubWiperLight,
          shadow: this._els.subWiperShadow,
          animShadow: this._els.animSubWiperShadow,
        },
        [swStart, swEnd],
        durSub,
        "0;1",
        EASE_OUT_SPLINE
      );
    }

    // 2. Title Box: Another red accent bar (#title-wiper-group) enters at the RIGHT edge,
    //    swipes RIGHT-TO-LEFT in a single continuous ease-out curve to hide the Title Box,
    //    lands on the parked Left Accent Box, and both fade/collapse out.
    await this._schedule(() => {
      const durTitle = 0.46;
      const wStart = computeSkewedBox(titleX + titleW, titleY, W_ACCENT, H_TITLE);
      const wEnd = computeSkewedBox(0, titleY, W_ACCENT, H_TITLE);

      const maskLeft = W_ACCENT * 0.5; // 12 (to the left of titleX = 30)
      const mStartRight = titleX + titleW + W_ACCENT * 0.5;
      const mEndRight = W_ACCENT * 0.5;
      const mStart = computeSkewedBox(maskLeft, titleY - 4, mStartRight - maskLeft, H_TITLE + 8).points;
      const mEnd = computeSkewedBox(maskLeft, titleY - 4, mEndRight - maskLeft, H_TITLE + 8).points;

      this._triggerSmil(this._els.titleMaskPoly, this._els.animTitleMask, "points", [mStart, mEnd], durTitle, "0;1", EASE_OUT_SPLINE);
      this._triggerSmil(this._els.titleWiperGroup, this._els.animTitleWiperOpacity, "opacity", ["0", "1", "1", "0"], durTitle, "0;0.06;0.88;1");
      this._animateSkewedBox(
        {
          bg: this._els.titleWiperBg,
          animBg: this._els.animTitleWiperBg,
          sheen: this._els.titleWiperSheen,
          animSheen: this._els.animTitleWiperSheen,
          light: this._els.titleWiperLight,
          animLight: this._els.animTitleWiperLight,
          shadow: this._els.titleWiperShadow,
          animShadow: this._els.animTitleWiperShadow,
        },
        [wStart, wEnd],
        durTitle,
        "0;1",
        EASE_OUT_SPLINE
      );

      // Parked Left Accent Box fades out right as the incoming wiper meets it on the left
      this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["1", "1", "0"], durTitle, "0;0.84;1");
    }, hasSubtitle ? 50 : 0);

    await this._schedule(() => {
      this._setMasksHidden();
      this._scene.classList.remove("visible");
    }, hasSubtitle ? 520 : 480);
  }

  // ==========================================================================
  // OGraf Lifecycle Methods
  // ==========================================================================

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params?.data || {}) };
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
    const prevLayout = { ...this._layout };
    this._state = { ...this._state, ...(params?.data || {}) };
    this._updateGradients();

    const skip = params?.skipAnimation === true;
    this._computeAndApplyStaticGeometry(this._isVisible && !skip);

    if (this._isVisible) {
      const { titleX, titleY, titleW, subX, subY, subW, hasSubtitle } = this._layout;

      if (!skip && (prevLayout.titleW !== titleW || prevLayout.subW !== subW)) {
        const prevTitleBox = computeSkewedBox(titleX, titleY, prevLayout.titleW, H_TITLE);
        const nextTitleBox = computeSkewedBox(titleX, titleY, titleW, H_TITLE);
        this._animateSkewedBox(
          {
            bg: this._els.titleBg,
            animBg: this._els.animTitleBg,
            sheen: this._els.titleSheen,
            animSheen: this._els.animTitleSheen,
            light: this._els.titleBevelLight,
            animLight: this._els.animTitleBevelLight,
            shadow: this._els.titleBevelShadow,
            animShadow: this._els.titleBevelShadow,
            borderGlow: this._els.titleBorderGlow,
            animBorderGlow: this._els.animTitleBorderGlow,
          },
          [prevTitleBox, nextTitleBox],
          0.26,
          "0;1",
          EASE_OUT_SPLINE
        );

        const prevTitleMask = computeSkewedBox(titleX - 2, titleY - 4, prevLayout.titleW + 6, H_TITLE + 8).points;
        const nextTitleMask = computeSkewedBox(titleX - 2, titleY - 4, titleW + 6, H_TITLE + 8).points;
        this._triggerSmil(this._els.titleMaskPoly, this._els.animTitleMask, "points", [prevTitleMask, nextTitleMask], 0.26, "0;1", EASE_OUT_SPLINE);

        if (hasSubtitle) {
          const startSubW = prevLayout.hasSubtitle ? prevLayout.subW : 0;
          const prevSubBox = computeSkewedBox(subX, subY, startSubW, H_SUB);
          const nextSubBox = computeSkewedBox(subX, subY, subW, H_SUB);
          this._animateSkewedBox(
            {
              bg: this._els.subBg,
              animBg: this._els.animSubBg,
              sheen: this._els.subSheen,
              animSheen: this._els.animSubSheen,
              light: this._els.subBevelLight,
              animLight: this._els.animSubBevelLight,
              shadow: this._els.subBevelShadow,
              animShadow: this._els.animSubBevelShadow,
              borderGlow: this._els.subBorderGlow,
              animBorderGlow: this._els.animSubBorderGlow,
            },
            [prevSubBox, nextSubBox],
            0.26,
            "0;1",
            EASE_OUT_SPLINE
          );

          const prevSubMask = computeSkewedBox(subX - 2, subY - 4, startSubW + 6, H_SUB + 8).points;
          const nextSubMask = computeSkewedBox(subX - 2, subY - 4, subW + 6, H_SUB + 8).points;
          this._triggerSmil(this._els.subMaskPoly, this._els.animSubMask, "points", [prevSubMask, nextSubMask], 0.26, "0;1", EASE_OUT_SPLINE);
        }
      } else {
        this._computeAndApplyStaticGeometry(false);
        this._setMasksFullyRevealed();
      }
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

export default NewsThemeGraphic;
