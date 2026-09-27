/**
 * Tennis Scorebug Module
 * Broadcast-style tennis scorebug with per-set games, current-game points,
 * serve indicator, and tie-break state.
 */

const DEFAULT_STATE = {
  player1Name: "ALCARAZ",
  player2Name: "SINNER",
  player1Seed: "2",
  player2Seed: "1",
  player1Sets: "6 3",
  player2Sets: "4 2",
  player1Points: "40",
  player2Points: "30",
  server: "player1",
  tiebreak: false,
  matchInfo: "BEST OF 5",
  accentColor: "#c8a24b",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Roboto Condensed", "Arial Narrow", sans-serif;
  --accent-color: #c8a24b;
  --text-primary: #ffffff;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  left: max(4%, 60px);
  bottom: max(8%, 80px);
  will-change: opacity, transform;
  transform-origin: bottom left;
  opacity: 0;
}

.scorebug {
  display: flex;
  flex-direction: column;
  min-width: 24em;
  background: rgba(12, 14, 20, 0.92);
  color: var(--text-primary);
  border-radius: 0.3em;
  border-left: 0.25em solid var(--accent-color);
  overflow: hidden;
  box-shadow: 0 0.3em 1em rgba(0, 0, 0, 0.5);
  transform: translateY(120%);
  opacity: 0;
  will-change: transform, opacity;
  font-size: clamp(16px, 1.4vw, 28px);
}

.player-row {
  display: flex;
  align-items: stretch;
  height: 2.2em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.player-row:last-of-type { border-bottom: none; }

.serve {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.4em;
}

.serve-dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.player-row.serving .serve-dot { opacity: 1; }

.name {
  display: flex;
  align-items: center;
  gap: 0.4em;
  flex: 1;
  padding-right: 0.8em;
  font-weight: 700;
  font-size: 1.05em;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.seed {
  font-size: 0.65em;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.sets {
  display: flex;
  align-items: stretch;
}

.set-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  font-size: 1.05em;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  font-variant-numeric: tabular-nums;
}

.set-cell.current {
  background: rgba(255, 255, 255, 0.16);
}

.points {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4em;
  font-size: 1.05em;
  font-weight: 700;
  color: #0c0e14;
  background: var(--accent-color);
  font-variant-numeric: tabular-nums;
}

.points.hidden { display: none; }

.info-bar {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.25em 0.9em;
  font-size: 0.6em;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.05);
}

.info-bar.hidden { display: none; }

.tiebreak-tag {
  color: var(--accent-color);
  font-weight: 700;
}

.tiebreak-tag.hidden { display: none; }
`;

class TennisScorebug extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;
    this._animations = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const scorebug = document.createElement("div");
    scorebug.className = "scorebug";

    const rowOne = this._buildPlayerRow();
    const rowTwo = this._buildPlayerRow();

    const infoBar = document.createElement("div");
    infoBar.className = "info-bar";
    const infoText = document.createElement("span");
    const tiebreakTag = document.createElement("span");
    tiebreakTag.className = "tiebreak-tag hidden";
    tiebreakTag.textContent = "TIE-BREAK";
    infoBar.append(infoText, tiebreakTag);

    scorebug.append(rowOne.row, rowTwo.row, infoBar);
    scene.append(scorebug);
    root.append(style, scene);

    this._elements = { scene, scorebug, rowOne, rowTwo, infoBar, infoText, tiebreakTag };
  }

  _buildPlayerRow() {
    const row = document.createElement("div");
    row.className = "player-row";

    const serve = document.createElement("div");
    serve.className = "serve";
    const serveDot = document.createElement("div");
    serveDot.className = "serve-dot";
    serve.append(serveDot);

    const name = document.createElement("div");
    name.className = "name";
    const nameText = document.createElement("span");
    const seed = document.createElement("span");
    seed.className = "seed";
    name.append(nameText, seed);

    const sets = document.createElement("div");
    sets.className = "sets";

    const points = document.createElement("div");
    points.className = "points";

    row.append(serve, name, sets, points);
    return { row, nameText, seed, sets, points };
  }

  connectedCallback() {
    // hidden until playAction
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  async customAction(id, payload) {
    return { statusCode: 200 };
  }

  async setActionsSchedule(schedule) {
    return { statusCode: 200 };
  }

  async goToTime(time) {
    this._animations.forEach((anim) => {
      anim.currentTime = time;
    });
    return { statusCode: 200 };
  }

  _cancelAnimations() {
    this._animations.forEach((a) => a.cancel());
    this._animations = [];
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateIn(skip);
    this._currentStep = 1;
    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateOut(skip);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  _parseSets(setsValue) {
    if (typeof setsValue !== "string") return [];
    return setsValue.trim().split(/\s+/).filter((cell) => cell.length > 0);
  }

  _applyPlayerRow(rowElements, name, seed, setCells, points, isServing, pointsVisible) {
    rowElements.nameText.textContent = name;
    rowElements.seed.textContent = seed ? `(${seed})` : "";
    rowElements.row.classList.toggle("serving", isServing);

    rowElements.sets.replaceChildren();
    setCells.forEach((cellValue, index) => {
      const cell = document.createElement("div");
      cell.className = index === setCells.length - 1 ? "set-cell current" : "set-cell";
      cell.textContent = cellValue;
      rowElements.sets.append(cell);
    });

    rowElements.points.textContent = points;
    rowElements.points.classList.toggle("hidden", !pointsVisible);
  }

  _applyState() {
    const state = this._state;
    const el = this._elements;

    const setsOne = this._parseSets(state.player1Sets);
    const setsTwo = this._parseSets(state.player2Sets);
    const pointsVisible = Boolean(state.player1Points) || Boolean(state.player2Points);

    this._applyPlayerRow(
      el.rowOne,
      state.player1Name,
      state.player1Seed,
      setsOne,
      state.player1Points,
      state.server === "player1",
      pointsVisible,
    );
    this._applyPlayerRow(
      el.rowTwo,
      state.player2Name,
      state.player2Seed,
      setsTwo,
      state.player2Points,
      state.server === "player2",
      pointsVisible,
    );

    el.infoText.textContent = state.matchInfo;
    el.infoBar.classList.toggle("hidden", !state.matchInfo && !state.tiebreak);
    el.tiebreakTag.classList.toggle("hidden", !state.tiebreak);

    if (state.accentColor) this.style.setProperty("--accent-color", state.accentColor);
  }

  async _animateIn(skip) {
    if (this._isVisible) return;
    this._isVisible = true;

    const { scorebug, scene } = this._elements;

    if (skip) {
      scene.style.opacity = "1";
      scorebug.style.opacity = "1";
      scorebug.style.transform = "translateY(0)";
      return;
    }

    this._cancelAnimations();
    scene.style.opacity = "1";
    const anim = scorebug.animate(
      [
        { transform: "translateY(120%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      {
        duration: 450,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "forwards",
      },
    );
    this._animations.push(anim);
    await anim.finished;
  }

  async _animateOut(skip) {
    if (!this._isVisible) return;
    this._isVisible = false;

    const { scorebug, scene } = this._elements;

    if (skip) {
      scene.style.opacity = "0";
      return;
    }

    const anim = scorebug.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(120%)", opacity: 0 },
      ],
      {
        duration: 350,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      },
    );
    this._animations.push(anim);
    await anim.finished;

    scene.style.opacity = "0";
  }
}

export default TennisScorebug;
