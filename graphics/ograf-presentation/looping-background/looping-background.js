/**
 * OGraf Looping Background
 * Toned-down gray OGraf logos arranged on 30-degree diagonal straps that
 * continuously scroll, with adjacent straps moving in opposing directions.
 */

const DEFAULT_STATE = {
  backgroundColor: "#f0f0ff",
  speed: 1.0,
};

// Combined path data for all 5 shapes of the OGraf logo, merged into a single
// silhouette so it can be recolored as one flat gray tone per strap.
const LOGO_SILHOUETTE_D =
  "M1541.68 141.816H1812.32V208.8H1541.68V141.816ZM1747.36 0.40625H1817.05V71.4496H1768.34C1755.26 70.9986 1743.98 72.3518 1734.51 75.5093C1725.04 78.6667 1717.82 84.5306 1712.86 93.101C1707.9 101.22 1705.41 112.948 1705.41 128.284V471.999H1617.46V117.459C1617.46 90.3945 1622.42 68.2921 1632.34 51.1515C1642.27 33.5598 1656.92 20.7044 1676.32 12.5851C1695.72 4.46588 1719.4 0.40625 1747.36 0.40625Z " +
  "M1273.97 479.442C1240.6 479.442 1210.15 472.225 1182.63 457.791C1155.57 442.906 1133.92 422.382 1117.68 396.22C1101.89 369.607 1094 338.934 1094 304.202C1094 268.568 1102.12 237.669 1118.36 211.507C1134.59 185.345 1156.47 165.047 1183.99 150.613C1211.95 135.728 1243.53 128.285 1278.71 128.285C1317.5 128.285 1348.63 136.179 1372.08 151.966C1395.99 167.303 1413.35 188.277 1424.18 214.89C1435.01 241.503 1440.42 271.274 1440.42 304.202C1440.42 324.049 1437.26 344.347 1430.95 365.096C1424.63 385.395 1414.93 404.339 1401.85 421.931C1388.77 439.072 1371.63 453.055 1350.43 463.881C1329.23 474.255 1303.74 479.442 1273.97 479.442ZM1302.39 411.782C1329 411.782 1352.01 407.271 1371.41 398.25C1390.8 389.229 1405.69 376.599 1416.06 360.36C1426.44 344.122 1431.62 325.402 1431.62 304.202C1431.62 281.198 1426.21 261.802 1415.38 246.014C1405.01 229.776 1390.12 217.597 1370.73 209.478C1351.78 200.907 1329 196.622 1302.39 196.622C1264.95 196.622 1235.86 206.546 1215.11 226.393C1194.36 245.789 1183.99 271.725 1183.99 304.202C1183.99 325.853 1188.95 344.798 1198.87 361.037C1208.79 376.824 1222.55 389.229 1240.14 398.25C1258.19 407.271 1278.94 411.782 1302.39 411.782ZM1431.62 135.728H1519.58V472H1437.71C1437.71 472 1437.04 467.715 1435.68 459.144C1434.78 450.123 1433.88 438.846 1432.98 425.314C1432.07 411.782 1431.62 398.476 1431.62 385.395V135.728Z " +
  "M879.266 135.728H967.224V472H879.266V135.728ZM1096.46 208.124C1071.2 208.124 1049.32 213.086 1030.82 223.01C1012.33 232.482 997.446 244.21 986.169 258.193C974.892 272.176 966.999 285.708 962.488 298.789L961.811 261.576C962.262 256.163 964.067 248.27 967.224 237.895C970.382 227.069 975.118 215.567 981.433 203.388C987.748 190.758 996.093 178.805 1006.47 167.528C1016.84 155.8 1029.47 146.328 1044.36 139.111C1059.24 131.894 1076.61 128.285 1096.46 128.285V208.124Z " +
  "M626.961 420.578C590.425 420.578 558.173 415.165 530.207 404.339C502.692 393.063 481.266 376.599 465.93 354.947C450.593 333.296 442.925 307.134 442.925 276.461C442.925 246.24 450.368 220.078 465.253 197.975C480.139 175.873 501.339 158.732 528.854 146.553C556.82 134.375 589.523 128.285 626.961 128.285C637.336 128.285 647.26 128.962 656.732 130.315C666.656 131.668 676.354 133.472 685.826 135.728L855.654 136.404V202.712C832.649 203.163 809.193 200.456 785.287 194.592C761.831 188.277 741.082 181.511 723.039 174.294L721.009 169.558C736.346 176.775 750.78 185.796 764.312 196.622C777.844 206.997 788.67 219.176 796.789 233.159C805.359 246.691 809.644 262.478 809.644 280.521C809.644 309.84 802.202 335.1 787.317 356.301C772.431 377.05 751.231 393.063 723.716 404.339C696.652 415.165 664.4 420.578 626.961 420.578ZM739.954 610.704V594.465C739.954 573.716 733.188 559.282 719.656 551.162C706.575 543.043 688.532 538.984 665.528 538.984H560.654C540.356 538.984 523.216 537.405 509.232 534.247C495.7 531.09 484.875 526.579 476.755 520.715C468.636 514.851 462.772 507.86 459.164 499.741C455.555 492.072 453.751 483.728 453.751 474.706C453.751 456.663 459.615 443.131 471.343 434.11C483.07 424.638 498.858 418.323 518.705 415.165C538.552 412.008 560.429 411.331 584.335 413.135L626.961 420.578C598.544 421.48 577.344 423.961 563.361 428.021C549.829 431.629 543.063 439.072 543.063 450.349C543.063 457.115 545.769 462.527 551.182 466.587C556.595 470.196 564.263 472 574.186 472H684.473C714.694 472 740.405 475.157 761.606 481.472C783.257 488.238 799.721 499.29 810.998 514.626C822.274 530.413 827.913 551.839 827.913 578.903V610.704H739.954ZM626.961 356.977C646.357 356.977 663.273 353.82 677.707 347.505C692.592 341.19 704.094 332.168 712.214 320.441C720.333 308.262 724.392 293.828 724.392 277.138C724.392 259.997 720.333 245.338 712.214 233.159C704.094 220.98 692.818 211.733 678.383 205.418C663.949 198.652 646.809 195.269 626.961 195.269C607.566 195.269 590.425 198.652 575.54 205.418C560.654 211.733 549.152 220.98 541.033 233.159C532.914 245.338 528.854 259.997 528.854 277.138C528.854 293.828 532.914 308.262 541.033 320.441C549.152 332.168 560.429 341.19 574.863 347.505C589.748 353.82 607.114 356.977 626.961 356.977Z " +
  "M214.841 480.119C172.441 480.119 135.002 473.353 102.525 459.821C70.4992 446.289 45.4648 426.667 27.4221 400.956C9.37929 374.794 0.35791 342.769 0.35791 304.879C0.35791 266.989 9.37929 234.963 27.4221 208.801C45.4648 182.188 70.4992 162.115 102.525 148.583C135.002 135.051 172.441 128.285 214.841 128.285C257.242 128.285 294.229 135.051 325.804 148.583C357.83 162.115 382.865 182.188 400.907 208.801C418.95 234.963 427.971 266.989 427.971 304.879C427.971 342.769 418.95 374.794 400.907 400.956C382.865 426.667 357.83 446.289 325.804 459.821C294.229 473.353 257.242 480.119 214.841 480.119ZM214.841 412.459C238.297 412.459 259.272 408.399 277.765 400.28C296.71 391.71 311.596 379.531 322.421 363.743C333.247 347.505 338.66 327.883 338.66 304.879C338.66 281.874 333.247 262.253 322.421 246.014C311.596 229.325 296.936 216.695 278.442 208.124C259.948 199.554 238.748 195.269 214.841 195.269C191.386 195.269 170.185 199.554 151.241 208.124C132.296 216.695 117.185 229.099 105.908 245.338C95.0824 261.576 89.6696 281.423 89.6696 304.879C89.6696 327.883 95.0824 347.505 105.908 363.743C116.734 379.531 131.619 391.71 150.564 400.28C169.509 408.399 190.935 412.459 214.841 412.459Z";

