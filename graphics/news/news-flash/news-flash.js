/**
 * News Package - News Flash Graphic (graphics/news/news-flash)
 * Big, centered broadcast news-flash banner with title and optional subtitle,
 * adaptive font scaling & multi-line text wrapping for long texts,
 * 15-degree skewed gradient boxes, 2px skeuomorphic beveled borders, idle accent
 * pulse & subtle border glow, right-to-left SVG mask + SMIL swipe animations,
 * and optional automatic out-animation after a configurable hold duration.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_15 = Math.tan((SKEW_DEG * Math.PI) / 180); // ~0.267949192
const COS_15 = Math.cos((SKEW_DEG * Math.PI) / 180); // ~0.965925826

// Base centered News-Flash geometry in 1920x1080 SVG coordinate space
const MIN_H_MAIN = 124;
const W_ACCENT = 30;
const GAP_X = 8;
const GAP_Y = 8;
const MIN_H_SUB = 58;

const PAD_MAIN_X = 64;
const PAD_MAIN_Y = 28;
const PAD_SUB_X = 46;
const PAD_SUB_Y = 14;
const MIN_MAIN_W = 680;
const MAX_MAIN_W = 1520;
const MIN_SUB_W = 480;
const MAX_SUB_W = 1480;

const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  title: "BREAKING NEWS",
  subtitle: "DEVELOPING STORY • LIVE COVERAGE",
  autoOut: false,
  holdDuration: 4,
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

.main-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 78px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 3.2px;
  text-transform: uppercase;
  dominant-baseline: central;
  text-anchor: middle;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.72));
}

.sub-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 31px;
  font-weight: 700;
  fill: #f2f6fc;
  letter-spacing: 2.6px;
  text-transform: uppercase;
  dominant-baseline: central;
  text-anchor: middle;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.75));
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

class NewsFlashGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._autoOutTimer = null;
    this._layout = {
      mainX: W_ACCENT + GAP_X,
      mainY: 0,
      mainW: MIN_MAIN_W,
      mainH: MIN_H_MAIN,
      subX: 0,
      subY: MIN_H_MAIN + GAP_Y,
      subW: MIN_SUB_W,
      subH: MIN_H_SUB,
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
        <filter id="box-drop-shadow" x="-15%" y="-25%" width="140%" height="175%">
          <feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#000000" flood-opacity="0.62" />
        </filter>

        <linearGradient id="main-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="main-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="main-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="main-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <linearGradient id="sub-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="sub-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="sub-stop-1" offset="52%" stop-color="#162032" />
          <stop id="sub-stop-2" offset="100%" stop-color="#0c121d" />
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
          <feGaussianBlur stdDeviation="10" result="blur" />
        </filter>

        <filter id="border-idle-glow" x="-15%" y="-35%" width="130%" height="170%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-350" y1="0" x2="120" y2="140">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.48" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animateTransform
            id="border-shimmer-anim"
            attributeName="gradientTransform"
            type="translate"
            from="-350 0"
            to="1450 0"
            dur="3.6s"
            repeatCount="indefinite"
            begin="indefinite"
          />
        </linearGradient>

        <linearGradient id="plate-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
        </linearGradient>

        <linearGradient id="bevel-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.64">
            <animate
              id="bevel-pulse-stop-0"
              attributeName="stop-opacity"
              values="0.58;0.80;0.58"
              keyTimes="0;0.5;1"
              dur="2.8s"
              repeatCount="indefinite"
              begin="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.28">
            <animate
              id="bevel-pulse-stop-1"
              attributeName="stop-opacity"
              values="0.24;0.44;0.24"
              keyTimes="0;0.5;1"
              dur="2.8s"
              repeatCount="indefinite"
              begin="indefinite"
            />
          </stop>
        </linearGradient>

        <linearGradient id="bevel-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.48" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.80" />
        </linearGradient>

        <mask id="main-reveal-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="1000">
          <polygon id="main-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="main-mask-anim" attributeName="points" dur="0.52s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>

        <mask id="sub-reveal-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="1000">
          <polygon id="sub-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="sub-mask-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>
      </defs>

      <!-- Hidden measurement helpers -->
      <text id="measure-main" class="main-text" x="-9999" y="-9999" opacity="0"></text>
      <text id="measure-sub" class="sub-text" x="-9999" y="-9999" opacity="0"></text>

      <g id="flash-root" transform="translate(500, 440)">
        <!-- SUBTITLE LAYER -->
        <g id="sub-layer">
          <g id="sub-masked-group" mask="url(#sub-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="sub-bg" fill="url(#sub-grad)" />
            <polygon id="sub-sheen" fill="url(#plate-sheen)" />
            <polyline id="sub-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="sub-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="sub-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="sub-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="sub-text-group">
              <animateTransform id="sub-text-slide" attributeName="transform" type="translate" dur="0.46s" fill="freeze" begin="indefinite" />
              <g id="sub-lines-container"></g>
            </g>
          </g>

          <g id="sub-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="sub-wiper-opacity" attributeName="opacity" dur="0.46s" fill="freeze" begin="indefinite" />
            <polygon id="sub-wiper-bg" fill="url(#accent-grad)">
              <animate id="sub-wiper-bg-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="sub-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="sub-wiper-sheen-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="sub-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="sub-wiper-shadow-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="sub-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="sub-wiper-light-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>

        <!-- MAIN FLASH LAYER -->
        <g id="main-layer">
          <g id="main-masked-group" mask="url(#main-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="main-bg" fill="url(#main-grad)" />
            <polygon id="main-sheen" fill="url(#plate-sheen)" />
            <polyline id="main-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="main-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="main-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="main-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="main-text-group">
              <animateTransform id="main-text-slide" attributeName="transform" type="translate" dur="0.52s" fill="freeze" begin="indefinite" />
              <g id="main-lines-container"></g>
            </g>
          </g>

          <!-- Out-animation accent wiper -->
          <g id="out-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="out-wiper-opacity" attributeName="opacity" dur="0.48s" fill="freeze" begin="indefinite" />
            <polygon id="out-wiper-bg" fill="url(#accent-grad)">
              <animate id="out-wiper-bg-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="out-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="out-wiper-sheen-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="out-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-shadow-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="out-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-light-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>

          <!-- Persistent Left Accent Bar -->
          <g id="accent-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="accent-opacity" attributeName="opacity" dur="0.52s" fill="freeze" begin="indefinite" />
            <polygon id="accent-glow-poly" fill="url(#accent-pulse-grad)" filter="url(#accent-idle-glow)" opacity="0">
              <animate
                id="accent-glow-pulse"
                attributeName="opacity"
                values="0.12;0.65;0.12"
                keyTimes="0;0.5;1"
                dur="1.5s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>
            <polygon id="accent-bg" fill="url(#accent-grad)">
              <animate id="accent-bg-anim" attributeName="points" dur="0.52s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="accent-pulse-overlay" fill="url(#accent-pulse-grad)" opacity="0">
              <animate
                id="accent-overlay-pulse"
                attributeName="opacity"
                values="0;0.55;0"
                keyTimes="0;0.5;1"
                dur="1.5s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>
            <polygon id="accent-sheen" fill="url(#plate-sheen)">
              <animate id="accent-sheen-anim" attributeName="points" dur="0.52s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="accent-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-shadow-anim" attributeName="points" dur="0.52s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="accent-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-light-anim" attributeName="points" dur="0.52s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>
      </g>
    `;

    this._els = {
      rootGroup: svg.querySelector("#flash-root"),
      measureMain: svg.querySelector("#measure-main"),
      measureSub: svg.querySelector("#measure-sub"),

      mainStop0: svg.querySelector("#main-stop-0"),
      mainStop1: svg.querySelector("#main-stop-1"),
      mainStop2: svg.querySelector("#main-stop-2"),
      subStop0: svg.querySelector("#sub-stop-0"),
      subStop1: svg.querySelector("#sub-stop-1"),
      subStop2: svg.querySelector("#sub-stop-2"),
      accentStop0: svg.querySelector("#accent-stop-0"),
      accentStop1: svg.querySelector("#accent-stop-1"),
      accentStop2: svg.querySelector("#accent-stop-2"),
      accentPulseStop0: svg.querySelector("#accent-pulse-stop-0"),
      accentPulseStop1: svg.querySelector("#accent-pulse-stop-1"),
      accentPulseStop2: svg.querySelector("#accent-pulse-stop-2"),

      mainMaskPoly: svg.querySelector("#main-mask-poly"),
      mainMaskAnim: svg.querySelector("#main-mask-anim"),
      mainBg: svg.querySelector("#main-bg"),
      mainSheen: svg.querySelector("#main-sheen"),
      mainBevelShadow: svg.querySelector("#main-bevel-shadow"),
      mainBevelLight: svg.querySelector("#main-bevel-light"),
      mainBorderGlow: svg.querySelector("#main-border-glow"),
      mainBorderGlowAnim: svg.querySelector("#main-border-glow-anim"),
      mainTextGroup: svg.querySelector("#main-text-group"),
      mainTextSlide: svg.querySelector("#main-text-slide"),
      mainLinesContainer: svg.querySelector("#main-lines-container"),

      outWiperGroup: svg.querySelector("#out-wiper-group"),
      outWiperOpacity: svg.querySelector("#out-wiper-opacity"),
      outWiperBg: svg.querySelector("#out-wiper-bg"),
      outWiperBgAnim: svg.querySelector("#out-wiper-bg-anim"),
      outWiperSheen: svg.querySelector("#out-wiper-sheen"),
      outWiperSheenAnim: svg.querySelector("#out-wiper-sheen-anim"),
      outWiperShadow: svg.querySelector("#out-wiper-shadow"),
      outWiperShadowAnim: svg.querySelector("#out-wiper-shadow-anim"),
      outWiperLight: svg.querySelector("#out-wiper-light"),
      outWiperLightAnim: svg.querySelector("#out-wiper-light-anim"),

      accentGroup: svg.querySelector("#accent-group"),
      accentOpacity: svg.querySelector("#accent-opacity"),
      accentGlowPoly: svg.querySelector("#accent-glow-poly"),
      accentGlowPulse: svg.querySelector("#accent-glow-pulse"),
      accentBg: svg.querySelector("#accent-bg"),
      accentBgAnim: svg.querySelector("#accent-bg-anim"),
      accentPulseOverlay: svg.querySelector("#accent-pulse-overlay"),
      accentOverlayPulse: svg.querySelector("#accent-overlay-pulse"),
      accentSheen: svg.querySelector("#accent-sheen"),
      accentSheenAnim: svg.querySelector("#accent-sheen-anim"),
      accentShadow: svg.querySelector("#accent-shadow"),
      accentShadowAnim: svg.querySelector("#accent-shadow-anim"),
      accentLight: svg.querySelector("#accent-light"),
      accentLightAnim: svg.querySelector("#accent-light-anim"),

      subLayer: svg.querySelector("#sub-layer"),
      subMaskPoly: svg.querySelector("#sub-mask-poly"),
      subMaskAnim: svg.querySelector("#sub-mask-anim"),
      subBg: svg.querySelector("#sub-bg"),
      subSheen: svg.querySelector("#sub-sheen"),
      subBevelShadow: svg.querySelector("#sub-bevel-shadow"),
      subBevelLight: svg.querySelector("#sub-bevel-light"),
      subBorderGlow: svg.querySelector("#sub-border-glow"),
      subBorderGlowAnim: svg.querySelector("#sub-border-glow-anim"),
      subTextGroup: svg.querySelector("#sub-text-group"),
      subTextSlide: svg.querySelector("#sub-text-slide"),
      subLinesContainer: svg.querySelector("#sub-lines-container"),

      subWiperGroup: svg.querySelector("#sub-wiper-group"),
      subWiperOpacity: svg.querySelector("#sub-wiper-opacity"),
      subWiperBg: svg.querySelector("#sub-wiper-bg"),
      subWiperBgAnim: svg.querySelector("#sub-wiper-bg-anim"),
      subWiperSheen: svg.querySelector("#sub-wiper-sheen"),
      subWiperSheenAnim: svg.querySelector("#sub-wiper-sheen-anim"),
      subWiperShadow: svg.querySelector("#sub-wiper-shadow"),
      subWiperShadowAnim: svg.querySelector("#sub-wiper-shadow-anim"),
      subWiperLight: svg.querySelector("#sub-wiper-light"),
      subWiperLightAnim: svg.querySelector("#sub-wiper-light-anim"),

      borderGlowTint: svg.querySelector("#border-glow-tint"),
      borderShimmerAnim: svg.querySelector("#border-shimmer-anim"),
      bevelPulseStop0: svg.querySelector("#bevel-pulse-stop-0"),
      bevelPulseStop1: svg.querySelector("#bevel-pulse-stop-1"),
    };

    return svg;
  }

  async load(params) {
    if (params?.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyStateAndMeasure();
    this._resetToHidden();
    return { statusCode: 200 };
  }

  async dispose() {
    this._clearTimers();
    this._scene.remove();
    return { statusCode: 200 };
  }

  async playAction(params) {
    const targetStep = this._resolveTargetStep(params);
    const skipAnimation = params?.skipAnimation === true;

    if (params?.data) {
      this._state = { ...this._state, ...params.data };
    }

    this._applyStateAndMeasure();

    if (!this._isVisible) {
      this._animateIn(skipAnimation);
    } else {
      this._settleVisibleState();
      this._scheduleAutoOutIfNeeded(0);
    }

    this._currentStep = targetStep;
    return {
      statusCode: 200,
      currentStep: this._currentStep,
    };
  }

  async stopAction(params) {
    const skipAnimation = params?.skipAnimation === true;
    if (this._isVisible) {
      await this._animateOut(skipAnimation);
    } else {
      this._resetToHidden();
    }
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    if (params?.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyStateAndMeasure();
    if (this._isVisible) {
      this._settleVisibleState();
      this._scheduleAutoOutIfNeeded(0);
    }
    return { statusCode: 200 };
  }

  async customAction() {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    const t = Number(params?.time || 0);
    if (this._svg && typeof this._svg.setCurrentTime === "function") {
      this._svg.setCurrentTime(t / 1000);
    }
    return { statusCode: 200 };
  }

  async setActionsSchedule() {
    return { statusCode: 200 };
  }

  _resolveTargetStep(params) {
    const stepCount = 1;
    const goto = params?.goto;
    const delta = typeof params?.delta === "number" ? params.delta : 1;

    if (typeof goto === "number") {
      return goto >= stepCount ? undefined : Math.max(0, goto);
    }
    const current = typeof this._currentStep === "number" ? this._currentStep : -1;
    const next = current + delta;
    return next >= stepCount ? undefined : Math.max(0, next);
  }

  _clearTimers() {
    for (const timer of this._timers) {
      clearTimeout(timer);
    }
    this._timers = [];
    if (this._autoOutTimer) {
      clearTimeout(this._autoOutTimer);
      this._autoOutTimer = null;
    }
  }

  _scheduleAutoOutIfNeeded(inAnimDurationMs) {
    if (this._autoOutTimer) {
      clearTimeout(this._autoOutTimer);
      this._autoOutTimer = null;
    }
    if (!this._state.autoOut) return;

    const holdSec = Math.max(0.5, Number(this._state.holdDuration) || 4);
    const delayMs = inAnimDurationMs + holdSec * 1000;
    this._autoOutTimer = setTimeout(() => {
      this._autoOutTimer = null;
      if (this._isVisible) {
        this._currentStep = undefined;
        this._animateOut(false);
      }
    }, delayMs);
  }

  _measureTextWidth(measureEl, text, fontSize, letterSpacing) {
    measureEl.style.fontSize = `${fontSize}px`;
    measureEl.style.letterSpacing = `${letterSpacing}px`;
    measureEl.textContent = text;
    try {
      const len = measureEl.getComputedTextLength();
      if (len && len > 0) return len;
    } catch {
      // Fallback below
    }
    return text.length * (fontSize * 0.54 + letterSpacing);
  }

  _wrapParagraphWords(words, measureEl, fontSize, letterSpacing, maxLineW) {
    const lines = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const w = this._measureTextWidth(measureEl, candidate, fontSize, letterSpacing);
      if (w <= maxLineW || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /**
   * Fits text by scaling font size down for medium texts and wrapping into balanced
   * multiple lines for long texts.
   */
  _fitAndWrapText(rawText, measureEl, config) {
    const {
      maxFontSize,
      minSingleLineFontSize,
      wrapFontSizes,
      baseLetterSpacing,
      maxTextW,
      minTextW,
    } = config;

    const paragraphs = String(rawText ?? "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return {
        lines: [""],
        fontSize: maxFontSize,
        letterSpacing: baseLetterSpacing,
        lineHeight: Math.round(maxFontSize * 1.15),
        maxLineW: minTextW,
      };
    }

    // 1. If there are no explicit line breaks, try fitting on a single line first
    if (paragraphs.length === 1) {
      const singleText = paragraphs[0];
      const wAtMax = this._measureTextWidth(measureEl, singleText, maxFontSize, baseLetterSpacing);
      if (wAtMax <= maxTextW) {
        return {
          lines: [singleText],
          fontSize: maxFontSize,
          letterSpacing: baseLetterSpacing,
          lineHeight: Math.round(maxFontSize * 1.15),
          maxLineW: wAtMax,
        };
      }

      // Try scaling down single-line font size down to minSingleLineFontSize
      const wAtMinSingle = this._measureTextWidth(
        measureEl,
        singleText,
        minSingleLineFontSize,
        baseLetterSpacing * (minSingleLineFontSize / maxFontSize)
      );
      if (wAtMinSingle <= maxTextW) {
        const ratio = maxTextW / wAtMax;
        const scaledFont = Math.max(
          minSingleLineFontSize,
          Math.floor(maxFontSize * ratio)
        );
        const scaledSpacing = Number((baseLetterSpacing * (scaledFont / maxFontSize)).toFixed(2));
        const finalW = this._measureTextWidth(measureEl, singleText, scaledFont, scaledSpacing);
        return {
          lines: [singleText],
          fontSize: scaledFont,
          letterSpacing: scaledSpacing,
          lineHeight: Math.round(scaledFont * 1.15),
          maxLineW: finalW,
        };
      }
    }

    // 2. Multi-line wrapping across candidate font sizes
    for (let i = 0; i < wrapFontSizes.length; i++) {
      const { size, maxLines } = wrapFontSizes[i];
      const letterSpacing = Number((baseLetterSpacing * (size / maxFontSize)).toFixed(2));
      const allLines = [];

      for (const para of paragraphs) {
        const words = para.split(/\s+/).filter(Boolean);
        const fullParaW = this._measureTextWidth(measureEl, para, size, letterSpacing);

        // Balance line widths so we don't get 1 very wide line and 1 tiny orphan word
        const estLines = Math.max(1, Math.ceil(fullParaW / maxTextW));
        const balancedTargetW =
          estLines > 1
            ? Math.min(maxTextW, Math.max(minTextW, (fullParaW / estLines) * 1.18))
            : maxTextW;

        let wrapped = this._wrapParagraphWords(words, measureEl, size, letterSpacing, balancedTargetW);
        // If balancing caused an extra line beyond estLines, fall back to full maxTextW
        if (wrapped.length > estLines) {
          wrapped = this._wrapParagraphWords(words, measureEl, size, letterSpacing, maxTextW);
        }
        allLines.push(...wrapped);
      }

      const widestLine = Math.max(
        ...allLines.map((line) => this._measureTextWidth(measureEl, line, size, letterSpacing)),
        minTextW
      );

      const isLastCandidate = i === wrapFontSizes.length - 1;
      if ((allLines.length <= maxLines && widestLine <= maxTextW) || isLastCandidate) {
        return {
          lines: allLines,
          fontSize: size,
          letterSpacing,
          lineHeight: Math.round(size * 1.16),
          maxLineW: Math.min(maxTextW, widestLine),
        };
      }
    }

    return {
      lines: [paragraphs.join(" ")],
      fontSize: maxFontSize,
      letterSpacing: baseLetterSpacing,
      lineHeight: Math.round(maxFontSize * 1.15),
      maxLineW: maxTextW,
    };
  }

  _applyStateAndMeasure() {
    const { title, subtitle, primaryColor, secondaryColor, accentColor } = this._state;
    const els = this._els;

    // Update gradients
    els.mainStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    els.mainStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    els.mainStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -34));

    els.subStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    els.subStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    els.subStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -38));

    els.accentStop0.setAttribute("stop-color", adjustHexColor(accentColor, 22));
    els.accentStop1.setAttribute("stop-color", adjustHexColor(accentColor, 0));
    els.accentStop2.setAttribute("stop-color", adjustHexColor(accentColor, -28));

    els.accentPulseStop0.setAttribute("stop-color", adjustHexColor(accentColor, 58));
    els.accentPulseStop1.setAttribute("stop-color", adjustHexColor(accentColor, 36));
    els.accentPulseStop2.setAttribute("stop-color", adjustHexColor(accentColor, 14));
    els.borderGlowTint.setAttribute("stop-color", adjustHexColor(primaryColor, 65));

    const cleanTitle = String(title ?? "").trim() || "BREAKING NEWS";
    const cleanSub = String(subtitle ?? "").trim();
    const hasSubtitle = cleanSub.length > 0;

    els.subLayer.style.display = hasSubtitle ? "inline" : "none";

    // Fit & wrap main title
    const maxMainTextW = MAX_MAIN_W - PAD_MAIN_X * 2;
    const mainFit = this._fitAndWrapText(cleanTitle, els.measureMain, {
      maxFontSize: 78,
      minSingleLineFontSize: 54,
      wrapFontSizes: [
        { size: 58, maxLines: 2 },
        { size: 50, maxLines: 2 },
        { size: 44, maxLines: 3 },
        { size: 38, maxLines: 4 },
        { size: 32, maxLines: 6 },
      ],
      baseLetterSpacing: 3.2,
      maxTextW: maxMainTextW,
      minTextW: MIN_MAIN_W - PAD_MAIN_X * 2,
    });

    const mainX = W_ACCENT + GAP_X;
    const mainY = 0;
    const mainW = Math.min(
      MAX_MAIN_W,
      Math.max(MIN_MAIN_W, Math.ceil(mainFit.maxLineW + PAD_MAIN_X * 2))
    );
    const mainTextBlockH = mainFit.lines.length * mainFit.lineHeight;
    const mainH =
      mainFit.lines.length === 1
        ? MIN_H_MAIN
        : Math.max(MIN_H_MAIN, Math.ceil(mainTextBlockH + PAD_MAIN_Y * 2));
    const dxMain = mainH * TAN_15;

    // Render main title lines centered along the 15-degree skewed box centerline
    els.mainLinesContainer.innerHTML = "";
    const mainStartY = mainY + (mainH - mainTextBlockH) / 2 + mainFit.lineHeight / 2;
    for (let i = 0; i < mainFit.lines.length; i++) {
      const lineY = mainStartY + i * mainFit.lineHeight;
      // Horizontal center of the 15-degree skewed box at vertical coordinate lineY
      const lineCenterX = mainX + (mainY + mainH - lineY) * TAN_15 + mainW / 2;
      const tEl = document.createElementNS(SVG_NS, "text");
      tEl.setAttribute("class", "main-text");
      tEl.style.fontSize = `${mainFit.fontSize}px`;
      tEl.style.letterSpacing = `${mainFit.letterSpacing}px`;
      tEl.setAttribute("x", lineCenterX.toFixed(1));
      tEl.setAttribute("y", lineY.toFixed(1));
      tEl.textContent = mainFit.lines[i];
      els.mainLinesContainer.appendChild(tEl);
    }

    // Fit & wrap subtitle
    let subX = 0;
    const subY = mainH + GAP_Y;
    let subW = MIN_SUB_W;
    let subH = MIN_H_SUB;

    if (hasSubtitle) {
      const maxSubTextW = MAX_SUB_W - PAD_SUB_X * 2;
      const subFit = this._fitAndWrapText(cleanSub, els.measureSub, {
        maxFontSize: 31,
        minSingleLineFontSize: 23,
        wrapFontSizes: [
          { size: 26, maxLines: 2 },
          { size: 22, maxLines: 3 },
          { size: 19, maxLines: 4 },
        ],
        baseLetterSpacing: 2.6,
        maxTextW: maxSubTextW,
        minTextW: MIN_SUB_W - PAD_SUB_X * 2,
      });

      const minProportionalSubW = Math.min(mainW * 0.9, Math.max(MIN_SUB_W, mainW * 0.65));
      subW = Math.min(
        MAX_SUB_W,
        Math.max(minProportionalSubW, Math.ceil(subFit.maxLineW + PAD_SUB_X * 2))
      );
      const subTextBlockH = subFit.lines.length * subFit.lineHeight;
      subH =
        subFit.lines.length === 1
          ? MIN_H_SUB
          : Math.max(MIN_H_SUB, Math.ceil(subTextBlockH + PAD_SUB_Y * 2));
      const dxSub = subH * TAN_15;

      const mainVisualCenter = mainX + (mainW + dxMain) / 2;
      subX = Math.round(mainVisualCenter - (subW + dxSub) / 2);

      els.subLinesContainer.innerHTML = "";
      const subStartY = subY + (subH - subTextBlockH) / 2 + subFit.lineHeight / 2;
      for (let i = 0; i < subFit.lines.length; i++) {
        const lineY = subStartY + i * subFit.lineHeight;
        const lineCenterX = subX + (subY + subH - lineY) * TAN_15 + subW / 2;
        const sEl = document.createElementNS(SVG_NS, "text");
        sEl.setAttribute("class", "sub-text");
        sEl.style.fontSize = `${subFit.fontSize}px`;
        sEl.style.letterSpacing = `${subFit.letterSpacing}px`;
        sEl.setAttribute("x", lineCenterX.toFixed(1));
        sEl.setAttribute("y", lineY.toFixed(1));
        sEl.textContent = subFit.lines[i];
        els.subLinesContainer.appendChild(sEl);
      }
    } else {
      els.subLinesContainer.innerHTML = "";
    }

    this._layout = { mainX, mainY, mainW, mainH, subX, subY, subW, subH, hasSubtitle };

    // Apply static geometry for boxes
    const mainGeom = computeSkewedBox(mainX, mainY, mainW, mainH);
    this._applyBoxGeometry(
      els.mainBg,
      els.mainSheen,
      els.mainBevelShadow,
      els.mainBevelLight,
      mainGeom,
      els.mainBorderGlow
    );

    const subGeom = computeSkewedBox(subX, subY, subW, subH);
    this._applyBoxGeometry(
      els.subBg,
      els.subSheen,
      els.subBevelShadow,
      els.subBevelLight,
      subGeom,
      els.subBorderGlow
    );

    const parkedAccentGeom = computeSkewedBox(0, mainY, W_ACCENT, mainH);
    els.accentGlowPoly.setAttribute("points", parkedAccentGeom.points);
    els.accentPulseOverlay.setAttribute("points", parkedAccentGeom.points);

    // Center the entire graphic on the 1920x1080 canvas
    const minVisualX = hasSubtitle ? Math.min(0, subX) : 0;
    const maxVisualX = hasSubtitle
      ? Math.max(mainX + mainW + dxMain, subX + subW + subH * TAN_15)
      : mainX + mainW + dxMain;
    const totalW = maxVisualX - minVisualX;
    const totalH = hasSubtitle ? mainH + GAP_Y + subH : mainH;
    const baseX = Math.round((1920 - totalW) / 2 - minVisualX);
    const baseY = Math.round((1080 - totalH) / 2);
    els.rootGroup.setAttribute("transform", `translate(${baseX}, ${baseY})`);
  }

  _applyBoxGeometry(bgEl, sheenEl, shadowEl, lightEl, geom, borderGlowEl) {
    bgEl.setAttribute("points", geom.points);
    sheenEl.setAttribute("points", geom.sheenPoints);
    shadowEl.setAttribute("points", geom.shadowBevel);
    lightEl.setAttribute("points", geom.lightBevel);
    if (borderGlowEl && geom.insetPoints) {
      borderGlowEl.setAttribute("points", geom.insetPoints);
    }
  }

  _resetToHidden() {
    this._clearTimers();
    this._stopIdlePulse();
    this._isVisible = false;
    this._scene.classList.remove("visible");

    const { mainX, mainY, mainW, mainH, subX, subY, subW, subH } = this._layout;
    const els = this._els;

    const emptyMainMask = computeSkewedBox(mainX + mainW, mainY, 0, mainH).points;
    this._setStaticSvgAttr(els.mainMaskPoly, els.mainMaskAnim, "points", emptyMainMask);

    const emptySubMask = computeSkewedBox(subX + subW, subY, 0, subH).points;
    this._setStaticSvgAttr(els.subMaskPoly, els.subMaskAnim, "points", emptySubMask);

    this._setStaticSvgAttr(els.accentGroup, els.accentOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.subWiperGroup, els.subWiperOpacity, "opacity", "0");
  }

  _settleVisibleState() {
    this._clearTimers();
    this._isVisible = true;
    this._scene.classList.add("visible");

    const { mainX, mainY, mainW, mainH, subX, subY, subW, subH, hasSubtitle } = this._layout;
    const els = this._els;

    const fullMainMask = computeSkewedBox(mainX - 6, mainY - 6, mainW + 16, mainH + 12).points;
    this._setStaticSvgAttr(els.mainMaskPoly, els.mainMaskAnim, "points", fullMainMask);

    const fullSubMask = computeSkewedBox(subX - 6, subY - 6, subW + 16, subH + 12).points;
    this._setStaticSvgAttr(els.subMaskPoly, els.subMaskAnim, "points", fullSubMask);

    const accentGeom = computeSkewedBox(0, mainY, W_ACCENT, mainH);
    this._setStaticSkewedBox(
      {
        bg: els.accentBg,
        bgAnim: els.accentBgAnim,
        sheen: els.accentSheen,
        sheenAnim: els.accentSheenAnim,
        shadow: els.accentShadow,
        shadowAnim: els.accentShadowAnim,
        light: els.accentLight,
        lightAnim: els.accentLightAnim,
      },
      accentGeom
    );
    this._setStaticSvgAttr(els.accentGroup, els.accentOpacity, "opacity", "1");
    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.subWiperGroup, els.subWiperOpacity, "opacity", "0");

    els.mainTextSlide.removeAttribute("values");
    els.mainTextGroup.setAttribute("transform", "translate(0 0)");
    if (hasSubtitle) {
      els.subTextSlide.removeAttribute("values");
      els.subTextGroup.setAttribute("transform", "translate(0 0)");
    }

    this._startIdlePulse();
  }

  _startIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.beginElement();
      els.accentOverlayPulse.beginElement();
      els.mainBorderGlowAnim.beginElement();
      els.subBorderGlowAnim.beginElement();
      els.borderShimmerAnim.beginElement();
      els.bevelPulseStop0.beginElement();
      els.bevelPulseStop1.beginElement();
    } catch {
      els.accentGlowPoly.setAttribute("opacity", "0.38");
      els.accentPulseOverlay.setAttribute("opacity", "0.28");
      els.mainBorderGlow.setAttribute("opacity", "0.32");
      els.subBorderGlow.setAttribute("opacity", "0.32");
    }
  }

  _stopIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.endElement();
      els.accentOverlayPulse.endElement();
      els.mainBorderGlowAnim.endElement();
      els.subBorderGlowAnim.endElement();
      els.borderShimmerAnim.endElement();
      els.bevelPulseStop0.endElement();
      els.bevelPulseStop1.endElement();
    } catch {
      // Ignore if SMIL not active
    }
    els.accentGlowPoly.setAttribute("opacity", "0");
    els.accentPulseOverlay.setAttribute("opacity", "0");
    els.mainBorderGlow.setAttribute("opacity", "0");
    els.subBorderGlow.setAttribute("opacity", "0");
  }

  _animateIn(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation) {
      this._settleVisibleState();
      this._scheduleAutoOutIfNeeded(0);
      return;
    }

    this._isVisible = true;
    this._scene.classList.add("visible");

    const { mainX, mainY, mainW, mainH, subX, subY, subW, subH, hasSubtitle } = this._layout;
    const els = this._els;

    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");

    const emptySubMask = computeSkewedBox(subX + subW, subY, 0, subH).points;
    this._setStaticSvgAttr(els.subMaskPoly, els.subMaskAnim, "points", emptySubMask);
    this._setStaticSvgAttr(els.subWiperGroup, els.subWiperOpacity, "opacity", "0");

    // 1. Primary Flash Bar + Accent Bar Swipe (right -> left)
    const accentStartR = computeSkewedBox(mainX + mainW, mainY, 0, mainH);
    const accentFinalL = computeSkewedBox(0, mainY, W_ACCENT, mainH);

    this._triggerSmil(els.accentOpacity, {
      values: "0;1;1",
      keyTimes: "0;0.1;1",
      dur: "0.52s",
      calcMode: "linear",
    });

    this._animateSkewedBox(
      {
        bg: els.accentBgAnim,
        sheen: els.accentSheenAnim,
        shadow: els.accentShadowAnim,
        light: els.accentLightAnim,
      },
      [accentStartR, accentFinalL],
      "0;1",
      "0.52s",
      EASE_OUT_SPLINE
    );

    const mainMask0 = computeSkewedBox(mainX + mainW, mainY - 4, 0, mainH + 8).points;
    const mainMask1 = computeSkewedBox(mainX - 6, mainY - 4, mainW + 14, mainH + 8).points;

    this._triggerSmil(els.mainMaskAnim, {
      values: `${mainMask0}; ${mainMask1}`,
      keyTimes: "0;1",
      dur: "0.52s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    this._triggerSmil(els.mainTextSlide, {
      values: "48 0; 0 0",
      keyTimes: "0;1",
      dur: "0.52s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    const pulseTimer = setTimeout(() => {
      if (this._isVisible) {
        this._startIdlePulse();
      }
    }, 530);
    this._timers.push(pulseTimer);

    // 2. Subtitle Bar Swipe (staggered by 110ms)
    if (hasSubtitle) {
      const subTimer = setTimeout(() => {
        const wSub = 20;
        const sw0 = computeSkewedBox(subX + subW, subY, wSub, subH);
        const sw1 = computeSkewedBox(subX - wSub, subY, 0, subH);

        this._triggerSmil(els.subWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.88;1",
          dur: "0.46s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.subWiperBgAnim,
            sheen: els.subWiperSheenAnim,
            shadow: els.subWiperShadowAnim,
            light: els.subWiperLightAnim,
          },
          [sw0, sw1],
          "0;1",
          "0.46s",
          EASE_OUT_SPLINE
        );

        const subMask0 = computeSkewedBox(subX + subW, subY - 4, 0, subH + 8).points;
        const subMask1 = computeSkewedBox(subX - 6, subY - 4, subW + 14, subH + 8).points;

        this._triggerSmil(els.subMaskAnim, {
          values: `${subMask0}; ${subMask1}`,
          keyTimes: "0;1",
          dur: "0.46s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.subTextSlide, {
          values: "34 0; 0 0",
          keyTimes: "0;1",
          dur: "0.46s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }, 110);

      this._timers.push(subTimer);
    }

    // Schedule auto-out if enabled
    this._scheduleAutoOutIfNeeded(hasSubtitle ? 580 : 520);
  }

  _animateOut(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation) {
      this._resetToHidden();
      return Promise.resolve();
    }

    const { mainX, mainY, mainW, mainH, subX, subY, subW, subH, hasSubtitle } = this._layout;
    const els = this._els;

    return new Promise((resolve) => {
      if (hasSubtitle) {
        const wSub = 20;
        const sw0 = computeSkewedBox(subX + subW, subY, wSub, subH);
        const sw1 = computeSkewedBox(subX - wSub, subY, 0, subH);

        this._triggerSmil(els.subWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.88;1",
          dur: "0.4s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.subWiperBgAnim,
            sheen: els.subWiperSheenAnim,
            shadow: els.subWiperShadowAnim,
            light: els.subWiperLightAnim,
          },
          [sw0, sw1],
          "0;1",
          "0.4s",
          EASE_OUT_SPLINE
        );

        const subMaskFull = computeSkewedBox(subX - 6, subY - 4, subW + 14, subH + 8).points;
        const subMaskEmptyL = computeSkewedBox(subX, subY - 4, 0, subH + 8).points;

        this._triggerSmil(els.subMaskAnim, {
          values: `${subMaskFull}; ${subMaskEmptyL}`,
          keyTimes: "0;1",
          dur: "0.4s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.subTextSlide, {
          values: "0 0; -26 0",
          keyTimes: "0;1",
          dur: "0.4s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }

      const mainOutDelay = hasSubtitle ? 70 : 0;
      const mainTimer = setTimeout(() => {
        const outW0 = computeSkewedBox(mainX + mainW, mainY, W_ACCENT, mainH);
        const outW1 = computeSkewedBox(0, mainY, 0, mainH);

        this._triggerSmil(els.outWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.9;1",
          dur: "0.48s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.outWiperBgAnim,
            sheen: els.outWiperSheenAnim,
            shadow: els.outWiperShadowAnim,
            light: els.outWiperLightAnim,
          },
          [outW0, outW1],
          "0;1",
          "0.48s",
          EASE_OUT_SPLINE
        );

        const parkedAccent = computeSkewedBox(0, mainY, W_ACCENT, mainH);
        const collapsedAccent = computeSkewedBox(0, mainY, 0, mainH);

        this._triggerSmil(els.accentOpacity, {
          values: "1;1;0",
          keyTimes: "0;0.76;1",
          dur: "0.48s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.accentBgAnim,
            sheen: els.accentSheenAnim,
            shadow: els.accentShadowAnim,
            light: els.accentLightAnim,
          },
          [parkedAccent, parkedAccent, collapsedAccent],
          "0;0.74;1",
          "0.48s",
          `0 0 1 1; ${EASE_OUT_SPLINE}`
        );

        const mainMaskFull = computeSkewedBox(mainX - 6, mainY - 4, mainW + 14, mainH + 8).points;
        const mainMaskEmptyL = computeSkewedBox(mainX, mainY - 4, 0, mainH + 8).points;

        this._triggerSmil(els.mainMaskAnim, {
          values: `${mainMaskFull}; ${mainMaskEmptyL}`,
          keyTimes: "0;1",
          dur: "0.48s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.mainTextSlide, {
          values: "0 0; -36 0",
          keyTimes: "0;1",
          dur: "0.48s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }, mainOutDelay);

      const doneTimer = setTimeout(() => {
        this._resetToHidden();
        resolve();
      }, mainOutDelay + 490);

      this._timers.push(mainTimer, doneTimer);
    });
  }

  _setStaticSvgAttr(targetEl, animEl, attrName, value) {
    if (animEl) {
      animEl.removeAttribute("values");
      animEl.removeAttribute("from");
      animEl.removeAttribute("to");
    }
    targetEl.setAttribute(attrName, value);
  }

  _setStaticSkewedBox(refs, geom) {
    this._setStaticSvgAttr(refs.bg, refs.bgAnim, "points", geom.points);
    this._setStaticSvgAttr(refs.sheen, refs.sheenAnim, "points", geom.sheenPoints);
    this._setStaticSvgAttr(refs.shadow, refs.shadowAnim, "points", geom.shadowBevel);
    this._setStaticSvgAttr(refs.light, refs.lightAnim, "points", geom.lightBevel);
  }

  _animateSkewedBox(animRefs, geomFrames, keyTimes, dur, keySplines) {
    const pointsValues = geomFrames.map((g) => g.points).join("; ");
    const sheenValues = geomFrames.map((g) => g.sheenPoints).join("; ");
    const shadowValues = geomFrames.map((g) => g.shadowBevel).join("; ");
    const lightValues = geomFrames.map((g) => g.lightBevel).join("; ");

    const common = {
      keyTimes,
      dur,
      calcMode: "spline",
      keySplines,
    };

    this._triggerSmil(animRefs.bg, { ...common, values: pointsValues });
    this._triggerSmil(animRefs.sheen, { ...common, values: sheenValues });
    this._triggerSmil(animRefs.shadow, { ...common, values: shadowValues });
    this._triggerSmil(animRefs.light, { ...common, values: lightValues });
  }

  _triggerSmil(animEl, attrs) {
    if (!animEl) return;
    for (const [k, v] of Object.entries(attrs)) {
      animEl.setAttribute(k, v);
    }
    try {
      animEl.beginElement();
    } catch {
      // Fallback if beginElement is unavailable
    }
  }
}

export default NewsFlashGraphic;
