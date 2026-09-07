/**
 * Bullet List
 * Displays a bullet-point list (an array of strings) on a transparent
 * background, framed with the same soft border, rounded corners, and drop
 * shadow used by the other remote-* graphics. The frame fades/scales in as a
 * whole on play, and each bullet point then reveals in turn (fade + slide),
 * staggered by the configurable staggerMs. Animates out on stop.
 */

const DEFAULT_STATE = {
  items: [],
  staggerMs: 150,
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
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
  max-width: 70%;
  min-width: 24%;
  max-height: 82%;
  padding: 3vmin 3.6vmin;


  opacity: 0;
  transform: scale(0.92) translateY(2vmin);

  transition: opacity 550ms ease, transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
}

.frame.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.frame.no-anim,
.frame.no-anim .item {
  transition: none;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.6vmin;
  font-family: "Segoe UI", Arial, sans-serif;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 1.2vmin;
  opacity: 0;
  transform: translateX(-1.6vmin);
  transition: opacity 420ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.item.visible {
  opacity: 1;
  transform: translateX(0);
}

.dot {
  flex: 0 0 auto;
  width: 1.1vmin;
  height: 1.1vmin;
  margin-top: 0.9vmin;
  border-radius: 50%;
  background: #2352c3;

  position: relative;
  top: 0.5em;
}

.text {
  font-size: clamp(20px, 2.2vw, 34px);
  line-height: 1.3;
  color: #1c2333;
}
`;

class BulletList extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._items = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const stage = document.createElement("div");
    stage.className = "stage";

    const frame = document.createElement("div");
    frame.className = "frame";

    const list = document.createElement("ul");
    list.className = "list";

    frame.appendChild(list);
    stage.appendChild(frame);
    root.appendChild(style);
    root.appendChild(stage);

    this._frame = frame;
    this._list = list;

    this._rebuildItems();
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
    const itemsChanged =
      data.items !== undefined &&
      JSON.stringify(data.items) !== JSON.stringify(this._state.items);
    this._state = { ...this._state, ...data };
    if (itemsChanged) this._rebuildItems(skipAnimation);
  }

  _rebuildItems() {
    const wasVisible = this._frame.classList.contains("visible");
    this._list.innerHTML = "";
    this._items = (this._state.items || []).map((text) => {
      const li = document.createElement("li");
      li.className = "item";

      const dot = document.createElement("span");
      dot.className = "dot";

      const label = document.createElement("span");
      label.className = "text";
      label.innerHTML = text;

      li.appendChild(dot);
      li.appendChild(label);
      this._list.appendChild(li);
      return li;
    });
    if (wasVisible) this._setVisible(true, true);
  }

  _setVisible(visible, skipAnimation) {
    if (skipAnimation) {
      this._frame.classList.add("no-anim");
      void this._frame.offsetWidth;
    }
    this._frame.classList.toggle("visible", visible);

    const stagger = Math.max(this._state.staggerMs, 0);
    this._items.forEach((item, i) => {
      item.style.transitionDelay = skipAnimation ? "0ms" : `${i * stagger}ms`;
      item.classList.toggle("visible", visible);
    });

    if (skipAnimation) {
      requestAnimationFrame(() => this._frame.classList.remove("no-anim"));
    }
  }
}

export default BulletList;
