/**
 * OGraf Title Card
 * A big OGraf logo, floating gently in the middle of the screen with a soft
 * drop shadow, plus a custom sub-title text underneath.
 */

const DEFAULT_STATE = {
  title: "The Open Graphics Format",
};

// The logo path data below is the OGraf logo (ograf-logo-colour.svg), split into
// its two brand colors so it can be reused at any size without an external asset.
const LOGO_PATH_BLUE =
  "M1541.68 141.816H1812.32V208.8H1541.68V141.816ZM1747.36 0.40625H1817.05V71.4496H1768.34C1755.26 70.9986 1743.98 72.3518 1734.51 75.5093C1725.04 78.6667 1717.82 84.5306 1712.86 93.101C1707.9 101.22 1705.41 112.948 1705.41 128.284V471.999H1617.46V117.459C1617.46 90.3945 1622.42 68.2921 1632.34 51.1515C1642.27 33.5598 1656.92 20.7044 1676.32 12.5851C1695.72 4.46588 1719.4 0.40625 1747.36 0.40625Z " +
  "M1273.97 479.442C1240.6 479.442 1210.15 472.225 1182.63 457.791C1155.57 442.906 1133.92 422.382 1117.68 396.22C1101.89 369.607 1094 338.934 1094 304.202C1094 268.568 1102.12 237.669 1118.36 211.507C1134.59 185.345 1156.47 165.047 1183.99 150.613C1211.95 135.728 1243.53 128.285 1278.71 128.285C1317.5 128.285 1348.63 136.179 1372.08 151.966C1395.99 167.303 1413.35 188.277 1424.18 214.89C1435.01 241.503 1440.42 271.274 1440.42 304.202C1440.42 324.049 1437.26 344.347 1430.95 365.096C1424.63 385.395 1414.93 404.339 1401.85 421.931C1388.77 439.072 1371.63 453.055 1350.43 463.881C1329.23 474.255 1303.74 479.442 1273.97 479.442ZM1302.39 411.782C1329 411.782 1352.01 407.271 1371.41 398.25C1390.8 389.229 1405.69 376.599 1416.06 360.36C1426.44 344.122 1431.62 325.402 1431.62 304.202C1431.62 281.198 1426.21 261.802 1415.38 246.014C1405.01 229.776 1390.12 217.597 1370.73 209.478C1351.78 200.907 1329 196.622 1302.39 196.622C1264.95 196.622 1235.86 206.546 1215.11 226.393C1194.36 245.789 1183.99 271.725 1183.99 304.202C1183.99 325.853 1188.95 344.798 1198.87 361.037C1208.79 376.824 1222.55 389.229 1240.14 398.25C1258.19 407.271 1278.94 411.782 1302.39 411.782ZM1431.62 135.728H1519.58V472H1437.71C1437.71 472 1437.04 467.715 1435.68 459.144C1434.78 450.123 1433.88 438.846 1432.98 425.314C1432.07 411.782 1431.62 398.476 1431.62 385.395V135.728Z " +
  "M879.266 135.728H967.224V472H879.266V135.728ZM1096.46 208.124C1071.2 208.124 1049.32 213.086 1030.82 223.01C1012.33 232.482 997.446 244.21 986.169 258.193C974.892 272.176 966.999 285.708 962.488 298.789L961.811 261.576C962.262 256.163 964.067 248.27 967.224 237.895C970.382 227.069 975.118 215.567 981.433 203.388C987.748 190.758 996.093 178.805 1006.47 167.528C1016.84 155.8 1029.47 146.328 1044.36 139.111C1059.24 131.894 1076.61 128.285 1096.46 128.285V208.124Z " +
  "M626.961 420.578C590.425 420.578 558.173 415.165 530.207 404.339C502.692 393.063 481.266 376.599 465.93 354.947C450.593 333.296 442.925 307.134 442.925 276.461C442.925 246.24 450.368 220.078 465.253 197.975C480.139 175.873 501.339 158.732 528.854 146.553C556.82 134.375 589.523 128.285 626.961 128.285C637.336 128.285 647.26 128.962 656.732 130.315C666.656 131.668 676.354 133.472 685.826 135.728L855.654 136.404V202.712C832.649 203.163 809.193 200.456 785.287 194.592C761.831 188.277 741.082 181.511 723.039 174.294L721.009 169.558C736.346 176.775 750.78 185.796 764.312 196.622C777.844 206.997 788.67 219.176 796.789 233.159C805.359 246.691 809.644 262.478 809.644 280.521C809.644 309.84 802.202 335.1 787.317 356.301C772.431 377.05 751.231 393.063 723.716 404.339C696.652 415.165 664.4 420.578 626.961 420.578ZM739.954 610.704V594.465C739.954 573.716 733.188 559.282 719.656 551.162C706.575 543.043 688.532 538.984 665.528 538.984H560.654C540.356 538.984 523.216 537.405 509.232 534.247C495.7 531.09 484.875 526.579 476.755 520.715C468.636 514.851 462.772 507.86 459.164 499.741C455.555 492.072 453.751 483.728 453.751 474.706C453.751 456.663 459.615 443.131 471.343 434.11C483.07 424.638 498.858 418.323 518.705 415.165C538.552 412.008 560.429 411.331 584.335 413.135L626.961 420.578C598.544 421.48 577.344 423.961 563.361 428.021C549.829 431.629 543.063 439.072 543.063 450.349C543.063 457.115 545.769 462.527 551.182 466.587C556.595 470.196 564.263 472 574.186 472H684.473C714.694 472 740.405 475.157 761.606 481.472C783.257 488.238 799.721 499.29 810.998 514.626C822.274 530.413 827.913 551.839 827.913 578.903V610.704H739.954ZM626.961 356.977C646.357 356.977 663.273 353.82 677.707 347.505C692.592 341.19 704.094 332.168 712.214 320.441C720.333 308.262 724.392 293.828 724.392 277.138C724.392 259.997 720.333 245.338 712.214 233.159C704.094 220.98 692.818 211.733 678.383 205.418C663.949 198.652 646.809 195.269 626.961 195.269C607.566 195.269 590.425 198.652 575.54 205.418C560.654 211.733 549.152 220.98 541.033 233.159C532.914 245.338 528.854 259.997 528.854 277.138C528.854 293.828 532.914 308.262 541.033 320.441C549.152 332.168 560.429 341.19 574.863 347.505C589.748 353.82 607.114 356.977 626.961 356.977Z";

