/**
 * Name & Title Corner Tag
 * Displays a name and title as plain text (Plus Jakarta Sans) anchored to a
 * configurable screen corner, on a fully transparent background. On play,
 * each letter of the name reveals in turn (fade + rise), followed by the
 * title cascading in the same way; on stop, everything fades out together.
 */

const DEFAULT_STATE = {
  name: "Alex Morgan",
  title: "Chief Analyst",
  corner: "bottom-left",
  color: "#ffffff",
};

const LETTER_STAGGER_MS = 26;
const LETTER_DURATION_MS = 420;
const TITLE_GAP_MS = 160;

// Font files live next to this module so the graphic stays self-contained.
const FONT_700_URL = new URL(
  "./plus-jakarta-sans-latin-700-normal.woff2",
  import.meta.url
).href;
const FONT_500_URL = new URL(
  "./plus-jakarta-sans-latin-500-normal.woff2",
  import.meta.url
).href;

const STYLE_TEXT = `
@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 700;
  src: url("${FONT_700_URL}") format("woff2");
}

@font-face {
  font-family: "Plus Jakarta Sans";
  font-style: normal;
  font-weight: 500;
  src: url("${FONT_500_URL}") format("woff2");
}

:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  overflow: hidden;
  font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;
  --text-color: #ffffff;
  --shadow-rgb: 0, 0, 0;
}

* {
  box-sizing: border-box;
}

.corner-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 4vmin;
}

.corner-box.top-left {
  top: 0;
  left: 0;
  align-items: flex-start;
  text-align: left;
}

.corner-box.top-right {
  top: 0;
  right: 0;
  align-items: flex-end;
  text-align: right;
}

.corner-box.bottom-left {
  bottom: 0;
  left: 0;
  align-items: flex-start;
  text-align: left;
}

.corner-box.bottom-right {
  bottom: 0;
  right: 0;
  align-items: flex-end;
  text-align: right;
}

.name-line {
  font-weight: 700;
  font-size: clamp(28px, 3.2vw, 54px);
  line-height: 1.15;
  color: var(--text-color);
  text-shadow:
    0 0.3vh 1vh rgba(var(--shadow-rgb), 0.55),
    0 0 0.3vh rgba(var(--shadow-rgb), 0.4);
}

.title-line {
  margin-top: 0.6vh;
  font-weight: 500;
  font-size: clamp(16px, 1.5vw, 26px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-color);
  opacity: 0.88;
  text-shadow: 0 0.25vh 0.8vh rgba(var(--shadow-rgb), 0.5);
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.6em);
  transition: opacity ${LETTER_DURATION_MS}ms ease, transform ${LETTER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
}

.corner-box.visible .letter {
  opacity: 1;
  transform: translateY(0);
}

.corner-box.hiding .letter {
  transition-delay: 0ms !important;
  transition-duration: 260ms !important;
}

.corner-box.no-anim .letter {
  transition: none !important;
}
`;

function buildLetterSpans(text, startDelayMs) {
  return Array.from(text).map((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch === " " ? "\u00A0" : ch;
    span.style.transitionDelay = `${startDelayMs + i * LETTER_STAGGER_MS}ms`;
    return span;
  });
}

// Picks a dark shadow for light text and a light shadow for dark text, so
// the shadow always stays visible/legible regardless of the chosen color.
function shadowRgbFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const perceivedBrightness = (r * 299 + g * 587 + b * 114) / 1000;
  return perceivedBrightness >= 150 ? "0, 0, 0" : "255, 255, 255";
}

class NameTitle extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const box = document.createElement("div");
    box.className = "corner-box";

    const nameLine = document.createElement("div");
    nameLine.className = "name-line";

    const titleLine = document.createElement("div");
    titleLine.className = "title-line";

    box.appendChild(nameLine);
    box.appendChild(titleLine);
    root.appendChild(style);
    root.appendChild(box);

    this._box = box;
    this._nameLine = nameLine;
    this._titleLine = titleLine;

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

  _render(skipAnimation) {
    const wasVisible = this._box.classList.contains("visible");

    this._box.classList.remove(
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right"
    );
    this._box.classList.add(this._state.corner || "bottom-left");
    const color = this._state.color || "#ffffff";
    this._box.style.setProperty("--text-color", color);
    this._box.style.setProperty("--shadow-rgb", shadowRgbFor(color));

    this._nameLine.innerHTML = "";
    this._titleLine.innerHTML = "";

    const name = this._state.name || "";
    const title = this._state.title || "";
    const titleStartDelay = name.length * LETTER_STAGGER_MS + TITLE_GAP_MS;

    buildLetterSpans(name, 0).forEach((span) => this._nameLine.appendChild(span));
    buildLetterSpans(title, titleStartDelay).forEach((span) =>
      this._titleLine.appendChild(span)
    );

    if (wasVisible) this._setVisible(true, skipAnimation);
  }

  _setVisible(visible, skipAnimation) {
    if (skipAnimation) {
      this._box.classList.add("no-anim");
      void this._box.offsetWidth;
    }
    this._box.classList.toggle("hiding", !visible);
    this._box.classList.toggle("visible", visible);
    if (skipAnimation) {
      requestAnimationFrame(() => this._box.classList.remove("no-anim"));
    }
  }
}

export default NameTitle;