// Padded viewBox so the tiled logo has breathing room between repeats.
const TILE_MARGIN = 480;
const TILE_WIDTH = 1818 + TILE_MARGIN * 2;
const TILE_HEIGHT = 611;

function buildTileDataUri(color) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_WIDTH} ${TILE_HEIGHT}">` +
    `<g transform="translate(${TILE_MARGIN},0)"><path d="${LOGO_SILHOUETTE_D}" fill="${color}"/></g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Each strap: [gray shade, tile width (cqw), band height (cqh), direction (1 or -1), duration (s)]
const STRAPS = [
  ["#2352C3", 30, 11, 1, 26],
  ["#87A0DE", 26, 9, -1, 21],
  ["#2352C3", 34, 12, 1, 32],
  ["#87A0DE", 24, 8, -1, 18],
  ["#2352C3", 32, 10, 1, 28],
  ["#87A0DE", 28, 9, -1, 23],
  ["#2352C3", 36, 12, 1, 34],
  ["#87A0DE", 25, 8, -1, 19],
  ["#2352C3", 31, 10, 1, 27],
  ["#87A0DE", 27, 9, -1, 22],
];
// const STRAPS = [
//   ["#d0d0de", 30, 11, 1, 26],
//   ["#dadae8", 26, 9, -1, 21],
//   ["#c6c6d5", 34, 12, 1, 32],
//   ["#e0e0ee", 24, 8, -1, 18],
//   ["#ccccda", 32, 10, 1, 28],
//   ["#d6d6e4", 28, 9, -1, 23],
//   ["#c3c3d2", 36, 12, 1, 34],
//   ["#dcdcea", 25, 8, -1, 19],
//   ["#cecedc", 31, 10, 1, 27],
//   ["#dedeec", 27, 9, -1, 22],
// ];

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  /* Establishes a query container sized to this element's own box (not the
     viewport), so the cqw/cqh units below scale with the host's actual
     rendered size regardless of output resolution. */
  container-type: size;
}

* {
  box-sizing: border-box;
}

.scene {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 800ms ease;
  will-change: opacity;
}

.scene.visible {
  opacity: 1;
}

.scene.no-anim {
  transition: none;
}

.backdrop {
  position: absolute;
  inset: 0;
}

.straps {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200cqmax;
  height: 200cqmax;
  opacity: 0.2;
  transform: translate(-50%, -50%) rotate(-30deg);
  display: flex;
  flex-direction: column;
}

.strap {
  flex-shrink: 0;
  width: 100%;
  background-repeat: repeat-x;
  background-position-x: 0;
  animation-name: scroll-strap;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes scroll-strap {
  from { background-position-x: 0; }
  to { background-position-x: var(--tile-w); }
}
`;

