/**
 * Apex Velocity Start List Board
 * Stepped multi-page departure order board with interval times and team affiliations.
 */

const DEFAULT_STATE = {
  title: "START LIST — ORDER OF DEPARTURE",
  subtitle: "MEN'S 15KM INTERVAL START FREE",
  stageInfo: "Interval Start: 1 min gap • Holmenkollen Arena",
  accentColor: "#00E5FF",
  pageSize: 6,
  starters: [
    { bib: "01", name: "Tadej POGAČAR", country: "SLO", flag: "🇸🇮", team: "UAE Team Emirates", startTime: "14:30:00" },
    { bib: "02", name: "Jonas VINGEGAARD", country: "DEN", flag: "🇩🇰", team: "Team Visma-Lease a Bike", startTime: "14:31:00" },
    { bib: "03", name: "Remco EVENEPOEL", country: "BEL", flag: "🇧🇪", team: "Soudal Quick-Step", startTime: "14:32:00" },
    { bib: "04", name: "Primož ROGLIČ", country: "SLO", flag: "🇸🇮", team: "Red Bull-BORA-hansgrohe", startTime: "14:33:00" },
    { bib: "05", name: "Carlos RODRÍGUEZ", country: "ESP", flag: "🇪🇸", team: "INEOS Grenadiers", startTime: "14:34:00" },
    { bib: "06", name: "Adam YATES", country: "GBR", flag: "🇬🇧", team: "UAE Team Emirates", startTime: "14:35:00" }
  ]
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Condensed", "DIN Alternate", "Roboto Condensed", "Segoe UI", -apple-system, sans-serif;
  color: #FFFFFF;
  --accent-color: #00E5FF;
  --panel-bg: linear-gradient(135deg, rgba(10, 16, 28, 0.95) 0%, rgba(18, 26, 44, 0.92) 100%);
  --panel-border: rgba(255, 255, 255, 0.14);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  will-change: opacity;
}

.board-container {
  width: 66vw;
  max-width: 1400px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 0.8vw;
  box-shadow: 0 2vh 5vh rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 3vh 3vw;
  will-change: transform, opacity;
  transform: translate3d(0, 40px, 0);
  opacity: 0;
}

/* Header */
.board-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2vh;
  margin-bottom: 2.2vh;
  position: relative;
}

.header-accent-line {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 12vw;
  height: 2px;
  background-color: var(--accent-color);
  box-shadow: 0 0 1vw var(--accent-color);
}

.subtitle-badge {
  font-size: clamp(12px, 1.3vh, 17px);
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent-color);
  margin-bottom: 0.4vh;
}

.title-text {
  font-size: clamp(28px, 4.4vh, 52px);
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.05;
  color: #FFFFFF;
}

.stage-info {
  font-size: clamp(12px, 1.3vh, 16px);
  color: rgba(210, 225, 250, 0.7);
  letter-spacing: 0.04em;
  margin-top: 0.4vh;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 0.6vw;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.6vh 1.2vw;
  border-radius: 0.4vw;
  font-family: monospace;
  font-size: clamp(12px, 1.3vh, 16px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
}

/* Table */
.starters-table {
  display: flex;
  flex-direction: column;
  gap: 0.9vh;
}

.table-header {
  display: grid;
  grid-template-columns: 4.5vw 4vw 1fr 14vw 10vw;
  align-items: center;
  padding: 0.6vh 1.4vw;
  font-size: clamp(11px, 1.1vh, 14px);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.col-right {
  text-align: right;
}

/* Rows */
.starter-row {
  display: grid;
  grid-template-columns: 4.5vw 4vw 1fr 14vw 10vw;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5vw;
  padding: 1.1vh 1.4vw;
  will-change: transform, opacity;
  transition: background 0.2s ease;
}

.starter-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.025);
}