const LOGO_PATH_LIGHT =
  "M214.841 480.119C172.441 480.119 135.002 473.353 102.525 459.821C70.4992 446.289 45.4648 426.667 27.4221 400.956C9.37929 374.794 0.35791 342.769 0.35791 304.879C0.35791 266.989 9.37929 234.963 27.4221 208.801C45.4648 182.188 70.4992 162.115 102.525 148.583C135.002 135.051 172.441 128.285 214.841 128.285C257.242 128.285 294.229 135.051 325.804 148.583C357.83 162.115 382.865 182.188 400.907 208.801C418.95 234.963 427.971 266.989 427.971 304.879C427.971 342.769 418.95 374.794 400.907 400.956C382.865 426.667 357.83 446.289 325.804 459.821C294.229 473.353 257.242 480.119 214.841 480.119ZM214.841 412.459C238.297 412.459 259.272 408.399 277.765 400.28C296.71 391.71 311.596 379.531 322.421 363.743C333.247 347.505 338.66 327.883 338.66 304.879C338.66 281.874 333.247 262.253 322.421 246.014C311.596 229.325 296.936 216.695 278.442 208.124C259.948 199.554 238.748 195.269 214.841 195.269C191.386 195.269 170.185 199.554 151.241 208.124C132.296 216.695 117.185 229.099 105.908 245.338C95.0824 261.576 89.6696 281.423 89.6696 304.879C89.6696 327.883 95.0824 347.505 105.908 363.743C116.734 379.531 131.619 391.71 150.564 400.28C169.509 408.399 190.935 412.459 214.841 412.459Z";

const LOGO_SVG = `
<svg viewBox="0 0 1818 611" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
  <path d="${LOGO_PATH_BLUE}" fill="#2352C3"/>
  <path d="${LOGO_PATH_LIGHT}" fill="#87A0DE"/>
</svg>`;

// Font file lives next to this module so the graphic stays self-contained.
const FONT_600_URL = new URL(
  "./plus-jakarta-sans-latin-600-normal.woff2",
  import.meta.url
).href;

const STYLE_TEXT = `
@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 600;
  src: url("${FONT_600_URL}") format("woff2");
}

:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

.stage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 900ms ease;
  will-change: opacity;
}

.stage.visible {
  opacity: 1;
}

.stage.no-anim {
  transition: none;
}

.logo-wrap {
  width: clamp(320px, 34vw, 680px);
  animation: float 6s ease-in-out infinite;
}

.stage.visible .logo-wrap {
  animation-play-state: running;
}

.logo-svg {
  width: 100%;
  height: auto;
  display: block;
  filter:
    drop-shadow(0 1.8vh 2.2vh rgba(10, 16, 40, 0.38))
    drop-shadow(0 0.4vh 0.6vh rgba(10, 16, 40, 0.25));
}

.subtitle {
  margin-top: clamp(20px, 3.2vh, 46px);
  font-size: clamp(20px, 2vw, 32px);
  font-weight: 600;
  font-style: normal;
  letter-spacing: 0.06em;
  color: #24304f;
  text-align: center;
  text-shadow: 0 2px 6px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 700ms ease 350ms, transform 700ms ease 350ms;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.subtitle.no-anim {
  transition: none;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-1.4vh) rotate(0.6deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .logo-wrap {
    animation: none;
  }
}
`;

class OgrafTitleCard extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const stage = document.createElement("div");
    stage.className = "stage";

    const logoWrap = document.createElement("div");
    logoWrap.className = "logo-wrap";
    logoWrap.innerHTML = LOGO_SVG;

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";

    stage.appendChild(logoWrap);
    stage.appendChild(subtitle);

    root.appendChild(style);
    root.appendChild(stage);

    this._stage = stage;
    this._subtitle = subtitle;

    this._render();
  }

  async load(params) {
    this._updateState(params.data, true);
    return { statusCode: 200 };
  }

  async dispose() {
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._setVisible(true, params && params.skipAnimation);
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    this._setVisible(false, params && params.skipAnimation);
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._updateState(params.data, params && params.skipAnimation);
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

  _updateState(data, skipAnimation) {
    if (!data) return;
    this._state = { ...this._state, ...data };
    this._render(skipAnimation);
  }

  _setVisible(visible, skipAnimation) {
    this._isVisible = visible;
    this._applyNoAnim(skipAnimation);
    this._stage.classList.toggle("visible", visible);
    this._subtitle.classList.toggle("visible", visible);
  }

  _applyNoAnim(skipAnimation) {
    if (!skipAnimation) return;
    this._stage.classList.add("no-anim");
    this._subtitle.classList.add("no-anim");
    // Force reflow so the removal below doesn't get batched with the toggle above.
    void this._stage.offsetWidth;
    requestAnimationFrame(() => {
      this._stage.classList.remove("no-anim");
      this._subtitle.classList.remove("no-anim");
    });
  }

  _render(skipAnimation) {
    this._applyNoAnim(skipAnimation);
    this._subtitle.textContent = this._state.title;
  }
}

export default OgrafTitleCard;