class OgrafLoopingBackground extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";

    const straps = document.createElement("div");
    straps.className = "straps";

    STRAPS.forEach(([color, tileWidth, heightCqh, direction, duration]) => {
      const strap = document.createElement("div");
      strap.className = "strap";
      strap.style.height = `${heightCqh}cqmax`;
      strap.style.backgroundImage = buildTileDataUri(color);
      strap.style.backgroundSize = `${tileWidth}cqmax auto`;
      strap.style.setProperty(
        "--tile-w",
        `${direction > 0 ? -tileWidth : tileWidth}cqmax`
      );
      strap.style.animationDuration = `${duration}s`;
      this._straps = this._straps || [];
      this._straps.push({ el: strap, baseDuration: duration });
      straps.appendChild(strap);
    });

    scene.appendChild(backdrop);
    scene.appendChild(straps);
    root.appendChild(style);
    root.appendChild(scene);

    this._scene = scene;
    this._backdrop = backdrop;

    this._applyState();
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
    this._applyState(skipAnimation);
  }

  _setVisible(visible, skipAnimation) {
    if (skipAnimation) {
      this._scene.classList.add("no-anim");
      void this._scene.offsetWidth;
    }
    this._scene.classList.toggle("visible", visible);
    if (skipAnimation) {
      requestAnimationFrame(() => this._scene.classList.remove("no-anim"));
    }
  }

  _applyState(skipAnimation) {
    if (skipAnimation) {
      this._scene.classList.add("no-anim");
      void this._scene.offsetWidth;
    }
    this._backdrop.style.backgroundColor = this._state.backgroundColor;
    const speed = Math.max(this._state.speed, 0.01);
    (this._straps || []).forEach(({ el, baseDuration }) => {
      el.style.animationDuration = `${baseDuration / speed}s`;
    });
    if (skipAnimation) {
      requestAnimationFrame(() => this._scene.classList.remove("no-anim"));
    }
  }
}

export default OgrafLoopingBackground;
