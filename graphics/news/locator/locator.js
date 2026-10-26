/**
 * News Package - Locator Graphic (graphics/news/locator)
 * Top-left / top-right broadcast location & title indicator with 15-degree skewed
 * gradient boxes, 2px skeuomorphic beveled borders, location pin icon, idle accent
 * pulse & subtle border glow, and right-to-left SVG mask + SMIL swipe animations.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SKEW_DEG = 15;
const TAN_15 = Math.tan((SKEW_DEG * Math.PI) / 180); // ~0.267949192
const COS_15 = Math.cos((SKEW_DEG * Math.PI) / 180); // ~0.965925826

// Top-corner locator geometry in 1920x1080 SVG coordinate space
const H_LOC = 52;
const DX_LOC = H_LOC * TAN_15; // ~13.93
const W_ACCENT = 16;
const GAP_X = 4;
const GAP_Y = 4;
const H_TITLE = 36;
const DX_TITLE = H_TITLE * TAN_15; // ~9.65

const PAD_LOC_LEFT = 46; // Room for location pin icon + spacing
const PAD_LOC_RIGHT = 26;
const PAD_TITLE_X = 22;
const MIN_LOC_W = 240;
const MIN_TITLE_W = 190;

const EASE_OUT_SPLINE = "0.08 0.82 0.17 1";

const DEFAULT_STATE = {
  location: "STOCKHOLM, SWEDEN",
  title: "LIVE COVERAGE",
  position: "top-left",
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

.loc-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 29px;
  font-weight: 800;
  fill: #ffffff;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  dominant-baseline: central;
  filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.7));
}

.title-text {
  font-family: "Barlow Condensed", "Oswald", "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif;
  font-size: 19px;
  font-weight: 700;
  fill: #f0f5fc;
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

class NewsLocatorGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._isVisible = false;
    this._timers = [];
    this._layout = {
      locX: W_ACCENT + GAP_X,
      locY: 0,
      locW: MIN_LOC_W,
      titleX: 0,
      titleY: H_LOC + GAP_Y,
      titleW: MIN_TITLE_W,
      hasTitle: true,
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
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.55" />
        </filter>

        <linearGradient id="loc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="loc-stop-0" offset="0%" stop-color="#1b4388" />
          <stop id="loc-stop-1" offset="50%" stop-color="#0f2b5b" />
          <stop id="loc-stop-2" offset="100%" stop-color="#081938" />
        </linearGradient>

        <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop id="title-stop-0" offset="0%" stop-color="#24344f" />
          <stop id="title-stop-1" offset="52%" stop-color="#162032" />
          <stop id="title-stop-2" offset="100%" stop-color="#0c121d" />
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
          <feGaussianBlur stdDeviation="7" result="blur" />
        </filter>

        <filter id="border-idle-glow" x="-15%" y="-35%" width="130%" height="170%">
          <feGaussianBlur stdDeviation="2.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="border-shimmer-grad" gradientUnits="userSpaceOnUse" x1="-220" y1="0" x2="60" y2="80">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop id="border-glow-tint" offset="50%" stop-color="#b3d4ff" stop-opacity="0.46" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
          <animateTransform
            id="border-shimmer-anim"
            attributeName="gradientTransform"
            type="translate"
            from="-220 0"
            to="680 0"
            dur="3.4s"
            repeatCount="indefinite"
            begin="indefinite"
          />
        </linearGradient>

        <linearGradient id="plate-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
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

        <mask id="loc-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="2200" height="500">
          <polygon id="loc-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="loc-mask-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>

        <mask id="title-reveal-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="2200" height="500">
          <polygon id="title-mask-poly" fill="#ffffff" points="0,0 0,0 0,0 0,0">
            <animate id="title-mask-anim" attributeName="points" dur="0.38s" fill="freeze" begin="indefinite" />
          </polygon>
        </mask>
      </defs>

      <g id="locator-root" transform="translate(84, 64)">
        <!-- SECONDARY TITLE BAR -->
        <g id="title-layer">
          <g id="title-masked-group" mask="url(#title-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="title-bg" fill="url(#title-grad)" />
            <polygon id="title-sheen" fill="url(#plate-sheen)" />
            <polyline id="title-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="title-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="title-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="title-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="title-text-group">
              <animateTransform id="title-text-slide" attributeName="transform" type="translate" dur="0.38s" fill="freeze" begin="indefinite" />
              <text id="title-text" class="title-text" x="30" y="18">LIVE COVERAGE</text>
            </g>
          </g>

          <g id="title-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="title-wiper-opacity" attributeName="opacity" dur="0.38s" fill="freeze" begin="indefinite" />
            <polygon id="title-wiper-bg" fill="url(#accent-grad)">
              <animate id="title-wiper-bg-anim" attributeName="points" dur="0.38s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="title-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="title-wiper-sheen-anim" attributeName="points" dur="0.38s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="title-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="title-wiper-shadow-anim" attributeName="points" dur="0.38s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="title-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="title-wiper-light-anim" attributeName="points" dur="0.38s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>

        <!-- PRIMARY LOCATION BAR -->
        <g id="loc-layer">
          <g id="loc-masked-group" mask="url(#loc-reveal-mask)" filter="url(#box-drop-shadow)">
            <polygon id="loc-bg" fill="url(#loc-grad)" />
            <polygon id="loc-sheen" fill="url(#plate-sheen)" />
            <polyline id="loc-bevel-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polyline id="loc-bevel-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" />
            <polygon id="loc-border-glow" fill="none" stroke="url(#border-shimmer-grad)" stroke-width="2" stroke-linejoin="miter" filter="url(#border-idle-glow)" opacity="0">
              <animate
                id="loc-border-glow-anim"
                attributeName="opacity"
                values="0.18;0.44;0.18"
                keyTimes="0;0.5;1"
                dur="2.8s"
                repeatCount="indefinite"
                begin="indefinite"
              />
            </polygon>

            <g id="loc-text-group">
              <animateTransform id="loc-text-slide" attributeName="transform" type="translate" dur="0.42s" fill="freeze" begin="indefinite" />
              <!-- Vector location pin icon -->
              <g id="loc-pin-icon" transform="translate(40, 14)">
                <path
                  id="loc-pin-path"
                  d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12.25c-1.8 0-3.25-1.45-3.25-3.25S7.2 5.75 9 5.75s3.25 1.45 3.25 3.25-1.45 3.25-3.25 3.25z"
                  fill="#ff5252"
                />
              </g>
              <text id="loc-text" class="loc-text" x="72" y="26">STOCKHOLM, SWEDEN</text>
            </g>
          </g>

          <!-- Out-animation accent wiper -->
          <g id="out-wiper-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="out-wiper-opacity" attributeName="opacity" dur="0.42s" fill="freeze" begin="indefinite" />
            <polygon id="out-wiper-bg" fill="url(#accent-grad)">
              <animate id="out-wiper-bg-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polygon>
            <polygon id="out-wiper-sheen" fill="url(#plate-sheen)">
              <animate id="out-wiper-sheen-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="out-wiper-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-shadow-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="out-wiper-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="out-wiper-light-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>

          <!-- Persistent Left Accent Bar -->
          <g id="accent-group" opacity="0" filter="url(#box-drop-shadow)">
            <animate id="accent-opacity" attributeName="opacity" dur="0.42s" fill="freeze" begin="indefinite" />
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
              <animate id="accent-bg-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
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
              <animate id="accent-sheen-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polygon>
            <polyline id="accent-shadow" fill="none" stroke="url(#bevel-shadow)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-shadow-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polyline>
            <polyline id="accent-light" fill="none" stroke="url(#bevel-light)" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <animate id="accent-light-anim" attributeName="points" dur="0.42s" fill="freeze" begin="indefinite" />
            </polyline>
          </g>
        </g>
      </g>
    `;

    this._els = {
      rootGroup: svg.querySelector("#locator-root"),
      locStop0: svg.querySelector("#loc-stop-0"),
      locStop1: svg.querySelector("#loc-stop-1"),
      locStop2: svg.querySelector("#loc-stop-2"),
      titleStop0: svg.querySelector("#title-stop-0"),
      titleStop1: svg.querySelector("#title-stop-1"),
      titleStop2: svg.querySelector("#title-stop-2"),
      accentStop0: svg.querySelector("#accent-stop-0"),
      accentStop1: svg.querySelector("#accent-stop-1"),
      accentStop2: svg.querySelector("#accent-stop-2"),
      accentPulseStop0: svg.querySelector("#accent-pulse-stop-0"),
      accentPulseStop1: svg.querySelector("#accent-pulse-stop-1"),
      accentPulseStop2: svg.querySelector("#accent-pulse-stop-2"),

      locMaskPoly: svg.querySelector("#loc-mask-poly"),
      locMaskAnim: svg.querySelector("#loc-mask-anim"),
      locBg: svg.querySelector("#loc-bg"),
      locSheen: svg.querySelector("#loc-sheen"),
      locBevelShadow: svg.querySelector("#loc-bevel-shadow"),
      locBevelLight: svg.querySelector("#loc-bevel-light"),
      locBorderGlow: svg.querySelector("#loc-border-glow"),
      locBorderGlowAnim: svg.querySelector("#loc-border-glow-anim"),
      locTextGroup: svg.querySelector("#loc-text-group"),
      locTextSlide: svg.querySelector("#loc-text-slide"),
      locPinIcon: svg.querySelector("#loc-pin-icon"),
      locPinPath: svg.querySelector("#loc-pin-path"),
      locText: svg.querySelector("#loc-text"),

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

      titleLayer: svg.querySelector("#title-layer"),
      titleMaskPoly: svg.querySelector("#title-mask-poly"),
      titleMaskAnim: svg.querySelector("#title-mask-anim"),
      titleBg: svg.querySelector("#title-bg"),
      titleSheen: svg.querySelector("#title-sheen"),
      titleBevelShadow: svg.querySelector("#title-bevel-shadow"),
      titleBevelLight: svg.querySelector("#title-bevel-light"),
      titleBorderGlow: svg.querySelector("#title-border-glow"),
      titleBorderGlowAnim: svg.querySelector("#title-border-glow-anim"),
      titleTextGroup: svg.querySelector("#title-text-group"),
      titleTextSlide: svg.querySelector("#title-text-slide"),
      titleText: svg.querySelector("#title-text"),

      titleWiperGroup: svg.querySelector("#title-wiper-group"),
      titleWiperOpacity: svg.querySelector("#title-wiper-opacity"),
      titleWiperBg: svg.querySelector("#title-wiper-bg"),
      titleWiperBgAnim: svg.querySelector("#title-wiper-bg-anim"),
      titleWiperSheen: svg.querySelector("#title-wiper-sheen"),
      titleWiperSheenAnim: svg.querySelector("#title-wiper-sheen-anim"),
      titleWiperShadow: svg.querySelector("#title-wiper-shadow"),
      titleWiperShadowAnim: svg.querySelector("#title-wiper-shadow-anim"),
      titleWiperLight: svg.querySelector("#title-wiper-light"),
      titleWiperLightAnim: svg.querySelector("#title-wiper-light-anim"),

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

  _applyStateAndMeasure() {
    const { location, title, primaryColor, secondaryColor, accentColor, position } = this._state;
    const els = this._els;

    // Update gradients
    els.locStop0.setAttribute("stop-color", adjustHexColor(primaryColor, 20));
    els.locStop1.setAttribute("stop-color", adjustHexColor(primaryColor, 0));
    els.locStop2.setAttribute("stop-color", adjustHexColor(primaryColor, -34));

    els.titleStop0.setAttribute("stop-color", adjustHexColor(secondaryColor, 18));
    els.titleStop1.setAttribute("stop-color", adjustHexColor(secondaryColor, 0));
    els.titleStop2.setAttribute("stop-color", adjustHexColor(secondaryColor, -38));

    els.accentStop0.setAttribute("stop-color", adjustHexColor(accentColor, 22));
    els.accentStop1.setAttribute("stop-color", adjustHexColor(accentColor, 0));
    els.accentStop2.setAttribute("stop-color", adjustHexColor(accentColor, -28));

    els.accentPulseStop0.setAttribute("stop-color", adjustHexColor(accentColor, 58));
    els.accentPulseStop1.setAttribute("stop-color", adjustHexColor(accentColor, 36));
    els.accentPulseStop2.setAttribute("stop-color", adjustHexColor(accentColor, 14));
    els.borderGlowTint.setAttribute("stop-color", adjustHexColor(primaryColor, 65));
    els.locPinPath.setAttribute("fill", adjustHexColor(accentColor, 28));

    const cleanLoc = String(location ?? "").trim() || "LIVE";
    const cleanTitle = String(title ?? "").trim();
    const hasTitle = cleanTitle.length > 0;

    els.locText.textContent = cleanLoc;
    els.titleText.textContent = cleanTitle;
    els.titleLayer.style.display = hasTitle ? "inline" : "none";

    // Measure text widths
    let measuredLocW = 0;
    let measuredTitleW = 0;
    try {
      measuredLocW = els.locText.getComputedTextLength();
      if (hasTitle) {
        measuredTitleW = els.titleText.getComputedTextLength();
      }
    } catch {
      measuredLocW = cleanLoc.length * 16.5;
      measuredTitleW = cleanTitle.length * 11.5;
    }

    if (!measuredLocW || measuredLocW < 10) {
      measuredLocW = cleanLoc.length * 16.5;
    }
    if (hasTitle && (!measuredTitleW || measuredTitleW < 10)) {
      measuredTitleW = cleanTitle.length * 11.5;
    }

    const locX = W_ACCENT + GAP_X;
    const locY = 0;
    const locW = Math.min(820, Math.max(MIN_LOC_W, Math.ceil(measuredLocW + PAD_LOC_LEFT + PAD_LOC_RIGHT)));

    // Align title box with the slant line below the location box
    const titleY = H_LOC + GAP_Y;
    const titleX = locX - GAP_Y * TAN_15 - DX_TITLE;
    const minProportionalTitleW = Math.min(locW * 0.85, Math.max(MIN_TITLE_W, locW * 0.58));
    const titleW = Math.min(
      820,
      Math.max(minProportionalTitleW, Math.ceil(measuredTitleW + PAD_TITLE_X * 2))
    );

    this._layout = { locX, locY, locW, titleX, titleY, titleW, hasTitle };

    // Position pin icon & text
    const pinX = Math.round(locX + DX_LOC * 0.5 + 16);
    const pinY = Math.round(locY + (H_LOC - 24) / 2);
    els.locPinIcon.setAttribute("transform", `translate(${pinX}, ${pinY})`);
    els.locText.setAttribute("x", (pinX + 26).toFixed(1));
    els.locText.setAttribute("y", (locY + H_LOC / 2).toFixed(1));

    els.titleText.setAttribute("x", (titleX + DX_TITLE * 0.5 + PAD_TITLE_X).toFixed(1));
    els.titleText.setAttribute("y", (titleY + H_TITLE / 2).toFixed(1));

    // Apply static geometry for boxes
    const locGeom = computeSkewedBox(locX, locY, locW, H_LOC);
    this._applyBoxGeometry(
      els.locBg,
      els.locSheen,
      els.locBevelShadow,
      els.locBevelLight,
      locGeom,
      els.locBorderGlow
    );

    const titleGeom = computeSkewedBox(titleX, titleY, titleW, H_TITLE);
    this._applyBoxGeometry(
      els.titleBg,
      els.titleSheen,
      els.titleBevelShadow,
      els.titleBevelLight,
      titleGeom,
      els.titleBorderGlow
    );

    const parkedAccentGeom = computeSkewedBox(0, locY, W_ACCENT, H_LOC);
    els.accentGlowPoly.setAttribute("points", parkedAccentGeom.points);
    els.accentPulseOverlay.setAttribute("points", parkedAccentGeom.points);

    // Top-left or Top-right placement
    const totalW = Math.max(locX + locW + DX_LOC, hasTitle ? titleX + titleW + DX_TITLE : 0);
    const baseY = 64;
    let baseX = 84;
    if (position === "top-right") {
      baseX = Math.max(84, Math.round(1920 - 84 - totalW));
    }
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

    const { locX, locY, locW, titleX, titleY, titleW } = this._layout;
    const els = this._els;

    const emptyLocMask = computeSkewedBox(locX + locW, locY, 0, H_LOC).points;
    this._setStaticSvgAttr(els.locMaskPoly, els.locMaskAnim, "points", emptyLocMask);

    const emptyTitleMask = computeSkewedBox(titleX + titleW, titleY, 0, H_TITLE).points;
    this._setStaticSvgAttr(els.titleMaskPoly, els.titleMaskAnim, "points", emptyTitleMask);

    this._setStaticSvgAttr(els.accentGroup, els.accentOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");
    this._setStaticSvgAttr(els.titleWiperGroup, els.titleWiperOpacity, "opacity", "0");
  }

  _settleVisibleState() {
    this._clearTimers();
    this._isVisible = true;
    this._scene.classList.add("visible");

    const { locX, locY, locW, titleX, titleY, titleW, hasTitle } = this._layout;
    const els = this._els;

    const fullLocMask = computeSkewedBox(locX - 4, locY - 4, locW + 12, H_LOC + 8).points;
    this._setStaticSvgAttr(els.locMaskPoly, els.locMaskAnim, "points", fullLocMask);

    const fullTitleMask = computeSkewedBox(titleX - 4, titleY - 4, titleW + 12, H_TITLE + 8).points;
    this._setStaticSvgAttr(els.titleMaskPoly, els.titleMaskAnim, "points", fullTitleMask);

    const accentGeom = computeSkewedBox(0, locY, W_ACCENT, H_LOC);
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
    this._setStaticSvgAttr(els.titleWiperGroup, els.titleWiperOpacity, "opacity", "0");

    els.locTextSlide.removeAttribute("values");
    els.locTextGroup.setAttribute("transform", "translate(0 0)");
    if (hasTitle) {
      els.titleTextSlide.removeAttribute("values");
      els.titleTextGroup.setAttribute("transform", "translate(0 0)");
    }

    this._startIdlePulse();
  }

  _startIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.beginElement();
      els.accentOverlayPulse.beginElement();
      els.locBorderGlowAnim.beginElement();
      els.titleBorderGlowAnim.beginElement();
      els.borderShimmerAnim.beginElement();
      els.bevelPulseStop0.beginElement();
      els.bevelPulseStop1.beginElement();
    } catch {
      els.accentGlowPoly.setAttribute("opacity", "0.35");
      els.accentPulseOverlay.setAttribute("opacity", "0.25");
      els.locBorderGlow.setAttribute("opacity", "0.32");
      els.titleBorderGlow.setAttribute("opacity", "0.32");
    }
  }

  _stopIdlePulse() {
    const els = this._els;
    try {
      els.accentGlowPulse.endElement();
      els.accentOverlayPulse.endElement();
      els.locBorderGlowAnim.endElement();
      els.titleBorderGlowAnim.endElement();
      els.borderShimmerAnim.endElement();
      els.bevelPulseStop0.endElement();
      els.bevelPulseStop1.endElement();
    } catch {
      // Ignore if SMIL not active
    }
    els.accentGlowPoly.setAttribute("opacity", "0");
    els.accentPulseOverlay.setAttribute("opacity", "0");
    els.locBorderGlow.setAttribute("opacity", "0");
    els.titleBorderGlow.setAttribute("opacity", "0");
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

    const { locX, locY, locW, titleX, titleY, titleW, hasTitle } = this._layout;
    const els = this._els;

    this._setStaticSvgAttr(els.outWiperGroup, els.outWiperOpacity, "opacity", "0");

    const emptyTitleMask = computeSkewedBox(titleX + titleW, titleY, 0, H_TITLE).points;
    this._setStaticSvgAttr(els.titleMaskPoly, els.titleMaskAnim, "points", emptyTitleMask);
    this._setStaticSvgAttr(els.titleWiperGroup, els.titleWiperOpacity, "opacity", "0");

    // 1. Primary Location Bar + Accent Bar Swipe (right -> left)
    const accentStartR = computeSkewedBox(locX + locW, locY, 0, H_LOC);
    const accentFinalL = computeSkewedBox(0, locY, W_ACCENT, H_LOC);

    this._triggerSmil(els.accentOpacity, {
      values: "0;1;1",
      keyTimes: "0;0.1;1",
      dur: "0.42s",
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
      "0.42s",
      EASE_OUT_SPLINE
    );

    const locMask0 = computeSkewedBox(locX + locW, locY - 3, 0, H_LOC + 6).points;
    const locMask1 = computeSkewedBox(locX - 4, locY - 3, locW + 10, H_LOC + 6).points;

    this._triggerSmil(els.locMaskAnim, {
      values: `${locMask0}; ${locMask1}`,
      keyTimes: "0;1",
      dur: "0.42s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    this._triggerSmil(els.locTextSlide, {
      values: "26 0; 0 0",
      keyTimes: "0;1",
      dur: "0.42s",
      calcMode: "spline",
      keySplines: EASE_OUT_SPLINE,
    });

    const pulseTimer = setTimeout(() => {
      if (this._isVisible) {
        this._startIdlePulse();
      }
    }, 430);
    this._timers.push(pulseTimer);

    // 2. Secondary Title Bar Swipe (staggered by 85ms)
    if (hasTitle) {
      const subTimer = setTimeout(() => {
        const wTitle = 12;
        const sw0 = computeSkewedBox(titleX + titleW, titleY, wTitle, H_TITLE);
        const sw1 = computeSkewedBox(titleX - wTitle, titleY, 0, H_TITLE);

        this._triggerSmil(els.titleWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.88;1",
          dur: "0.38s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.titleWiperBgAnim,
            sheen: els.titleWiperSheenAnim,
            shadow: els.titleWiperShadowAnim,
            light: els.titleWiperLightAnim,
          },
          [sw0, sw1],
          "0;1",
          "0.38s",
          EASE_OUT_SPLINE
        );

        const titleMask0 = computeSkewedBox(titleX + titleW, titleY - 3, 0, H_TITLE + 6).points;
        const titleMask1 = computeSkewedBox(titleX - 4, titleY - 3, titleW + 10, H_TITLE + 6).points;

        this._triggerSmil(els.titleMaskAnim, {
          values: `${titleMask0}; ${titleMask1}`,
          keyTimes: "0;1",
          dur: "0.38s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.titleTextSlide, {
          values: "20 0; 0 0",
          keyTimes: "0;1",
          dur: "0.38s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }, 85);

      this._timers.push(subTimer);
    }
  }

  _animateOut(skipAnimation) {
    this._clearTimers();
    this._stopIdlePulse();

    if (skipAnimation) {
      this._resetToHidden();
      return Promise.resolve();
    }

    const { locX, locY, locW, titleX, titleY, titleW, hasTitle } = this._layout;
    const els = this._els;

    return new Promise((resolve) => {
      if (hasTitle) {
        const wTitle = 12;
        const sw0 = computeSkewedBox(titleX + titleW, titleY, wTitle, H_TITLE);
        const sw1 = computeSkewedBox(titleX - wTitle, titleY, 0, H_TITLE);

        this._triggerSmil(els.titleWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.88;1",
          dur: "0.32s",
          calcMode: "linear",
        });

        this._animateSkewedBox(
          {
            bg: els.titleWiperBgAnim,
            sheen: els.titleWiperSheenAnim,
            shadow: els.titleWiperShadowAnim,
            light: els.titleWiperLightAnim,
          },
          [sw0, sw1],
          "0;1",
          "0.32s",
          EASE_OUT_SPLINE
        );

        const titleMaskFull = computeSkewedBox(titleX - 4, titleY - 3, titleW + 10, H_TITLE + 6).points;
        const titleMaskEmptyL = computeSkewedBox(titleX, titleY - 3, 0, H_TITLE + 6).points;

        this._triggerSmil(els.titleMaskAnim, {
          values: `${titleMaskFull}; ${titleMaskEmptyL}`,
          keyTimes: "0;1",
          dur: "0.32s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.titleTextSlide, {
          values: "0 0; -16 0",
          keyTimes: "0;1",
          dur: "0.32s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }

      const mainOutDelay = hasTitle ? 50 : 0;
      const mainTimer = setTimeout(() => {
        const outW0 = computeSkewedBox(locX + locW, locY, W_ACCENT, H_LOC);
        const outW1 = computeSkewedBox(0, locY, 0, H_LOC);

        this._triggerSmil(els.outWiperOpacity, {
          values: "0;1;1;0",
          keyTimes: "0;0.08;0.9;1",
          dur: "0.4s",
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
          "0.4s",
          EASE_OUT_SPLINE
        );

        const parkedAccent = computeSkewedBox(0, locY, W_ACCENT, H_LOC);
        const collapsedAccent = computeSkewedBox(0, locY, 0, H_LOC);

        this._triggerSmil(els.accentOpacity, {
          values: "1;1;0",
          keyTimes: "0;0.76;1",
          dur: "0.4s",
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
          "0.4s",
          `0 0 1 1; ${EASE_OUT_SPLINE}`
        );

        const locMaskFull = computeSkewedBox(locX - 4, locY - 3, locW + 10, H_LOC + 6).points;
        const locMaskEmptyL = computeSkewedBox(locX, locY - 3, 0, H_LOC + 6).points;

        this._triggerSmil(els.locMaskAnim, {
          values: `${locMaskFull}; ${locMaskEmptyL}`,
          keyTimes: "0;1",
          dur: "0.4s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });

        this._triggerSmil(els.locTextSlide, {
          values: "0 0; -22 0",
          keyTimes: "0;1",
          dur: "0.4s",
          calcMode: "spline",
          keySplines: EASE_OUT_SPLINE,
        });
      }, mainOutDelay);

      const doneTimer = setTimeout(() => {
        this._resetToHidden();
        resolve();
      }, mainOutDelay + 410);

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

export default NewsLocatorGraphic;
