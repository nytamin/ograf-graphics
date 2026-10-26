/**
 * News Package - Text Box Graphic (graphics/news/text-box)
 * Centered broadcast big text-box graphic with a 15-degree skewed title header on top
 * and a large 15-degree skewed multiline content box below, 2px skeuomorphic beveled borders,
 * idle accent pulse & subtle border glow, and right-to-left SVG mask + SMIL swipe animations.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_15 = Math.tan((SKEW_DEG * Math.PI) / 180); // ~0.267949192
const COS_15 = Math.cos((SKEW_DEG * Math.PI) / 180); // ~0.965925826

// Header & Body geometry in 1920x1080 SVG coordinate space
const H_HEADER = 78;
const DX_HEADER = H_HEADER * TAN_15; // ~20.90
const W_ACCENT = 24;
const GAP_X = 7;
const GAP_Y = 8;

const PAD_HEADER_X = 38;
const MIN_HEADER_W = 520;
const BASE_BODY_W = 1060;
const PAD_BODY_X = 54;
const PAD_BODY_Y = 44;
const BODY_LINE_H = 44;
const PARA_GAP = 18;
const MIN_BODY_H = 240;
const MAX_BODY_H = 680;

const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  title: "OFFICIAL STATEMENT",
  content:
    "We are closely monitoring developments across the region and coordinating with international partners to ensure full transparency and immediate response measures.\n\nFurther updates will be provided at the top of the hour.",
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

.header-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 46px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 2px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.72));
}

.body-line {
  font-family: "Barlow", "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-size: 31px;
  font-weight: 600;
  fill: #f4f7fc;
  letter-spacing: 0.4px;
  dominant-baseline: central;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.7));
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

  const sheenH = h * 0.44;
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

class NewsTextBoxGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._layout = {
      headerX: W_ACCENT + GAP_X,
      headerY: 0,
      headerW: MIN_HEADER_W,
      bodyX: 0,
      bodyY: H_HEADER + GAP_Y,
      bodyW: BASE_BODY_W,
      bodyH: MIN_BODY_H,
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
        <filter id="box-drop-shadow" x="-12%" y="-18%" width="135%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#000000" flood-opacity="0.6" />
        </filter>

        <linearGradient id="header-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="header-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="header-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="header-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="body-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="body-stop-1" offset="52%" stop-color="#162032" />
          <stop id="body-stop-2" offset="100%" stop-color="#0c121d" />
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
          <feGaussianBlur stdDeviation="9" result="blur" />
        </filter>

        <filter id="border-idle-glow" x="-15%" y="-25%" width="130%" height="150%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-350" y1="0" x2="120" y2="200">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.46" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animateTransform
            id="border-shimmer-anim"
            attributeName="gradientTransform"
            type="translate"
            from="-350 0"
            to="1250 0"
            dur="3.8s"
            repeatCount="indefinite"
            begin="indefinite"
          />
        </linearGradient>

        <linearGradient id="plate-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
        </linearGradient>

        <linearGradient id="bevel-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.62">
            <animate
              id="bevel-pulse-stop-0"
              attributeName="stop-opacity"
              values="0.58;0.78;0.58"
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
              values="0.24;0.42;0.24"
              keyTimes="0;0.5;1"
              dur="2.8s"
              repeatCount="indefinite"
              begin="indefinite"
            />
          </stop>
        </linearGradient>

        <linearGradient id="bevel-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.48" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.78" />
        </linearGradient>

        <mask id="header-reveal-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2400" height="600">
          <polygon id="header-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="header-mask-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>

        <mask id="body-reveal-mask" maskUnits="userSpaceOnUse" x="-200" y="-100" width="2400" height="1200">
          <polygon id="body-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="body-mask-anim" attributeName="points" dur="0.54s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>
      </defs>

      <!-- Hidden measurement helper -->
      <text id="measure-body-line" class="body-line" x="-9999" y="-9999" opacity="0"></text>

      <g id="textbox-root" transform="translate(420, 260)">
        <!-- MULTILINE CONTENT PANEL -->
        <g id="body-layer">
          <g id="body-masked-group" mask="url(#body-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="body-bg" fill="url(#body-grad)" />
            <polygon id="body-sheen" fill="url(#plate-sheen)" />
            <!-- Inner left quote/statement bar -->
            <polygon id="body-inner-accent" fill="url(#accent-grad)" opacity="0.88" />
            <polyline id="body-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="body-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="body-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="body-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="body-text-group">
              <animateTransform id="body-text-slide" attributeName="transform" type="translate" dur="0.54s" fill="freeze" begin="indefinite" />
              <g id="body-lines-container"></g>
            </g>
          </g>

          <g id="body-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="body-wiper-opacity" attributeName="opacity" dur="0.54s" fill="freeze" begin="indefinite" />
            <polygon id="body-wiper-bg" fill="url(#accent-grad)">
              <animate id="body-wiper-bg-anim" attributeName="points" dur="0.54s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="body-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="body-wiper-sheen-anim" attributeName="points" dur="0.54s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="body-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="body-wiper-shadow-anim" attributeName="points" dur="0.54s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="body-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="body-wiper-light-anim" attributeName="points" dur="0.54s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>

        <!-- TOP HEADER BAR -->
        <g id="header-layer">
          <g id="header-masked-group" mask="url(#header-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="header-bg" fill="url(#header-grad)" />
            <polygon id="header-sheen" fill="url(#plate-sheen)" />
            <polyline id="header-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="header-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="header-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="header-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="header-text-group">
              <animateTransform id="header-text-slide" attributeName="transform" type="translate" dur="0.48s" fill="freeze" begin="indefinite" />
              <text id="header-text" class="header-text" x="70" y="39">OFFICIAL STATEMENT</text>
            </g>
          </g>

          <!-- Out-animation accent wiper -->
          <g id="out-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="out-wiper-opacity" attributeName="opacity" dur="0.46s" fill="freeze" begin="indefinite" />
            <polygon id="out-wiper-bg" fill="url(#accent-grad)">
              <animate id="out-wiper-bg-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="out-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="out-wiper-sheen-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="out-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-shadow-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="out-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-light-anim" attributeName="points" dur="0.46s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>

          <!-- Persistent Left Accent Bar -->
          <g id="accent-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="accent-opacity" attributeName="opacity" dur="0.48s" fill="freeze" begin="indefinite" />
            <polygon id="accent-glow-poly" fill="url(#accent-pulse-grad)" filter="url(#accent-idle-glow)" opacity="0">
              <animate
                id="accent-glow-pulse"
                attributeName="opacity"
                values="0.1;0.6;0.1"
                keyTimes="0;0.5;1"
                dur="1.6s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>
            <polygon id="accent-bg" fill="url(#accent-grad)">
              <animate id="accent-bg-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="accent-pulse-overlay" fill="url(#accent-pulse-grad)" opacity="0">
              <animate
                id="accent-overlay-pulse"
                attributeName="opacity"
                values="0;0.5;0"
                keyTimes="0;0.5;1"
                dur="1.6s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>
            <polygon id="accent-sheen" fill="url(#plate-sheen)">
              <animate id="accent-sheen-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="accent-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-shadow-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="accent-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-light-anim" attributeName="points" dur="0.48s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>
      </g>
    `;

    this._els = {
      rootGroup: svg.querySelector("#textbox-root"),
      measureBodyLine: svg.querySelector("#measure-body-line"),
      headerStop0: svg.querySelector("#header-stop-0"),
      headerStop1: svg.querySelector("#header-stop-1"),
      headerStop2: svg.querySelector("#header-stop-2"),
      bodyStop0: svg.querySelector("#body-stop-0"),
      bodyStop1: svg.querySelector("#body-stop-1"),
      bodyStop2: svg.querySelector("#body-stop-2"),
      accentStop0: svg.querySelector("#accent-stop-0"),
      accentStop1: svg.querySelector("#accent-stop-1"),
      accentStop2: svg.querySelector("#accent-stop-2"),
      accentPulseStop0: svg.querySelector("#accent-pulse-stop-0"),
      accentPulseStop1: svg.querySelector("#accent-pulse-stop-1"),
      accentPulseStop2: svg.querySelector("#accent-pulse-stop-2"),

      headerMaskPoly: svg.querySelector("#header-mask-poly"),
      headerMaskAnim: svg.querySelector("#header-mask-anim"),
      headerBg: svg.querySelector("#header-bg"),
      headerSheen: svg.querySelector("#header-sheen"),
      headerBevelShadow: svg.querySelector("#header-bevel-shadow"),
      headerBevelLight: svg.querySelector("#header-bevel-light"),
      headerBorderGlow: svg.querySelector("#header-border-glow"),
      headerBorderGlowAnim: svg.querySelector("#header-border-glow-anim"),
      headerTextGroup: svg.querySelector("#header-text-group"),
      headerTextSlide: svg.querySelector("#header-text-slide"),
      headerText: svg.querySelector("#header-text"),

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

      bodyMaskPoly: svg.querySelector("#body-mask-poly"),
      bodyMaskAnim: svg.querySelector("#body-mask-anim"),
      bodyBg: svg.querySelector("#body-bg"),
      bodySheen: svg.querySelector("#body-sheen"),
      bodyInnerAccent: svg.querySelector("#body-inner-accent"),
      bodyBevelShadow: svg.querySelector("#body-bevel-shadow"),
      bodyBevelLight: svg.querySelector("#body-bevel-light"),
      bodyBorderGlow: svg.querySelector("#body-border-glow"),
      bodyBorderGlowAnim: svg.querySelector("#body-border-glow-anim"),
      bodyTextGroup: svg.querySelector("#body-text-group"),
      bodyTextSlide: svg.querySelector("#body-text-slide"),
      bodyLinesContainer: svg.querySelector("#body-lines-container"),

      bodyWiperGroup: svg.querySelector("#body-wiper-group"),
      bodyWiperOpacity: svg.querySelector("#body-wiper-opacity"),
      bodyWiperBg: svg.querySelector("#body-wiper-bg"),
      bodyWiperBgAnim: svg.querySelector("#body-wiper-bg-anim"),
      bodyWiperSheen: svg.querySelector("#body-wiper-sheen"),
      bodyWiperSheenAnim: svg.querySelector("#body-wiper-sheen-anim"),
      bodyWiperShadow: svg.querySelector("#body-wiper-shadow"),
      bodyWiperShadowAnim: svg.querySelector("#body-wiper-shadow-anim"),
      bodyWiperLight: svg.querySelector("#body-wiper-light"),
      bodyWiperLightAnim: svg.querySelector("#body-wiper-light-anim"),

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
  }

  _measureBodyStringWidth(str) {
    const el = this._els.measureBodyLine;
    el.textContent = str;
    try {
      const len = el.getComputedTextLength();
      if (len && len > 0) return len;
    } catch {
      // Fallback below
    }
    return str.length * 15.2;
  }

  _wrapMultilineText(rawText, maxLineWidth) {
    const paragraphs = String(rawText ?? "").replace(/\r\n/g, "\n").split("\n");
    const wrappedEntries = [];

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) {
        wrappedEntries.push({ type: "gap" });
        continue;
      }

      const words = trimmed.split(/\s+/);
      let currentLine = "";

      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (this._measureBodyStringWidth(candidate) <= maxLineWidth || !currentLine) {
          currentLine = candidate;
        } else {
          wrappedEntries.push({ type: "line", text: currentLine });
          currentLine = word;
        }
      }
      if (currentLine) {
        wrappedEntries.push({ type: "line", text: currentLine });
      }
    }

    // Trim leading/trailing gaps
    while (wrappedEntries.length > 0 && wrappedEntries[0].type === "gap") {
      wrappedEntries.shift();
    }
    while (wrappedEntries.length > 0 && wrappedEntries[wrappedEntries.length - 1].type === "gap") {
      wrappedEntries.pop();
    }

    if (wrappedEntries.length === 0) {
      wrappedEntries.push({ type: "line", text: "" });
    }

    return wrappedEntries;
  }

  _applyStateAndMeasure() {
    const { title, content, primaryColor, secondaryColor, accentColor } = this._state;
    const els = this._els;

    // Update gradients
    els.headerStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    els.headerStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    els.headerStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -34));

    els.bodyStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    els.bodyStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    els.bodyStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -38));

    els.accentStop0.setAttribute("stop-color", adjustHexColor(accentColor, 22));
    els.accentStop1.setAttribute("stop-color", adjustHexColor(accentColor, 0));
    els.accentStop2.setAttribute("stop-color", adjustHexColor(accentColor, -28));

    els.accentPulseStop0.setAttribute("stop-color", adjustHexColor(accentColor, 58));
    els.accentPulseStop1.setAttribute("stop-color", adjustHexColor(accentColor, 36));
    els.accentPulseStop2.setAttribute("stop-color", adjustHexColor(accentColor, 14));
    els.borderGlowTint.setAttribute("stop-color", adjustHexColor(primaryColor, 65));

    const cleanTitle = String(title ?? "").trim() || "OFFICIAL STATEMENT";
    els.headerText.textContent = cleanTitle;

    // Measure header text width
    let measuredHeaderW = 0;
    try {
      measuredHeaderW = els.headerText.getComputedTextLength();
    } catch {
      measuredHeaderW = cleanTitle.length * 24;
    }
    if (!measuredHeaderW || measuredHeaderW < 10) {
      measuredHeaderW = cleanTitle.length * 24;
    }

    const headerX = W_ACCENT + GAP_X;
    const headerY = 0;
    const headerW = Math.min(1300, Math.max(MIN_HEADER_W, Math.ceil(measuredHeaderW + PAD_HEADER_X * 2)));

    const bodyW = Math.max(BASE_BODY_W, headerW + W_ACCENT + GAP_X);
    // Estimate max usable width inside the 15-degree skewed content box
    const maxLineWidth = bodyW - PAD_BODY_X * 2 - 40;
    const entries = this._wrapMultilineText(content, maxLineWidth);

    // Compute total text block height
    let textBlockH = 0;
    for (const entry of entries) {
      textBlockH += entry.type === "gap" ? PARA_GAP : BODY_LINE_H;
    }

    const bodyH = Math.min(MAX_BODY_H, Math.max(MIN_BODY_H, Math.ceil(textBlockH + PAD_BODY_Y * 2)));
    const dxBody = bodyH * TAN_15;

    // Align the top-left of the body box with the bottom-left of the accent bar along the 15-degree slant line
    const bodyY = H_HEADER + GAP_Y;
    const bodyX = Math.round(-GAP_Y * TAN_15 - dxBody);

    this._layout = { headerX, headerY, headerW, bodyX, bodyY, bodyW, bodyH };

    // Position header text
    els.headerText.setAttribute("x", (headerX + DX_HEADER * 0.5 + PAD_HEADER_X).toFixed(1));
    els.headerText.setAttribute("y", (headerY + H_HEADER / 2).toFixed(1));

    // Render wrapped multiline text inside bodyLinesContainer
    els.bodyLinesContainer.innerHTML = "";
    const startY = bodyY + (bodyH - textBlockH) / 2 + BODY_LINE_H / 2;
    const textLeftX = bodyX + dxBody + PAD_BODY_X + 18;
    let cursorY = startY;

    for (const entry of entries) {
      if (entry.type === "gap") {
        cursorY += PARA_GAP;
        continue;
      }
      const lineEl = document.createElementNS(SVG_NS, "text");
      lineEl.setAttribute("class", "body-line");
      lineEl.setAttribute("x", textLeftX.toFixed(1));
      lineEl.setAttribute("y", cursorY.toFixed(1));
      lineEl.textContent = entry.text;
      els.bodyLinesContainer.appendChild(lineEl);
      cursorY += BODY_LINE_H;
    }

    // Inner vertical statement bar (skewed parallel to the left edge of the body box)
    const innerBarTopY = bodyY + 26;
    const innerBarBotY = bodyY + bodyH - 26;
    const innerBarH = Math.max(20, innerBarBotY - innerBarTopY);
    const innerBarX = bodyX + (bodyY + bodyH - innerBarBotY) * TAN_15 + 26;
    const innerBarGeom = computeSkewedBox(innerBarX, innerBarTopY, 6, innerBarH);
    els.bodyInnerAccent.setAttribute("points", innerBarGeom.points);

    // Apply static geometry for Header & Body boxes
    const headerGeom = computeSkewedBox(headerX, headerY, headerW, H_HEADER);
    this._applyBoxGeometry(
      els.headerBg,
      els.headerSheen,
      els.headerBevelShadow,
      els.headerBevelLight,
      headerGeom,
      els.headerBorderGlow
    );

    const bodyGeom = computeSkewedBox(bodyX, bodyY, bodyW, bodyH);
    this._applyBoxGeometry(
      els.bodyBg,
      els.bodySheen,
      els.bodyBevelShadow,
      els.bodyBevelLight,
      bodyGeom,
      els.bodyBorderGlow
    );

    const parkedAccentGeom = computeSkewedBox(0, headerY, W_ACCENT, H_HEADER);
    els.accentGlowPoly.setAttribute("points", parkedAccentGeom.points);
    els.accentPulseOverlay.setAttribute("points", parkedAccentGeom.points);

    // Center the entire graphic on the 1920x1080 canvas
    const minVisualX = Math.min(0, bodyX);
    const maxVisualX = Math.max(headerX + headerW + DX_HEADER, bodyX + bodyW + dxBody);
    const visualW = maxVisualX - minVisualX;
    const totalH = H_HEADER + GAP_Y + bodyH;

    const baseX = Math.round((1920 - visualW) / 2 - minVisualX);
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

    const { headerX, headerY, headerW, bodyX, bodyY, bodyW, bodyH } = this._layout;
    const els = this._els;

    const emptyHeaderMask = computeSkewedBox(headerX + headerW, headerY, 0, H_HEADER).points;
    this._setStaticSvgAttr(els.headerMaskPoly, els.headerMaskAnim, "points", emptyHeaderMask);

    const emptyBodyMask = computeSkewedBox(bodyX + bodyW, bodyY, 0, bodyH).points;
    this._setStaticSvgAttr(els.bodyMaskPoly, els.bodyMaskAnim, "points", emptyBodyMask);

    this._setStaticSvgAttr(els.accentGroup, els.accentOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.bodyWiperGroup, els.bodyWiperOpacity, "opacity", "0");
  }

  _settleVisibleState() {
    this._clearTimers();
    this._isVisible = true;
    this._scene.classList.add("visible");

    const { headerX, headerY, headerW, bodyX, bodyY, bodyW, bodyH } = this._layout;
    const els = this._els;

    const fullHeaderMask = computeSkewedBox(headerX - 6, headerY - 6, headerW + 16, H_HEADER + 12).points;
    this._setStaticSvgAttr(els.headerMaskPoly, els.headerMaskAnim, "points", fullHeaderMask);

    const fullBodyMask = computeSkewedBox(bodyX - 6, bodyY - 6, bodyW + 16, bodyH + 12).points;
    this._setStaticSvgAttr(els.bodyMaskPoly, els.bodyMaskAnim, "points", fullBodyMask);

    const accentGeom = computeSkewedBox(0, headerY, W_ACCENT, H_HEADER);
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
    this._setStaticSvgAttr(els.bodyWiperGroup, els.bodyWiperOpacity, "opacity", "0");

    els.headerTextSlide.removeAttribute("values");
    els.headerTextGroup.setAttribute("transform", "translate(0 0)");
    els.bodyTextSlide.removeAttribute("values");
    els.bodyTextGroup.setAttribute("transform", "translate(0 0)");

    this._startIdlePulse();
  }

  _startIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.beginElement();
      els.accentOverlayPulse.beginElement();
      els.headerBorderGlowAnim.beginElement();
      els.bodyBorderGlowAnim.beginElement();
      els.borderShimmerAnim.beginElement();
      els.bevelPulseStop0.beginElement();
      els.bevelPulseStop1.beginElement();
    } catch {
      els.accentGlowPoly.setAttribute("opacity", "0.35");
      els.accentPulseOverlay.setAttribute("opacity", "0.25");
      els.headerBorderGlow.setAttribute("opacity", "0.32");
      els.bodyBorderGlow.setAttribute("opacity", "0.32");
    }
  }

  _stopIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.endElement();
      els.accentOverlayPulse.endElement();
      els.headerBorderGlowAnim.endElement();
      els.bodyBorderGlowAnim.endElement();
      els.borderShimmerAnim.endElement();
      els.bevelPulseStop0.endElement();
      els.bevelPulseStop1.endElement();
    } catch {
      // Ignore if SMIL not active
    }
    els.accentGlowPoly.setAttribute("opacity", "0");
    els.accentPulseOverlay.setAttribute("opacity", "0");
    els.headerBorderGlow.setAttribute("opacity", "0");
    els.bodyBorderGlow.setAttribute("opacity", "0");
  }

  _animateIn(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation) {
      this._settleVisibleState();
      return;
    }

    this._isVisible = true;
    this._scene.classList.add("visible");

    const { headerX, headerY, headerW, bodyX, bodyY, bodyW, bodyH } = this._layout;
    const els = this._els;

    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");

    const emptyBodyMask = computeSkewedBox(bodyX + bodyW, bodyY, 0, bodyH).points;
    this._setStaticSvgAttr(els.bodyMaskPoly, els.bodyMaskAnim, "points", emptyBodyMask);
    this._setStaticSvgAttr(els.bodyWiperGroup, els.bodyWiperOpacity, "opacity", "0");

    // 1. Header Bar + Accent Bar Swipe (right -> left)
    const accentStartR = computeSkewedBox(headerX + headerW, headerY, 0, H_HEADER);
    const accentFinalL = computeSkewedBox(0, headerY, W_ACCENT, H_HEADER);

    this._triggerSmil(els.accentOpacity, {
      values: "0;1;1",
      keyTimes: "0;0.1;1",
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
      [accentStartR, accentFinalL],
      "0;1",
      "0.48s",
      EASE_OUT_SPLINE
    );

    const headerMask0 = computeSkewedBox(headerX + headerW, headerY - 4, 0, H_HEADER + 8).points;
    const headerMask1 = computeSkewedBox(headerX - 6, headerY - 4, headerW + 14, H_HEADER + 8).points;

    this._triggerSmil(els.headerMaskAnim, {
      values: `${headerMask0}; ${headerMask1}`,
      keyTimes: "0;1",
      dur: "0.48s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    this._triggerSmil(els.headerTextSlide, {
      values: "38 0; 0 0",
      keyTimes: "0;1",
      dur: "0.48s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    const pulseTimer = setTimeout(() => {
      if (this._isVisible) {
        this._startIdlePulse();
      }
    }, 490);
    this._timers.push(pulseTimer);

    // 2. Content Box Swipe (staggered by 100ms)
    const bodyTimer = setTimeout(() => {
      const wBodyWiper = 24;
      const bw0 = computeSkewedBox(bodyX + bodyW, bodyY, wBodyWiper, bodyH);
      const bw1 = computeSkewedBox(bodyX - wBodyWiper, bodyY, 0, bodyH);

      this._triggerSmil(els.bodyWiperOpacity, {
        values: "0;1;1;0",
        keyTimes: "0;0.08;0.88;1",
        dur: "0.54s",
        calcMode: "linear",
      });

      this._animateSkewedBox(
        {
          bg: els.bodyWiperBgAnim,
          sheen: els.bodyWiperSheenAnim,
          shadow: els.bodyWiperShadowAnim,
          light: els.bodyWiperLightAnim,
        },
        [bw0, bw1],
        "0;1",
        "0.54s",
        EASE_OUT_SPLINE
      );

      const bodyMask0 = computeSkewedBox(bodyX + bodyW, bodyY - 4, 0, bodyH + 8).points;
      const bodyMask1 = computeSkewedBox(bodyX - 6, bodyY - 4, bodyW + 14, bodyH + 8).points;

      this._triggerSmil(els.bodyMaskAnim, {
        values: `${bodyMask0}; ${bodyMask1}`,
        keyTimes: "0;1",
        dur: "0.54s",
        calcMode: "spline",
        keySplines: EASE_OUT_SPLINE,
      });

      this._triggerSmil(els.bodyTextSlide, {
        values: "42 0; 0 0",
        keyTimes: "0;1",
        dur: "0.54s",
        calcMode: "spline",
        keySplines: EASE_OUT_SPLINE,
      });
    }, 100);

    this._timers.push(bodyTimer);
  }

  _animateOut(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation) {
      this._resetToHidden();
      return Promise.resolve();
    }

    const { headerX, headerY, headerW, bodyX, bodyY, bodyW, bodyH } = this._layout;
    const els = this._els;

    return new Promise((resolve) => {
      // 1. Swipe Content Box Out (right -> left)
      const wBodyWiper = 24;
      const bw0 = computeSkewedBox(bodyX + bodyW, bodyY, wBodyWiper, bodyH);
      const bw1 = computeSkewedBox(bodyX - wBodyWiper, bodyY, 0, bodyH);

      this._triggerSmil(els.bodyWiperOpacity, {
        values: "0;1;1;0",
        keyTimes: "0;0.08;0.88;1",
        dur: "0.46s",
        calcMode: "linear",
      });

      this._animateSkewedBox(
        {
          bg: els.bodyWiperBgAnim,
          sheen: els.bodyWiperSheenAnim,
          shadow: els.bodyWiperShadowAnim,
          light: els.bodyWiperLightAnim,
        },
        [bw0, bw1],
        "0;1",
        "0.46s",
        EASE_OUT_SPLINE
      );

      const bodyMaskFull = computeSkewedBox(bodyX - 6, bodyY - 4, bodyW + 14, bodyH + 8).points;
      const bodyMaskEmptyL = computeSkewedBox(bodyX, bodyY - 4, 0, bodyH + 8).points;

      this._triggerSmil(els.bodyMaskAnim, {
        values: `${bodyMaskFull}; ${bodyMaskEmptyL}`,
        keyTimes: "0;1",
        dur: "0.46s",
        calcMode: "spline",
        keySplines: EASE_OUT_SPLINE,
      });

      this._triggerSmil(els.bodyTextSlide, {
        values: "0 0; -34 0",
        keyTimes: "0;1",
        dur: "0.46s",
        calcMode: "spline",
        keySplines: EASE_OUT_SPLINE,
      });

      // 2. Swipe Header Bar Out (staggered by 80ms)
      const headerOutDelay = 80;
      const headerTimer = setTimeout(() => {
        const outW0 = computeSkewedBox(headerX + headerW, headerY, W_ACCENT, H_HEADER);
        const outW1 = computeSkewedBox(0, headerY, 0, H_HEADER);

        this._triggerSmil(els.outWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.9;1",
          dur: "0.46s",
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
          "0.46s",
          EASE_OUT_SPLINE
        );

        const parkedAccent = computeSkewedBox(0, headerY, W_ACCENT, H_HEADER);
        const collapsedAccent = computeSkewedBox(0, headerY, 0, H_HEADER);

        this._triggerSmil(els.accentOpacity, {
          values: "1;1;0",
          keyTimes: "0;0.76;1",
          dur: "0.46s",
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
          "0.46s",
          `0 0 1 1; ${EASE_OUT_SPLINE}`
        );

        const headerMaskFull = computeSkewedBox(headerX - 6, headerY - 4, headerW + 14, H_HEADER + 8).points;
        const headerMaskEmptyL = computeSkewedBox(headerX, headerY - 4, 0, H_HEADER + 8).points;

        this._triggerSmil(els.headerMaskAnim, {
          values: `${headerMaskFull}; ${headerMaskEmptyL}`,
          keyTimes: "0;1",
          dur: "0.46s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.headerTextSlide, {
          values: "0 0; -30 0",
          keyTimes: "0;1",
          dur: "0.46s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }, headerOutDelay);

      const doneTimer = setTimeout(() => {
        this._resetToHidden();
        resolve();
      }, headerOutDelay + 470);

      this._timers.push(headerTimer, doneTimer);
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

export default NewsTextBoxGraphic;