.bib-badge {
  font-size: clamp(18px, 2.6vh, 32px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: var(--accent-color);
}

.flag-box {
  display: flex;
  align-items: center;
  font-size: clamp(16px, 2.2vh, 26px);
}

.flag-img {
  width: 1.6vw;
  height: 1.1vw;
  object-fit: cover;
  border-radius: 0.15vw;
}

.name-box {
  display: flex;
  align-items: baseline;
  gap: 0.6vw;
  font-size: clamp(18px, 2.6vh, 32px);
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.02em;
}

.name-box .country-tag {
  font-size: clamp(12px, 1.3vh, 16px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.team-box {
  font-size: clamp(13px, 1.4vh, 18px);
  font-weight: 600;
  color: rgba(210, 225, 250, 0.75);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.start-time-box {
  font-family: monospace;
  font-size: clamp(18px, 2.6vh, 30px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
  text-align: right;
  letter-spacing: 0.02em;
}
`;

class RaceStartList extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._currentStep = undefined;
    this._currentPage = 0;
    this._animations = [];

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const container = document.createElement("div");
    container.className = "board-container";

    // Header
    const header = document.createElement("div");
    header.className = "board-header";
    const headerLeft = document.createElement("div");
    const subBadge = document.createElement("div");
    subBadge.className = "subtitle-badge";
    const titleText = document.createElement("div");
    titleText.className = "title-text";
    const stageInfo = document.createElement("div");
    stageInfo.className = "stage-info";
    headerLeft.append(subBadge, titleText, stageInfo);

    const pageIndicator = document.createElement("div");
    pageIndicator.className = "page-indicator";

    const accentLine = document.createElement("div");
    accentLine.className = "header-accent-line";

    header.append(headerLeft, pageIndicator, accentLine);

    // Table Header
    const tableHeader = document.createElement("div");
    tableHeader.className = "table-header";
    tableHeader.innerHTML = `
      <span>BIB</span>
      <span>NAT</span>
      <span>COMPETITOR</span>
      <span>TEAM / CLUB</span>
      <span class="col-right">START TIME</span>
    `;

    // Rows Container
    const rowsContainer = document.createElement("div");
    rowsContainer.className = "starters-table";

    container.append(header, tableHeader, rowsContainer);
    scene.append(container);
    root.append(style, scene);

    this._elements = {
      scene,
      container,
      subBadge,
      titleText,
      stageInfo,
      pageIndicator,
      rowsContainer
    };
  }

  connectedCallback() {
    // Hidden initially
  }

  async load(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._currentPage = 0;
    this._renderPage();
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    if (this._elements.scene) {
      this._elements.scene.remove();
    }
    return { statusCode: 200 };
  }

  _getTotalPages() {
    const list = this._state.starters || [];
    const size = this._state.pageSize || 6;
    return Math.max(1, Math.ceil(list.length / size));
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    const totalPages = this._getTotalPages();

    let targetStep = 0;
    if (params?.goto !== undefined) {
      targetStep = params.goto;
    } else if (this._currentStep !== undefined) {
      const delta = params?.delta !== undefined ? params.delta : 1;
      targetStep = this._currentStep + delta;
    }

    if (targetStep >= totalPages) {
      // Loop back or finish
      await this.stopAction(params);
      return { statusCode: 200, currentStep: undefined };
    }

    this._currentPage = targetStep;
    this._currentStep = targetStep;

    if (!this._isVisible) {
      this._renderPage();
      await this._animateIn(skip);
    } else {
      await this._transitionPage(skip);
    }

    return { statusCode: 200, currentStep: this._currentStep };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    await this._animateOut(skip);
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._renderPage();
    return { statusCode: 200 };
  }

  async customAction(params) {
    return { statusCode: 200 };
  }

  async goToTime(params) {
    return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    return { statusCode: 200 };
  }

  _cancelAnimations() {
    this._animations.forEach(a => a.cancel());
    this._animations = [];
  }

  _renderPage() {
    const s = this._state;
    const el = this._elements;

    el.titleText.textContent = s.title || "";
    el.subBadge.textContent = s.subtitle || "";
    el.stageInfo.textContent = s.stageInfo || "";

    const totalPages = this._getTotalPages();
    el.pageIndicator.textContent = `PAGE ${this._currentPage + 1} OF ${totalPages}`;

    if (s.accentColor) {
      this.style.setProperty("--accent-color", s.accentColor);
    }

    // Slice starters
    const size = s.pageSize || 6;
    const startIdx = this._currentPage * size;
    const starters = (s.starters || []).slice(startIdx, startIdx + size);

    el.rowsContainer.innerHTML = "";
    starters.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "starter-row";

      // Bib
      const bib = document.createElement("span");
      bib.className = "bib-badge";
      bib.textContent = item.bib || "";

      // Flag
      const flagBox = document.createElement("span");
      flagBox.className = "flag-box";
      if (item.flag) {
        if (item.flag.startsWith("http") || item.flag.startsWith("data:") || item.flag.endsWith(".png") || item.flag.endsWith(".svg")) {
          const img = document.createElement("img");
          img.className = "flag-img";
          img.src = item.flag;
          img.alt = item.country || "";
          flagBox.append(img);
        } else {
          flagBox.textContent = item.flag;
        }
      }

      // Name
      const nameBox = document.createElement("div");
      nameBox.className = "name-box";
      const nameText = document.createElement("span");
      nameText.textContent = item.name || "";
      const countryTag = document.createElement("span");
      countryTag.className = "country-tag";
      countryTag.textContent = item.country ? `(${item.country})` : "";
      nameBox.append(nameText, countryTag);

      // Team
      const teamBox = document.createElement("span");
      teamBox.className = "team-box";
      teamBox.textContent = item.team || "";

      // Time
      const timeBox = document.createElement("span");
      timeBox.className = "start-time-box";
      timeBox.textContent = item.startTime || "";

      row.append(bib, flagBox, nameBox, teamBox, timeBox);
      el.rowsContainer.append(row);
    });
  }

  async _transitionPage(skip) {
    if (skip) {
      this._renderPage();
      return;
    }

    const { rowsContainer } = this._elements;
    const animOut = rowsContainer.animate([
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
      { opacity: 0, transform: "translate3d(0, -15px, 0)" }
    ], {
      duration: 200,
      easing: "cubic-bezier(0.4, 0, 1, 1)"
    });
    await animOut.finished;

    this._renderPage();

    const animIn = rowsContainer.animate([
      { opacity: 0, transform: "translate3d(0, 15px, 0)" },
      { opacity: 1, transform: "translate3d(0, 0, 0)" }
    ], {
      duration: 350,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });
    await animIn.finished;
  }

  async _animateIn(skip) {
    if (this._isVisible) return;
    this._isVisible = true;

    const { scene, container, rowsContainer } = this._elements;

    if (skip) {
      scene.style.opacity = "1";
      container.style.opacity = "1";
      container.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    this._cancelAnimations();
    scene.style.opacity = "1";

    const boardAnim = container.animate([
      { transform: "translate3d(0, 50px, 0) scale(0.98)", opacity: 0 },
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 }
    ], {
      duration: 450,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    });
    this._animations.push(boardAnim);

    // Stagger row entry
    const rows = rowsContainer.querySelectorAll(".starter-row");
    rows.forEach((row, i) => {
      row.style.opacity = "0";
      const rowAnim = row.animate([
        { transform: "translate3d(0, 20px, 0)", opacity: 0 },
        { transform: "translate3d(0, 0, 0)", opacity: 1 }
      ], {
        duration: 350,
        delay: 150 + i * 35,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      });
      this._animations.push(rowAnim);
    });

    await boardAnim.finished;
  }

  async _animateOut(skip) {
    if (!this._isVisible) return;
    this._isVisible = false;

    const { scene, container } = this._elements;

    if (skip) {
      scene.style.opacity = "0";
      container.style.opacity = "0";
      return;
    }

    this._cancelAnimations();
    const anim = container.animate([
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
      { transform: "translate3d(0, 30px, 0) scale(0.98)", opacity: 0 }
    ], {
      duration: 280,
      easing: "cubic-bezier(0.4, 0, 1, 1)",
      fill: "forwards"
    });

    this._animations.push(anim);
    await anim.finished;
    scene.style.opacity = "0";
  }
}

export default RaceStartList;
