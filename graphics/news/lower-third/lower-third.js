/**
 * News Package - Name Lower Third (graphics/news/lower-third)
 * Broadcast speaker identification lower-third with 15-degree skewed gradient boxes,
 * 2px skeuomorphic beveled borders, idle pulse/border glow, and SVG mask + SMIL swipe animations.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_15 = Math.tan((SKEW_DEG * Math.PI) / 180); // ~0.267949192
const COS_15 = Math.cos((SKEW_DEG * Math.PI) / 180); // ~0.965925826

// Compact speaker lower-third geometry in 1920x1080 SVG coordinate space
const H_NAME = 68;
const DX_NAME = H_NAME * TAN_15; // ~18.22
const W_ACCENT = 20;
const GAP_X = 5;
const GAP_Y = 5;
const H_ROLE = 42;
const DX_ROLE = H_ROLE * TAN_15; // ~11.25

const PAD_NAME_X = 32;
const PAD_ROLE_X = 24;
const MIN_NAME_W = 360;
const MIN_ROLE_W = 260;

const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  name: "SARAH JENKINS",
  title: "CHIEF POLITICAL CORRESPONDENT",
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

.name-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 42px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7));
}

.role-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 23px;
  font-weight: 700;
  fill: #f2f6fc;
  letter-spacing: 2px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 1.5px 3px rgba(0, 0, 0, 0.75));
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

class NewsLowerThirdGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._layout = {
      nameX: W_ACCENT + GAP_X,
      nameY: 0,
      nameW: MIN_NAME_W,
      roleX: 0,
      roleY: H_NAME + GAP_Y,
      roleW: MIN_ROLE_W,
      hasRole: true,
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
        <filter id="box-drop-shadow" x="-10%" y="-20%" width="130%" height="160%">
          <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000000" flood-opacity="0.55" />
        </filter>

        <linearGradient id="name-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="name-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="name-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="name-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <linearGradient id="role-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="role-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="role-stop-1" offset="52%" stop-color="#162032" />
          <stop id="role-stop-2" offset="100%" stop-color="#0c121d" />
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

        <filter id="border-idle-glow" x="-15%" y="-35%" width="130%" height="170%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="60" y2="100">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.46" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animate id="anim-border-shimmer-x1" attributeName="x1" begin="indefinite" dur="3.4s" repeatCount="indefinite"
            values="-260; 1050; -260" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate id="anim-border-shimmer-x2" attributeName="x2" begin="indefinite" dur="3.4s" repeatCount="indefinite"
            values="60; 1370; 60" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
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

        <mask id="name-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-50" width="2200" height="400">
          <polygon id="name-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="anim-name-mask" attributeName="points" begin="indefinite" dur="0.50s" fill="freeze" />
          </polygon>
        </mask>

        <mask id="role-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-50" width="2200" height="400">
          <polygon id="role-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="anim-role-mask" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
          </polygon>
        </mask>
      </defs>

      <g id="graphic-root" transform="translate(96, 868)">
        <!-- ROLE / TITLE LAYER -->
        <g id="role-layer">
          <g id="role-masked-group" mask="url(#role-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="role-bg" fill="url(#role-grad)">
              <animate id="anim-role-bg" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polygon>
            <polygon id="role-sheen" fill="url(#plate-sheen)">
              <animate id="anim-role-sheen" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polygon>
            <g id="role-text-group">
              <animateTransform id="anim-role-text-slide" attributeName="transform" type="translate"
                begin="indefinite" dur="0.44s" fill="freeze"
                calcMode="spline" keyTimes="0;1" keySplines="${EASE_OUT_SPLINE}" />
              <text id="role-text" class="role-text" x="0" y="0"></text>
            </g>
            <polyline id="role-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-role-bevel-shadow" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polyline>
            <polyline id="role-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-role-bevel-light" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polyline>
            <polygon id="role-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-role-border-glow" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
              <animate id="anim-role-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.16;0.40;0.16" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>

          <g id="role-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="anim-role-wiper-opacity" attributeName="opacity" begin="indefinite" dur="0.44s" fill="freeze" />
            <polygon id="role-wiper-bg" fill="url(#accent-grad)">
              <animate id="anim-role-wiper-bg" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polygon>
            <polygon id="role-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="anim-role-wiper-sheen" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polygon>
            <polyline id="role-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-role-wiper-shadow" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polyline>
            <polyline id="role-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-role-wiper-light" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polyline>
          </g>
        </g>

        <!-- NAME LAYER -->
        <g id="name-layer">
          <g id="name-masked-group" mask="url(#name-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="name-bg" fill="url(#name-grad)">
              <animate id="anim-name-bg" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polygon>
            <polygon id="name-sheen" fill="url(#plate-sheen)">
              <animate id="anim-name-sheen" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polygon>
            <g id="name-text-group">
              <animateTransform id="anim-name-text-slide" attributeName="transform" type="translate"
                begin="indefinite" dur="0.50s" fill="freeze"
                calcMode="spline" keyTimes="0;1" keySplines="${EASE_OUT_SPLINE}" />
              <text id="name-text" class="name-text" x="0" y="0"></text>
            </g>
            <polyline id="name-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-name-bevel-shadow" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polyline>
            <polyline id="name-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-name-bevel-light" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
            </polyline>
            <polygon id="name-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate id="anim-name-border-glow" attributeName="points" begin="indefinite" dur="0.24s" fill="freeze" />
              <animate id="anim-name-border-glow-pulse" attributeName="opacity" begin="indefinite" dur="2.8s" repeatCount="indefinite"
                values="0.18;0.44;0.18" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
            </polygon>
          </g>

          <g id="name-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="anim-name-wiper-opacity" attributeName="opacity" begin="indefinite" dur="0.44s" fill="freeze" />
            <polygon id="name-wiper-bg" fill="url(#accent-grad)">
              <animate id="anim-name-wiper-bg" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polygon>
            <polygon id="name-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="anim-name-wiper-sheen" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polygon>
            <polyline id="name-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-name-wiper-shadow" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polyline>
            <polyline id="name-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
              <animate id="anim-name-wiper-light" attributeName="points" begin="indefinite" dur="0.44s" fill="freeze" />
            </polyline>
          </g>
        </g>

        <!-- PRIMARY ACCENT BOX -->
        <g id="accent-layer" opacity="0" filter="url(#box-drop-shadow)">
          <animate id="anim-accent-opacity" attributeName="opacity" begin="indefinite" dur="0.50s" fill="freeze" />
          <polygon id="accent-glow-poly" fill="url(#accent-pulse-grad)" filter="url(#accent-idle-glow)" opacity="0">
            <animate id="anim-accent-glow-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.75;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-bg" fill="url(#accent-grad)">
            <animate id="anim-accent-bg" attributeName="points" begin="indefinite" dur="0.50s" fill="freeze" />
          </polygon>
          <polygon id="accent-pulse-overlay" fill="url(#accent-pulse-grad)" opacity="0">
            <animate id="anim-accent-overlay-pulse" attributeName="opacity" begin="indefinite" dur="1.6s" repeatCount="indefinite"
              values="0;0.55;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          </polygon>
          <polygon id="accent-sheen" fill="url(#plate-sheen)">
            <animate id="anim-accent-sheen" attributeName="points" begin="indefinite" dur="0.50s" fill="freeze" />
          </polygon>
          <polyline id="accent-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-shadow" attributeName="points" begin="indefinite" dur="0.50s" fill="freeze" />
          </polyline>
          <polyline id="accent-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linejoin="miter">
            <animate id="anim-accent-bevel-light" attributeName="points" begin="indefinite" dur="0.50s" fill="freeze" />
          </polyline>
        </g>
      </g>
    `;

    const q = (sel) => svg.querySelector(sel);
    this._els = {
      rootGroup: q("#graphic-root"),
      nameStop0: q("#name-stop-0"),
      nameStop1: q("#name-stop-1"),
      nameStop2: q("#name-stop-2"),
      roleStop0: q("#role-stop-0"),
      roleStop1: q("#role-stop-1"),
      roleStop2: q("#role-stop-2"),
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

      nameMaskPoly: q("#name-mask-poly"),
      animNameMask: q("#anim-name-mask"),
      roleMaskPoly: q("#role-mask-poly"),
      animRoleMask: q("#anim-role-mask"),

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

      nameBg: q("#name-bg"),
      animNameBg: q("#anim-name-bg"),
      nameSheen: q("#name-sheen"),
      animNameSheen: q("#anim-name-sheen"),
      nameText: q("#name-text"),
      animNameTextSlide: q("#anim-name-text-slide"),
      nameBevelLight: q("#name-bevel-light"),
      animNameBevelLight: q("#anim-name-bevel-light"),
      nameBevelShadow: q("#name-bevel-shadow"),
      animNameBevelShadow: q("#anim-name-bevel-shadow"),
      nameBorderGlow: q("#name-border-glow"),
      animNameBorderGlow: q("#anim-name-border-glow"),
      animNameBorderGlowPulse: q("#anim-name-border-glow-pulse"),

      nameWiperGroup: q("#name-wiper-group"),
      animNameWiperOpacity: q("#anim-name-wiper-opacity"),
      nameWiperBg: q("#name-wiper-bg"),
      animNameWiperBg: q("#anim-name-wiper-bg"),
      nameWiperSheen: q("#name-wiper-sheen"),
      animNameWiperSheen: q("#anim-name-wiper-sheen"),
      nameWiperLight: q("#name-wiper-light"),
      animNameWiperLight: q("#anim-name-wiper-light"),
      nameWiperShadow: q("#name-wiper-shadow"),
      animNameWiperShadow: q("#anim-name-wiper-shadow"),

      roleLayer: q("#role-layer"),
      roleBg: q("#role-bg"),
      animRoleBg: q("#anim-role-bg"),
      roleSheen: q("#role-sheen"),
      animRoleSheen: q("#anim-role-sheen"),
      roleText: q("#role-text"),
      animRoleTextSlide: q("#anim-role-text-slide"),
      roleBevelLight: q("#role-bevel-light"),
      animRoleBevelLight: q("#anim-role-bevel-light"),
      roleBevelShadow: q("#role-bevel-shadow"),
      animRoleBevelShadow: q("#anim-role-bevel-shadow"),
      roleBorderGlow: q("#role-border-glow"),
      animRoleBorderGlow: q("#anim-role-border-glow"),
      animRoleBorderGlowPulse: q("#anim-role-border-glow-pulse"),

      roleWiperGroup: q("#role-wiper-group"),
      animRoleWiperOpacity: q("#anim-role-wiper-opacity"),
      roleWiperBg: q("#role-wiper-bg"),
      animRoleWiperBg: q("#anim-role-wiper-bg"),
      roleWiperSheen: q("#role-wiper-sheen"),
      animRoleWiperSheen: q("#anim-role-wiper-sheen"),
      roleWiperLight: q("#role-wiper-light"),
      animRoleWiperLight: q("#anim-role-wiper-light"),
      roleWiperShadow: q("#role-wiper-shadow"),
      animRoleWiperShadow: q("#anim-role-wiper-shadow"),
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
    if (els.borderGlow && els.animBorderGlow) {
      this._triggerSmil(els.borderGlow, els.animBorderGlow, "points", keyframes.map((k) => k.insetPoints), durSec, keyTimesStr, splineStr);
    }
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
    if (els.borderGlow && els.animBorderGlow) {
      this._setStaticSvgAttr(els.borderGlow, els.animBorderGlow, "points", boxGeom.insetPoints);
    }
  }

  _updateGradients() {
    const { primaryColor, secondaryColor, accentColor } = this._state;
    const {
      nameStop0, nameStop1, nameStop2,
      roleStop0, roleStop1, roleStop2,
      accentStop0, accentStop1, accentStop2,
      accentPulseStop0, accentPulseStop1, accentPulseStop2,
      borderGlowTint,
    } = this._els;

    nameStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    nameStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    nameStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -30));

    roleStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    roleStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    roleStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -32));

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
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_NAME);
    this._els.accentGlowPoly.setAttribute("points", parkedAccentBox.points);
    this._els.accentPulseOverlay.setAttribute("points", parkedAccentBox.points);
    try {
      this._els.animAccentGlowPulse.beginElement();
      this._els.animAccentOverlayPulse.beginElement();
      this._els.animBorderShimmerX1.beginElement();
      this._els.animBorderShimmerX2.beginElement();
      this._els.animBevelStop0.beginElement();
      this._els.animBevelStop1.beginElement();
      this._els.animNameBorderGlowPulse.beginElement();
      this._els.animRoleBorderGlowPulse.beginElement();
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
      this._els.animNameBorderGlowPulse.endElement();
      this._els.animRoleBorderGlowPulse.endElement();
    } catch (_) {}
    this._els.accentGlowPoly.setAttribute("opacity", "0");
    this._els.accentPulseOverlay.setAttribute("opacity", "0");
    this._els.nameBorderGlow.setAttribute("opacity", "0");
    this._els.roleBorderGlow.setAttribute("opacity", "0");
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

  _computeAndApplyStaticGeometry(skipBoxAttrReset = false) {
    const nameStr = (this._state.name || "").trim();
    const roleStr = (this._state.title || "").trim();
    const hasRole = roleStr.length > 0;

    this._els.nameText.textContent = nameStr;
    this._els.roleText.textContent = roleStr;
    this._els.roleLayer.style.display = hasRole ? "" : "none";

    const rawNameW = this._measureTextWidth(this._els.nameText, 21);
    const rawRoleW = hasRole ? this._measureTextWidth(this._els.roleText, 13) : 0;

    const nameX = W_ACCENT + GAP_X; // 25
    const nameY = 0;
    const nameW = Math.max(MIN_NAME_W, Math.ceil(rawNameW + PAD_NAME_X * 2));

    const roleY = H_NAME + GAP_Y;
    const roleX = nameX - GAP_Y * TAN_15 - DX_ROLE;
    const roleW = hasRole ? Math.max(MIN_ROLE_W, Math.ceil(rawRoleW + PAD_ROLE_X * 2)) : 0;

    this._layout = { nameX, nameY, nameW, roleX, roleY, roleW, hasRole };

    const nameTextX = nameX + DX_NAME * 0.5 + PAD_NAME_X;
    const nameTextY = nameY + H_NAME * 0.5;
    this._els.nameText.setAttribute("x", nameTextX.toFixed(2));
    this._els.nameText.setAttribute("y", nameTextY.toFixed(2));

    if (hasRole) {
      const roleTextX = roleX + DX_ROLE * 0.5 + PAD_ROLE_X;
      const roleTextY = roleY + H_ROLE * 0.5;
      this._els.roleText.setAttribute("x", roleTextX.toFixed(2));
      this._els.roleText.setAttribute("y", roleTextY.toFixed(2));
    }

    if (!skipBoxAttrReset) {
      const nameBox = computeSkewedBox(nameX, nameY, nameW, H_NAME);
      this._setStaticSkewedBox(
        {
          bg: this._els.nameBg,
          animBg: this._els.animNameBg,
          sheen: this._els.nameSheen,
          animSheen: this._els.animNameSheen,
          light: this._els.nameBevelLight,
          animLight: this._els.animNameBevelLight,
          shadow: this._els.nameBevelShadow,
          animShadow: this._els.animNameBevelShadow,
          borderGlow: this._els.nameBorderGlow,
          animBorderGlow: this._els.animNameBorderGlow,
        },
        nameBox
      );

      if (hasRole) {
        const roleBox = computeSkewedBox(roleX, roleY, roleW, H_ROLE);
        this._setStaticSkewedBox(
          {
            bg: this._els.roleBg,
            animBg: this._els.animRoleBg,
            sheen: this._els.roleSheen,
            animSheen: this._els.animRoleSheen,
            light: this._els.roleBevelLight,
            animLight: this._els.animRoleBevelLight,
            shadow: this._els.roleBevelShadow,
            animShadow: this._els.animRoleBevelShadow,
            borderGlow: this._els.roleBorderGlow,
            animBorderGlow: this._els.animRoleBorderGlow,
          },
          roleBox
        );
      }
    }

    const totalHeight = hasRole ? H_NAME + GAP_Y + H_ROLE : H_NAME;
    const totalRightEdge = Math.max(
      nameX + DX_NAME + nameW,
      hasRole ? roleX + DX_ROLE + roleW : 0
    );
    const rootY = 1080 - 92 - totalHeight;
    let rootX = 96;
    if (this._state.position === "bottom-center") {
      rootX = Math.max(60, Math.round((1920 - totalRightEdge) / 2));
    } else if (this._state.position === "bottom-right") {
      rootX = Math.max(60, Math.round(1920 - 96 - totalRightEdge));
    }

    this._els.rootGroup.setAttribute("transform", `translate(${rootX}, ${rootY})`);
  }

  _setMasksHidden() {
    this._stopIdlePulse();
    const { nameX, nameY, nameW, roleX, roleY, roleW } = this._layout;
    const zeroName = computeSkewedBox(nameX + nameW, nameY - 4, 0, H_NAME + 8).points;
    const zeroRole = computeSkewedBox(roleX + roleW, roleY - 4, 0, H_ROLE + 8).points;
    const startAccentBox = computeSkewedBox(nameX + nameW, 0, W_ACCENT, H_NAME);

    this._setStaticSvgAttr(this._els.nameMaskPoly, this._els.animNameMask, "points", zeroName);
    this._setStaticSvgAttr(this._els.roleMaskPoly, this._els.animRoleMask, "points", zeroRole);

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

    this._setStaticSvgAttr(this._els.nameWiperGroup, this._els.animNameWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(this._els.roleWiperGroup, this._els.animRoleWiperOpacity, "opacity", "0");
  }

  _setMasksFullyRevealed() {
    const { nameX, nameY, nameW, roleX, roleY, roleW, hasRole } = this._layout;
    const fullName = computeSkewedBox(nameX - 2, nameY - 4, nameW + 6, H_NAME + 8).points;
    const fullRole = computeSkewedBox(roleX - 2, roleY - 4, (hasRole ? roleW : 0) + 6, H_ROLE + 8).points;
    const parkedAccentBox = computeSkewedBox(0, 0, W_ACCENT, H_NAME);

    this._setStaticSvgAttr(this._els.nameMaskPoly, this._els.animNameMask, "points", fullName);
    this._setStaticSvgAttr(this._els.roleMaskPoly, this._els.animRoleMask, "points", fullRole);

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

    this._setStaticSvgAttr(this._els.nameWiperGroup, this._els.animNameWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(this._els.roleWiperGroup, this._els.animRoleWiperOpacity, "opacity", "0");
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

    if (this._isVisible) return;
    this._isVisible = true;

    const { nameX, nameY, nameW, roleX, roleY, roleW, hasRole } = this._layout;
    this._setMasksHidden();

    const durName = 0.50;
    const aStart = computeSkewedBox(nameX + nameW, nameY, W_ACCENT, H_NAME);
    const aEnd = computeSkewedBox(0, nameY, W_ACCENT, H_NAME);

    const maskRightEdge = nameX + nameW + W_ACCENT * 0.5;
    const mStartLeft = nameX + nameW + W_ACCENT * 0.5;
    const mEndLeft = W_ACCENT * 0.5;
    const mStart = computeSkewedBox(mStartLeft, nameY - 4, 0, H_NAME + 8).points;
    const mEnd = computeSkewedBox(mEndLeft, nameY - 4, maskRightEdge - mEndLeft, H_NAME + 8).points;

    this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["0", "1", "1"], durName, "0;0.06;1");
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
      durName,
      "0;1",
      EASE_OUT_SPLINE
    );
    this._triggerSmil(this._els.nameMaskPoly, this._els.animNameMask, "points", [mStart, mEnd], durName, "0;1", EASE_OUT_SPLINE);

    this._els.animNameTextSlide.setAttribute("from", "22 0");
    this._els.animNameTextSlide.setAttribute("to", "0 0");
    this._els.animNameTextSlide.setAttribute("dur", `${durName}s`);
    try {
      this._els.animNameTextSlide.beginElement();
    } catch (_) {}

    if (hasRole) {
      await this._schedule(() => {
        const durRole = 0.44;
        const roleWiperW = W_ACCENT * 0.85;
        const swStartX = roleX + roleW;
        const swEndX = roleX - roleWiperW;

        const swStart = computeSkewedBox(swStartX, roleY, roleWiperW, H_ROLE);
        const swEnd = computeSkewedBox(swEndX, roleY, roleWiperW, H_ROLE);

        const roleMaskRight = swStartX + roleWiperW * 0.5;
        const smStartLeft = swStartX + roleWiperW * 0.5;
        const smEndLeft = swEndX + roleWiperW * 0.5;
        const smStart = computeSkewedBox(smStartLeft, roleY - 4, 0, H_ROLE + 8).points;
        const smEnd = computeSkewedBox(smEndLeft, roleY - 4, roleMaskRight - smEndLeft, H_ROLE + 8).points;

        this._triggerSmil(this._els.roleWiperGroup, this._els.animRoleWiperOpacity, "opacity", ["0", "1", "1", "0"], durRole, "0;0.06;0.84;1");
        this._animateSkewedBox(
          {
            bg: this._els.roleWiperBg,
            animBg: this._els.animRoleWiperBg,
            sheen: this._els.roleWiperSheen,
            animSheen: this._els.animRoleWiperSheen,
            light: this._els.roleWiperLight,
            animLight: this._els.animRoleWiperLight,
            shadow: this._els.roleWiperShadow,
            animShadow: this._els.animRoleWiperShadow,
          },
          [swStart, swEnd],
          durRole,
          "0;1",
          EASE_OUT_SPLINE
        );
        this._triggerSmil(this._els.roleMaskPoly, this._els.animRoleMask, "points", [smStart, smEnd], durRole, "0;1", EASE_OUT_SPLINE);

        this._els.animRoleTextSlide.setAttribute("from", "18 0");
        this._els.animRoleTextSlide.setAttribute("to", "0 0");
        this._els.animRoleTextSlide.setAttribute("dur", `${durRole}s`);
        try {
          this._els.animRoleTextSlide.beginElement();
        } catch (_) {}
      }, 70);
    }

    await this._schedule(() => {
      this._setMasksFullyRevealed();
    }, hasRole ? 460 : 520);
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
    const { nameX, nameY, nameW, roleX, roleY, roleW, hasRole } = this._layout;

    if (hasRole) {
      const durRole = 0.42;
      const roleWiperW = W_ACCENT * 0.85;
      const swStartX = roleX + roleW;
      const swEndX = roleX - roleWiperW;

      const swStart = computeSkewedBox(swStartX, roleY, roleWiperW, H_ROLE);
      const swEnd = computeSkewedBox(swEndX, roleY, roleWiperW, H_ROLE);

      const roleMaskLeft = swEndX + roleWiperW * 0.5;
      const smStartRight = swStartX + roleWiperW * 0.5;
      const smEndRight = swEndX + roleWiperW * 0.5;
      const smStart = computeSkewedBox(roleMaskLeft, roleY - 4, smStartRight - roleMaskLeft, H_ROLE + 8).points;
      const smEnd = computeSkewedBox(roleMaskLeft, roleY - 4, smEndRight - roleMaskLeft, H_ROLE + 8).points;

      this._triggerSmil(this._els.roleMaskPoly, this._els.animRoleMask, "points", [smStart, smEnd], durRole, "0;1", EASE_OUT_SPLINE);
      this._triggerSmil(this._els.roleWiperGroup, this._els.animRoleWiperOpacity, "opacity", ["0", "1", "1", "0"], durRole, "0;0.06;0.84;1");
      this._animateSkewedBox(
        {
          bg: this._els.roleWiperBg,
          animBg: this._els.animRoleWiperBg,
          sheen: this._els.roleWiperSheen,
          animSheen: this._els.animRoleWiperSheen,
          light: this._els.roleWiperLight,
          animLight: this._els.animRoleWiperLight,
          shadow: this._els.roleWiperShadow,
          animShadow: this._els.animRoleWiperShadow,
        },
        [swStart, swEnd],
        durRole,
        "0;1",
        EASE_OUT_SPLINE
      );
    }

    await this._schedule(() => {
      const durName = 0.44;
      const wStart = computeSkewedBox(nameX + nameW, nameY, W_ACCENT, H_NAME);
      const wEnd = computeSkewedBox(0, nameY, W_ACCENT, H_NAME);

      const maskLeft = W_ACCENT * 0.5;
      const mStartRight = nameX + nameW + W_ACCENT * 0.5;
      const mEndRight = W_ACCENT * 0.5;
      const mStart = computeSkewedBox(maskLeft, nameY - 4, mStartRight - maskLeft, H_NAME + 8).points;
      const mEnd = computeSkewedBox(maskLeft, nameY - 4, mEndRight - maskLeft, H_NAME + 8).points;

      this._triggerSmil(this._els.nameMaskPoly, this._els.animNameMask, "points", [mStart, mEnd], durName, "0;1", EASE_OUT_SPLINE);
      this._triggerSmil(this._els.nameWiperGroup, this._els.animNameWiperOpacity, "opacity", ["0", "1", "1", "0"], durName, "0;0.06;0.88;1");
      this._animateSkewedBox(
        {
          bg: this._els.nameWiperBg,
          animBg: this._els.animNameWiperBg,
          sheen: this._els.nameWiperSheen,
          animSheen: this._els.animNameWiperSheen,
          light: this._els.nameWiperLight,
          animLight: this._els.animNameWiperLight,
          shadow: this._els.nameWiperShadow,
          animShadow: this._els.animNameWiperShadow,
        },
        [wStart, wEnd],
        durName,
        "0;1",
        EASE_OUT_SPLINE
      );

      this._triggerSmil(this._els.accentLayer, this._els.animAccentOpacity, "opacity", ["1", "1", "0"], durName, "0;0.84;1");
    }, hasRole ? 45 : 0);

    await this._schedule(() => {
      this._setMasksHidden();
      this._scene.classList.remove("visible");
    }, hasRole ? 500 : 460);
  }

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
      const { nameX, nameY, nameW, roleX, roleY, roleW, hasRole } = this._layout;

      if (!skip && (prevLayout.nameW !== nameW || prevLayout.roleW !== roleW)) {
        const prevNameBox = computeSkewedBox(nameX, nameY, prevLayout.nameW, H_NAME);
        const nextNameBox = computeSkewedBox(nameX, nameY, nameW, H_NAME);
        this._animateSkewedBox(
          {
            bg: this._els.nameBg,
            animBg: this._els.animNameBg,
            sheen: this._els.nameSheen,
            animSheen: this._els.animNameSheen,
            light: this._els.nameBevelLight,
            animLight: this._els.animNameBevelLight,
            shadow: this._els.nameBevelShadow,
            animShadow: this._els.animNameBevelShadow,
            borderGlow: this._els.nameBorderGlow,
            animBorderGlow: this._els.animNameBorderGlow,
          },
          [prevNameBox, nextNameBox],
          0.24,
          "0;1",
          EASE_OUT_SPLINE
        );

        const prevNameMask = computeSkewedBox(nameX - 2, nameY - 4, prevLayout.nameW + 6, H_NAME + 8).points;
        const nextNameMask = computeSkewedBox(nameX - 2, nameY - 4, nameW + 6, H_NAME + 8).points;
        this._triggerSmil(this._els.nameMaskPoly, this._els.animNameMask, "points", [prevNameMask, nextNameMask], 0.24, "0;1", EASE_OUT_SPLINE);

        if (hasRole) {
          const startRoleW = prevLayout.hasRole ? prevLayout.roleW : 0;
          const prevRoleBox = computeSkewedBox(roleX, roleY, startRoleW, H_ROLE);
          const nextRoleBox = computeSkewedBox(roleX, roleY, roleW, H_ROLE);
          this._animateSkewedBox(
            {
              bg: this._els.roleBg,
              animBg: this._els.animRoleBg,
              sheen: this._els.roleSheen,
              animSheen: this._els.animRoleSheen,
              light: this._els.roleBevelLight,
              animLight: this._els.animRoleBevelLight,
              shadow: this._els.roleBevelShadow,
              animShadow: this._els.animRoleBevelShadow,
              borderGlow: this._els.roleBorderGlow,
              animBorderGlow: this._els.animRoleBorderGlow,
            },
            [prevRoleBox, nextRoleBox],
            0.24,
            "0;1",
            EASE_OUT_SPLINE
          );

          const prevRoleMask = computeSkewedBox(roleX - 2, roleY - 4, startRoleW + 6, H_ROLE + 8).points;
          const nextRoleMask = computeSkewedBox(roleX - 2, roleY - 4, roleW + 6, H_ROLE + 8).points;
          this._triggerSmil(this._els.roleMaskPoly, this._els.animRoleMask, "points", [prevRoleMask, nextRoleMask], 0.24, "0;1", EASE_OUT_SPLINE);
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

export default NewsLowerThirdGraphic;
