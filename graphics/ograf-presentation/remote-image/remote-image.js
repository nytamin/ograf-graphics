/**
 * Remote Image
 * Displays an image loaded from a URL, centered on a transparent background
 * with a soft border, rounded corners, and a subtle drop shadow. Animates
 * in on play and out on stop.
 */

const DEFAULT_STATE = {
  url: "",
  showBackground: true,
};

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
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame {
  max-width: 82%;
  max-height: 82%;
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.6vmin;
  box-shadow:
    0 2vmin 4vmin rgba(0, 0, 0, 0.32),
    0 0.4vmin 1vmin rgba(0, 0, 0, 0.22);
  opacity: 0;
  transform: scale(0.92) translateY(2vmin);
  transition: opacity 550ms ease, transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  border: 0.6vmin solid white;
}

.frame.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.frame.no-anim {
  transition: none;
}

.frame.no-background {
  background: transparent;
  border: none;
  box-shadow: none;
}

.image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 1.1vmin;
  object-fit: contain;
}
`;

class RemoteImage extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const stage = document.createElement("div");
    stage.className = "stage";

    const frame = document.createElement("div");
    frame.className = "frame";

    const img = document.createElement("img");
    img.className = "image";
    img.alt = "";

    frame.appendChild(img);
    stage.appendChild(frame);
    root.appendChild(style);
    root.appendChild(stage);

    this._frame = frame;
    this._img = img;

    this._applyUrl();
    this._applyState();
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

  _updateState(data) {
    if (!data) return;
    const urlChanged = data.url !== undefined && data.url !== this._state.url;
    this._state = { ...this._state, ...data };
    if (urlChanged) this._applyUrl();
    this._applyState();
  }

  _applyState() {
    this._frame.classList.toggle("no-background", !this._state.showBackground);
  }

  _applyUrl() {
    this._img.src = this._state.url || "";
  }

  _setVisible(visible, skipAnimation) {
    if (skipAnimation) {
      this._frame.classList.add("no-anim");
      void this._frame.offsetWidth;
    }
    this._frame.classList.toggle("visible", visible);
    if (skipAnimation) {
      requestAnimationFrame(() => this._frame.classList.remove("no-anim"));
    }
  }
}

export default RemoteImage;
