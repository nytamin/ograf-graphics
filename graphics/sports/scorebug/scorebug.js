/**
 * Sports Scorebug Module
 * Premium scoreboard with independent team coloring, clock, and score updates.
 */

const DEFAULT_STATE = {
  homeTeam: "HOME",
  awayTeam: "AWAY",
  homeScore: 0,
  awayScore: 0,
  period: "1st",
  time: "12:00",
  homeColor: "#1a237e",
  awayColor: "#b71c1c",
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Roboto Condensed", "Arial Narrow", sans-serif;
  --home-color: #1a237e;
  --away-color: #b71c1c;
  --text-primary: #ffffff;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  inset: 0;
  top: max(4vh, 40px);
  left: max(4vw, 60px);
  /* Top-left positioning */
  will-change: opacity, transform;
  transform-origin: top left;
}

.scorebug {
  display: flex;
  height: 60px;
  background: #111;
  color: var(--text-primary);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  transform: translateY(-100px);
  opacity: 0;
  will-change: transform, opacity;
}

.team {
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 700;
  font-size: 24px;
  min-width: 140px;
  justify-content: space-between;
}

.home-team { background: var(--home-color); }
.away-team { background: var(--away-color); }

.score {
  font-size: 32px;
  background: rgba(0,0,0,0.2);
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.game-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 15px;
  background: #222;
  font-size: 14px;
  border-left: 1px solid #333;
  min-width: 80px;
}

.time {
  font-size: 20px;
  font-family: monospace;
  font-weight: 700;
  line-height: 1;
}

.period {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
}

.logo-box {
    width: 30px;
    height: 30px;
    background: white;
    border-radius: 50%;
    margin-right: 10px;
    opacity: 0.9;
}
`;

class SportsScorebug extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const scorebug = document.createElement("div");
    scorebug.className = "scorebug";

    // Home Section
    const homeTeam = document.createElement("div");
    homeTeam.className = "team home-team";
    const homeLogo = document.createElement("div");
    homeLogo.className = "logo-box";
    const homeName = document.createElement("span");
    const homeScore = document.createElement("div");
    homeScore.className = "score";
    homeTeam.append(homeLogo, homeName, homeScore);

    // Away Section
    const awayTeam = document.createElement("div");
    awayTeam.className = "team away-team";
    const awayLogo = document.createElement("div");
    awayLogo.className = "logo-box";
    const awayName = document.createElement("span");
    const awayScore = document.createElement("div");
    awayScore.className = "score";
    awayTeam.append(awayLogo, awayName, awayScore);

    // Info Section
    const gameInfo = document.createElement("div");
    gameInfo.className = "game-info";
    const time = document.createElement("div");
    time.className = "time";
    const period = document.createElement("div");
    period.className = "period";
    gameInfo.append(time, period);

    scorebug.append(homeTeam, awayTeam, gameInfo);
    scene.append(scorebug);
    root.append(style, scene);

    this._elements = {
        scene, scorebug,
        homeName, homeScore, homeTeam,
        awayName, awayScore, awayTeam,
        time, period
    };
  }

  connectedCallback() {
      // hidden
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.scene.remove();
    return { statusCode: 200 };
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

  _applyState() {
     const { homeTeam, awayTeam, homeScore, awayScore, period, time, homeColor, awayColor } = this._state;
     const el = this._elements;

     el.homeName.textContent = homeTeam;
     el.homeScore.textContent = homeScore;
     el.awayName.textContent = awayTeam;
     el.awayScore.textContent = awayScore;
     el.period.textContent = period;
     el.time.textContent = time;

     if (homeColor) this.style.setProperty("--home-color", homeColor);
     if (awayColor) this.style.setProperty("--away-color", awayColor);
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

      scene.style.opacity = "1";
      await scorebug.animate([
          { transform: "translateY(-100px)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 }
      ], {
          duration: 400,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "forwards"
      }).finished;
  }

  async _animateOut(skip) {
      if (!this._isVisible) return;
      this._isVisible = false;

      const { scorebug, scene } = this._elements;

      if (skip) {
          scene.style.opacity = "0";
          return;
      }

      await scorebug.animate([
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(-100px)", opacity: 0 }
      ], {
          duration: 300,
          easing: "cubic-bezier(0.4, 0, 1, 1)",
          fill: "forwards"
      }).finished;

      scene.style.opacity = "0";
  }
}

export default SportsScorebug;
