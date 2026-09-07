/**
 * Code Block
 * Displays preformatted multi-line text (a code snippet) with lightweight
 * JavaScript/TypeScript syntax highlighting, framed the same way as the
 * remote-image graphic (soft white border, rounded corners, drop shadow) on
 * a transparent background. An optional title renders as a small tab
 * poking out above the frame's top-left corner, like a file tab in an
 * editor. Animates in on play and out on stop.
 */

const DEFAULT_STATE = {
  text: "",
  fontSize: 22,
  title: "",
};

// A single-pass tokenizer: each alternative is tried left-to-right per
// match, so earlier groups (comments, strings) win over later ones
// (keywords, identifiers), preventing keywords from being re-highlighted
// inside strings/comments.
const TOKEN_REGEX =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_$][\w$]*)|(\b(?:const|let|var|function|class|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|typeof|instanceof|in|of|await|async|import|export|from|as|interface|type|enum|public|private|protected|readonly|static|abstract|namespace|declare|this|super|void|null|undefined|true|false|yield|get|set)\b)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*(?=\s*\())/g;

const TOKEN_CLASSES = [
  null, // full match (unused)
  "tok-comment",
  "tok-comment",
  "tok-string",
  "tok-decorator",
  "tok-keyword",
  "tok-number",
  "tok-function",
];

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(TOKEN_REGEX, (...args) => {
    const groups = args.slice(1, 8);
    const full = args[0];
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] !== undefined) {
        return `<span class="${TOKEN_CLASSES[i + 1]}">${full}</span>`;
      }
    }
    return full;
  });
}

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;

  overflow: hidden;
}

* {
  box-sizing: border-box;
}

.stage {
  pointer-events: none;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-wrap {
  position: relative;
  display: flex;
  max-width: 82%;
  max-height: 82%;
  opacity: 0;
  transform: scale(0.92) translateY(2vmin);
  transition: opacity 550ms ease, transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
}

.frame-wrap.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.frame-wrap.no-anim {
  transition: none;
}

.tab {
  position: absolute;
  top: 0;
  left: 2.2vmin;
  transform: translateY(-100%);
  padding: 0.7vmin 1.8vmin;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.9vmin 0.9vmin 0 0;
  box-shadow: 0 -0.4vh 0.8vh rgba(0, 0, 0, 0.18);
  font-family: "Consolas", "Menlo", "Monaco", "Courier New", monospace;
  font-size: clamp(13px, 1.1vw, 18px);
  color: #33363d;
  white-space: nowrap;
}

.tab[hidden] {
  display: none;
}

.frame {
  max-width: 100%;
  max-height: 100%;
  padding: 0.8vmin;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.6vmin;
  box-shadow:
    0 2vmin 4vmin rgba(0, 0, 0, 0.32),
    0 0.4vmin 1vmin rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.code-surface {
  background: #1e1e1e;
  border-radius: 1.1vmin;
  padding: 2.4vmin 3vmin;
  overflow: auto;
  max-width: 100%;
  max-height: 100%;
}

.code {
  display: block;
  margin: 0;
  font-family: "Consolas", "Menlo", "Monaco", "Courier New", monospace;
  line-height: 1.5;
  color: #d4d4d4;
  white-space: pre;
  tab-size: 2;
}

.tok-comment { color: #6a9955; font-style: italic; }
.tok-string { color: #ce9178; }
.tok-keyword { color: #569cd6; }
.tok-number { color: #b5cea8; }
.tok-function { color: #dcdcaa; }
.tok-decorator { color: #4ec9b0; }
`;

class CodeBlock extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const stage = document.createElement("div");
    stage.className = "stage";

    const frameWrap = document.createElement("div");
    frameWrap.className = "frame-wrap";

    const tab = document.createElement("div");
    tab.className = "tab";

    const frame = document.createElement("div");
    frame.className = "frame";

    const surface = document.createElement("div");
    surface.className = "code-surface";

    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = "code";
    pre.appendChild(code);
    surface.appendChild(pre);
    frame.appendChild(surface);
    frameWrap.appendChild(tab);
    frameWrap.appendChild(frame);
    stage.appendChild(frameWrap);
    root.appendChild(style);
    root.appendChild(stage);

    this._frameWrap = frameWrap;
    this._tab = tab;
    this._code = code;

    this._render();
  }

  async load(params) {
    this._updateState(params.data);
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
    this._code.innerHTML = highlight(this._state.text || "");
    this._code.style.fontSize = `${this._state.fontSize || 22}px`;
    const title = this._state.title || "";
    this._tab.textContent = title;
    this._tab.hidden = !title;
    if (skipAnimation) this._setVisible(this._isVisible(), true);
  }

  _isVisible() {
    return this._frameWrap.classList.contains("visible");
  }

  _setVisible(visible, skipAnimation) {
    if (skipAnimation) {
      this._frameWrap.classList.add("no-anim");
      void this._frameWrap.offsetWidth;
    }
    this._frameWrap.classList.toggle("visible", visible);
    if (skipAnimation) {
      requestAnimationFrame(() => this._frameWrap.classList.remove("no-anim"));
    }
  }
}

export default CodeBlock;
