/**
 * Apex Velocity Result List Board
 * Podium-illuminated classification board with gold/silver/bronze badges, time deltas, and stepped paging.
 */

const DEFAULT_STATE = {
  title: "FINAL STANDINGS",
  subtitle: "MEN'S 50KM MASS START CLASSIC",
  status: "OFFICIAL RESULTS",
  accentColor: "#FFB800",
  pageSize: 6,
  results: [
    { rank: "1", bib: "12", name: "Johannes Høsflot KLÆBO", country: "NOR", flag: "🇳🇴", team: "Norway", time: "1:58:32.4", statusTag: "WINNER" },
    { rank: "2", bib: "04", name: "William POROMAA", country: "SWE", flag: "🇸🇪", team: "Sweden", time: "+0:03.2", statusTag: "DIFF" },
    { rank: "3", bib: "09", name: "Iivo NISKANEN", country: "FIN", flag: "🇫🇮", team: "Finland", time: "+0:11.8", statusTag: "DIFF" },
    { rank: "4", bib: "18", name: "Richard JOUVE", country: "FRA", flag: "🇫🇷", team: "France", time: "+0:35.4", statusTag: "DIFF" },
    { rank: "5", bib: "07", name: "Federico PELLEGRINO", country: "ITA", flag: "🇮🇹", team: "Italy", time: "+0:44.1", statusTag: "DIFF" },
    { rank: "6", bib: "15", name: "Calle HALFWANSSON", country: "SWE", flag: "🇸🇪", team: "Sweden", time: "+1:02.5", statusTag: "DIFF" }
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
  --accent-color: #FFB800;
  --panel-bg: linear-gradient(135deg, rgba(10, 16, 28, 0.95) 0%, rgba(18, 26, 44, 0.92) 100%);
  --panel-border: rgba(255, 255, 255, 0.14);
  --gold: #FFB800;
  --silver: #E2E8F0;
  --bronze: #D97706;
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
  width: 14vw;
  height: 2px;
  background-color: var(--accent-color);
  box-shadow: 0 0 1vw var(--accent-color);
}

.header-top-row {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  margin-bottom: 0.4vh;
}

.status-badge {
  background: rgba(255, 184, 0, 0.18);
  border: 1px solid rgba(255, 184, 0, 0.45);
  color: var(--gold);
  padding: 0.3vh 0.8vw;
  border-radius: 0.3vw;
  font-family: monospace;
  font-size: clamp(10px, 1vh, 13px);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.subtitle-text {
  font-size: clamp(12px, 1.3vh, 17px);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(220, 230, 250, 0.7);
}

.title-text {
  font-size: clamp(28px, 4.4vh, 52px);
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.05;
  color: #FFFFFF;
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
.results-table {
  display: flex;
  flex-direction: column;
  gap: 0.9vh;
}

.table-header {
  display: grid;
  grid-template-columns: 4.5vw 3.5vw 4vw 1fr 14vw 11vw;
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
.result-row {
  display: grid;
  grid-template-columns: 4.5vw 3.5vw 4vw 1fr 14vw 11vw;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5vw;
  padding: 1.1vh 1.4vw;
  will-change: transform, opacity;
  transition: background 0.2s ease, border-color 0.2s ease;
}

/* Rank 1 Gold */
.result-row[data-rank="1"] {
  background: linear-gradient(90deg, rgba(255, 184, 0, 0.22) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(0, 0, 0, 0.4) 100%);
  border: 1px solid rgba(255, 184, 0, 0.5);
  box-shadow: 0 0.4vh 2vh rgba(255, 184, 0, 0.18);
}

/* Rank 2 Silver */
.result-row[data-rank="2"] {
  border-color: rgba(226, 232, 240, 0.3);
}

/* Rank 3 Bronze */
.result-row[data-rank="3"] {
  border-color: rgba(217, 119, 6, 0.35);
}

.rank-pill {
  width: 2.2vw;
  height: 2.2vw;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: clamp(14px, 1.8vh, 22px);
  font-weight: 900;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.result-row[data-rank="1"] .rank-pill {
  background: var(--gold);
  color: #0A0F1D;
  box-shadow: 0 0 1vw rgba(255, 184, 0, 0.6);
}

.result-row[data-rank="2"] .rank-pill {
  background: var(--silver);
  color: #0A0F1D;
}

.result-row[data-rank="3"] .rank-pill {
  background: var(--bronze);
  color: #FFFFFF;
}

.bib-label {
  font-family: monospace;
  font-size: clamp(12px, 1.3vh, 16px);
  color: rgba(255, 255, 255, 0.45);
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

.time-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-val {
  font-family: monospace;
  font-size: clamp(18px, 2.6vh, 30px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  line-height: 1;
}

.result-row[data-rank="1"] .time-val {
  color: var(--gold);
}

.status-tag {
  font-size: clamp(9px, 0.85vh, 12px);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.2vh;
}
`;

class RaceResultList extends HTMLElement {
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
    const topRow = document.createElement("div");
    topRow.className = "header-top-row";
    const statusBadge = document.createElement("span");
    statusBadge.className = "status-badge";
    const subText = document.createElement("span");
    subText.className = "subtitle-text";
    topRow.append(statusBadge, subText);

    const titleText = document.createElement("div");
    titleText.className = "title-text";
    headerLeft.append(topRow, titleText);

    const pageIndicator = document.createElement("div");
    pageIndicator.className = "page-indicator";

    const accentLine = document.createElement("div");
    accentLine.className = "header-accent-line";

    header.append(headerLeft, pageIndicator, accentLine);

    // Table Header
    const tableHeader = document.createElement("div");
    tableHeader.className = "table-header";
    tableHeader.innerHTML = `
      <span>RANK</span>
      <span>BIB</span>
      <span>NAT</span>
      <span>COMPETITOR</span>
      <span>AFFILIATION</span>
      <span class="col-right">TIME / DIFF</span>
    `;

    // Rows Container
    const rowsContainer = document.createElement("div");
    rowsContainer.className = "results-table";

    container.append(header, tableHeader, rowsContainer);
    scene.append(container);
    root.append(style, scene);

    this._elements = {
      scene,
      container,
      statusBadge,
      subText,
      titleText,
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
    const list = this._state.results || [];
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
    el.statusBadge.textContent = s.status || "OFFICIAL";
    el.subText.textContent = s.subtitle || "";

    const totalPages = this._getTotalPages();
    el.pageIndicator.textContent = `PAGE ${this._currentPage + 1} OF ${totalPages}`;

    if (s.accentColor) {
      this.style.setProperty("--accent-color", s.accentColor);
    }

    // Slice results
    const size = s.pageSize || 6;
    const startIdx = this._currentPage * size;
    const results = (s.results || []).slice(startIdx, startIdx + size);

    el.rowsContainer.innerHTML = "";
    results.forEach((item) => {
      const row = document.createElement("div");
      row.className = "result-row";
      row.setAttribute("data-rank", item.rank || "");

      // Rank Pill
      const rankPill = document.createElement("div");
      rankPill.className = "rank-pill";
      rankPill.textContent = item.rank || "";

      // Bib
      const bib = document.createElement("span");
      bib.className = "bib-label";
      bib.textContent = item.bib ? `#${item.bib}` : "";

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

      // Time + Diff
      const timeContainer = document.createElement("div");
      timeContainer.className = "time-container";
      const timeVal = document.createElement("span");
      timeVal.className = "time-val";
      timeVal.textContent = item.time || "";
      const statusTag = document.createElement("span");
      statusTag.className = "status-tag";
      statusTag.textContent = item.statusTag || "";
      timeContainer.append(timeVal, statusTag);

      row.append(rankPill, bib, flagBox, nameBox, teamBox, timeContainer);
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
    const rows = rowsContainer.querySelectorAll(".result-row");
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

export default RaceResultList;
