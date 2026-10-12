/**
 * Apex Velocity Split-Time / Intermediate Telemetry
 * Precision timing overlay for checkpoints and photocell beam triggers in skiing, cycling, and running.
 */

const DEFAULT_STATE = {
  checkpoint: "SPLIT 2 • 7.5 KM",
  sectorNote: "FASTEST SECTOR",
  bib: "18",
  athleteName: "Johannes Høsflot KLÆBO",
  countryCode: "NOR",
  countryFlag: "🇳🇴",
  rank: "1st",
  splitTime: "18:42.30",
  delta: "-0.45",
  isAhead: true,
  leaderRef: "Leader: J. H. KLÆBO (NOR) 18:42.30",
  beamSpeed: "28.4 km/h",
  accentColor: "#00E5FF"
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
  --panel-bg: linear-gradient(135deg, rgba(10, 16, 28, 0.96) 0%, rgba(18, 26, 44, 0.94) 100%);
  --panel-border: rgba(255, 255, 255, 0.16);
  --color-green: #00E676;
  --color-red: #FF334B;
  --gold: #FFB800;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.scene {
  position: absolute;
  inset: 0;
  opacity: 0;
  will-change: opacity;
}

.split-wrapper {
  position: absolute;
  bottom: 6vh;
  left: 5vw;
  display: flex;
  flex-direction: column;
  max-width: 58vw;
  min-width: 34vw;
  filter: drop-shadow(0 1.5vh 4vh rgba(0, 0, 0, 0.85));
  will-change: transform, opacity;
  transform: translate3d(0, 100%, 0);
  opacity: 0;
}

/* Checkpoint header strip */
.checkpoint-strip {
  display: inline-flex;
  align-items: center;
  gap: 0.8vw;
  background: rgba(6, 10, 20, 0.98);
  border: 1px solid var(--panel-border);
  border-bottom: none;
  border-radius: 0.4vw 0.4vw 0 0;
  padding: 0.45vh 1.4vw;
  font-size: clamp(12px, 1.2vh, 16px);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240, 244, 255, 0.95);
  box-shadow: 0 -0.4vh 1.2vh rgba(0,0,0,0.3);
}

.checkpoint-strip .pulse-indicator {
  width: 0.5vw;
  height: 0.5vw;
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  background-color: var(--accent-color);
  box-shadow: 0 0 0.8vw var(--accent-color);
}

.sector-note {
  font-family: monospace;
  font-size: clamp(10px, 1vh, 13px);
  font-weight: 700;
  color: rgba(200, 220, 255, 0.75);
  border-left: 1px solid rgba(255,255,255,0.25);
  padding-left: 0.7vw;
  letter-spacing: 0.06em;
}

/* Main Timing Bar */
.main-bar {
  display: flex;
  align-items: stretch;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 0 0.6vw 0 0;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.split-wrapper:not([data-has-footer="true"]) .main-bar {
  border-radius: 0 0.6vw 0.6vw 0.6vw;
}

/* Bib */
.bib-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  color: #0A0F1D;
  padding: 1.2vh 1.5vw;
  min-width: 4.8vw;
  font-size: clamp(26px, 4.4vh, 50px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Athlete Section */
.athlete-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.2vh 1.6vw 1.2vh 1.4vw;
  flex: 1;
  min-width: 14vw;
}

.flag-row {
  display: flex;
  align-items: center;
  gap: 0.45vw;
  margin-bottom: 0.2vh;
}

.flag-badge {
  font-size: clamp(16px, 2.2vh, 26px);
  line-height: 1;
  display: flex;
  align-items: center;
}

.flag-img {
  width: 1.6vw;
  height: 1.1vw;
  object-fit: cover;
  border-radius: 0.15vw;
}

.country-code {
  font-size: clamp(13px, 1.3vh, 17px);
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.8);
}

.athlete-name {
  font-size: clamp(22px, 3.4vh, 42px);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.05;
  color: #FFFFFF;
  white-space: nowrap;
  text-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.5);
}

/* Rank Block */
.rank-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1.5vw;
  background: rgba(0, 0, 0, 0.35);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-label {
  font-size: clamp(9px, 0.85vh, 12px);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1;
  margin-bottom: 0.3vh;
}

.rank-value {
  font-size: clamp(24px, 3.6vh, 42px);
  font-weight: 900;
  color: var(--accent-color);
  line-height: 1;
}

/* Split Time Block */
.time-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.6vw;
  background: rgba(0, 0, 0, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 9vw;
}

.time-label {
  font-size: clamp(9px, 0.85vh, 12px);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1;
  margin-bottom: 0.3vh;
}

.time-value {
  font-family: monospace;
  font-size: clamp(24px, 3.6vh, 42px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  line-height: 1;
}

/* Delta Badge (Green for ahead, Red for behind) */
.delta-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1.8vw;
  min-width: 9.5vw;
  color: #0A0F1D;
  background-color: var(--color-green);
  transition: background-color 0.25s ease;
  position: relative;
  overflow: hidden;
}

.delta-box[data-status="behind"] {
  background-color: var(--color-red);
  color: #FFFFFF;
}

.delta-label {
  font-size: clamp(9px, 0.85vh, 12px);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.85;
  line-height: 1;
  margin-bottom: 0.2vh;
}

.delta-value {
  font-family: monospace;
  font-size: clamp(24px, 3.8vh, 44px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}

/* Photocell Flash Flare Overlay */
.beam-flash-overlay {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
}

/* HIGH-VISIBILITY LEADER REFERENCE SHELF */
.footer-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 10, 20, 0.98);
  border: 1px solid var(--panel-border);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 0.6vw 0.6vw;
  padding: 0.7vh 1.4vw;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 1vh 3vh rgba(0, 0, 0, 0.7);
}

.leader-ref {
  display: flex;
  align-items: center;
  gap: 0.9vw;
}

.leader-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45vw;
  background: rgba(255, 184, 0, 0.25);
  border: 1px solid rgba(255, 184, 0, 0.75);
  color: var(--gold);
  font-size: clamp(11px, 1.2vh, 15px);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.35vh 0.8vw;
  border-radius: 0.3vw;
  line-height: 1;
  white-space: nowrap;
}

.leader-dot {
  width: 0.5vw;
  height: 0.5vw;
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  background-color: var(--gold);
  box-shadow: 0 0 0.6vw var(--gold);
}

.leader-name {
  font-size: clamp(16px, 2.1vh, 26px);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #FFFFFF;
  text-shadow: 0 0.2vh 0.6vh rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.leader-time {
  font-family: monospace;
  font-size: clamp(16px, 2.1vh, 26px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.25vh 0.8vw;
  border-radius: 0.3vw;
  line-height: 1;
  white-space: nowrap;
  box-shadow: inset 0 0.1vh 0.4vh rgba(0,0,0,0.5);
}

.speed-box {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: clamp(12px, 1.3vh, 16px);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.35vh 0.8vw;
  border-radius: 0.3vw;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
`;

class RaceSplitTime extends HTMLElement {
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

    const wrapper = document.createElement("div");
    wrapper.className = "split-wrapper";
    wrapper.setAttribute("data-has-footer", "true");

    // Top strip
    const checkpointStrip = document.createElement("div");
    checkpointStrip.className = "checkpoint-strip";
    const pulseIndicator = document.createElement("span");
    pulseIndicator.className = "pulse-indicator";
    const checkpointLabel = document.createElement("span");
    checkpointLabel.className = "checkpoint-label";
    const sectorNote = document.createElement("span");
    sectorNote.className = "sector-note";
    checkpointStrip.append(pulseIndicator, checkpointLabel, sectorNote);

    // Main bar
    const mainBar = document.createElement("div");
    mainBar.className = "main-bar";

    // Bib
    const bibBox = document.createElement("div");
    bibBox.className = "bib-box";
    const bibVal = document.createElement("span");
    bibBox.append(bibVal);

    // Athlete Info
    const athleteBox = document.createElement("div");
    athleteBox.className = "athlete-box";
    const flagRow = document.createElement("div");
    flagRow.className = "flag-row";
    const flagBadge = document.createElement("span");
    flagBadge.className = "flag-badge";
    const countryCode = document.createElement("span");
    countryCode.className = "country-code";
    flagRow.append(flagBadge, countryCode);
    const athleteName = document.createElement("div");
    athleteName.className = "athlete-name";
    athleteBox.append(flagRow, athleteName);

    // Rank
    const rankBox = document.createElement("div");
    rankBox.className = "rank-box";
    const rankLabel = document.createElement("span");
    rankLabel.className = "rank-label";
    rankLabel.textContent = "RANK";
    const rankValue = document.createElement("span");
    rankValue.className = "rank-value";
    rankBox.append(rankLabel, rankValue);

    // Time
    const timeBox = document.createElement("div");
    timeBox.className = "time-box";
    const timeLabel = document.createElement("span");
    timeLabel.className = "time-label";
    timeLabel.textContent = "SPLIT";
    const timeValue = document.createElement("span");
    timeValue.className = "time-value";
    timeBox.append(timeLabel, timeValue);

    // Delta
    const deltaBox = document.createElement("div");
    deltaBox.className = "delta-box";
    const deltaLabel = document.createElement("span");
    deltaLabel.className = "delta-label";
    deltaLabel.textContent = "DIFF";
    const deltaValue = document.createElement("span");
    deltaValue.className = "delta-value";
    const beamFlash = document.createElement("div");
    beamFlash.className = "beam-flash-overlay";
    deltaBox.append(deltaLabel, deltaValue, beamFlash);

    mainBar.append(bibBox, athleteBox, rankBox, timeBox, deltaBox);

    // High-visibility Leader Reference Shelf
    const footerStrip = document.createElement("div");
    footerStrip.className = "footer-strip";

    const leaderRef = document.createElement("div");
    leaderRef.className = "leader-ref";

    const leaderBadge = document.createElement("div");
    leaderBadge.className = "leader-badge";
    const leaderDot = document.createElement("span");
    leaderDot.className = "leader-dot";
    const leaderBadgeText = document.createElement("span");
    leaderBadgeText.textContent = "LEADER";
    leaderBadge.append(leaderDot, leaderBadgeText);

    const leaderName = document.createElement("span");
    leaderName.className = "leader-name";

    const leaderTime = document.createElement("span");
    leaderTime.className = "leader-time";

    leaderRef.append(leaderBadge, leaderName, leaderTime);

    const speedBox = document.createElement("div");
    speedBox.className = "speed-box";

    footerStrip.append(leaderRef, speedBox);

    wrapper.append(checkpointStrip, mainBar, footerStrip);
    scene.append(wrapper);
    root.append(style, scene);

    this._elements = {
      scene,
      wrapper,
      checkpointLabel,
      sectorNote,
      bibVal,
      flagBadge,
      countryCode,
      athleteName,
      rankValue,
      timeValue,
      deltaBox,
      deltaValue,
      beamFlash,
      footerStrip,
      leaderRef,
      leaderBadge,
      leaderBadgeText,
      leaderDot,
      leaderName,
      leaderTime,
      speedBox
    };
  }

  connectedCallback() {
    // Initial paint prevention - verified transparent
  }

  async load(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    if (this._elements.scene) {
      this._elements.scene.remove();
    }
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
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    this._applyState();
    if (!params?.skipAnimation && this._isVisible) {
      this._flashBeam();
    }
    return { statusCode: 200 };
  }

  async customAction(params) {
    if (params?.id === "flash") {
      this._flashBeam();
    }
    return { statusCode: 200 };
  }

  async goToTime(params) {
    const timestamp = params?.timestamp || 0;
    this._animations.forEach(anim => {
      anim.currentTime = timestamp;
    });
    return { statusCode: 200 };
  }

  async setActionsSchedule(params) {
    return { statusCode: 200 };
  }

  _cancelAnimations() {
    this._animations.forEach(a => a.cancel());
    this._animations = [];
  }

  _applyState() {
    const s = this._state;
    const el = this._elements;

    el.checkpointLabel.textContent = s.checkpoint || "";
    el.sectorNote.textContent = s.sectorNote || "";
    el.bibVal.textContent = s.bib || "";
    el.athleteName.textContent = s.athleteName || "";
    el.countryCode.textContent = s.countryCode || "";
    el.rankValue.textContent = s.rank || "";
    el.timeValue.textContent = s.splitTime || "";
    el.deltaValue.textContent = s.delta || "";
    el.speedBox.textContent = s.beamSpeed ? `TRAP: ${s.beamSpeed}` : "";
    el.speedBox.style.display = s.beamSpeed ? "inline-flex" : "none";

    // Determine ahead / behind styling
    const deltaStr = String(s.delta || "").trim();
    const isAhead = (s.isAhead !== undefined) ? s.isAhead : (deltaStr.startsWith("-") || deltaStr.startsWith("–"));

    el.deltaBox.setAttribute("data-status", isAhead ? "ahead" : "behind");

    // Intelligently parse and format leaderRef for crystal-clear readability
    const rawLeader = String(s.leaderRef || "").trim();
    const hasLeader = rawLeader.length > 0;
    const hasFooter = hasLeader || Boolean(s.beamSpeed);

    el.wrapper.setAttribute("data-has-footer", hasFooter ? "true" : "false");
    el.footerStrip.style.display = hasFooter ? "flex" : "none";

    if (!hasLeader) {
      el.leaderRef.style.display = "none";
    } else {
      el.leaderRef.style.display = "flex";

      let badgeLabel = "LEADER";
      let cleanText = rawLeader;

      // Extract custom prefix if present (e.g. "Leader at split:", "Prev leader:", "Leader:")
      const prefixMatch = cleanText.match(/^(leader at split|prev(?:ious)? leader|leader|target|benchmark):\s*/i);
      if (prefixMatch) {
        badgeLabel = prefixMatch[1].toUpperCase();
        cleanText = cleanText.slice(prefixMatch[0].length).trim();
      } else {
        badgeLabel = isAhead ? "LEADER AT SPLIT" : "LEADER";
      }

      // Check if time is at the end (e.g. "18:42.30" or "+0.45")
      const timeMatch = cleanText.match(/\s+([+-]?\d+(?::\d+)*(?:\.\d+)?)\s*$/);
      if (timeMatch) {
        el.leaderTime.textContent = timeMatch[1];
        el.leaderTime.style.display = "inline-block";
        el.leaderName.textContent = cleanText.slice(0, cleanText.length - timeMatch[0].length).trim();
      } else {
        el.leaderTime.style.display = "none";
        el.leaderName.textContent = cleanText;
      }

      el.leaderBadgeText.textContent = badgeLabel;
    }

    // Flag handling
    el.flagBadge.innerHTML = "";
    if (s.countryFlag) {
      if (s.countryFlag.startsWith("http") || s.countryFlag.startsWith("data:") || s.countryFlag.endsWith(".png") || s.countryFlag.endsWith(".svg")) {
        const img = document.createElement("img");
        img.className = "flag-img";
        img.src = s.countryFlag;
        img.alt = s.countryCode || "";
        el.flagBadge.append(img);
      } else {
        el.flagBadge.textContent = s.countryFlag;
      }
    }

    if (s.accentColor) {
      this.style.setProperty("--accent-color", s.accentColor);
    }
  }

  _flashBeam() {
    const { beamFlash, deltaBox } = this._elements;
    beamFlash.animate([
      { opacity: 0.9 },
      { opacity: 0 }
    ], {
      duration: 350,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });

    deltaBox.animate([
      { transform: "scale(1.06)" },
      { transform: "scale(1)" }
    ], {
      duration: 350,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });
  }

  async _animateIn(skip) {
    if (this._isVisible) return;
    this._isVisible = true;

    const { scene, wrapper } = this._elements;

    if (skip) {
      scene.style.opacity = "1";
      wrapper.style.opacity = "1";
      wrapper.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    this._cancelAnimations();
    scene.style.opacity = "1";

    const anim = wrapper.animate([
      { transform: "translate3d(0, 60px, 0)", opacity: 0 },
      { transform: "translate3d(0, 0, 0)", opacity: 1 }
    ], {
      duration: 450,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    });

    this._animations.push(anim);
    this._flashBeam();
    await anim.finished;
  }

  async _animateOut(skip) {
    if (!this._isVisible) return;
    this._isVisible = false;

    const { scene, wrapper } = this._elements;

    if (skip) {
      scene.style.opacity = "0";
      wrapper.style.opacity = "0";
      wrapper.style.transform = "translate3d(0, 50px, 0)";
      return;
    }

    this._cancelAnimations();
    const anim = wrapper.animate([
      { transform: "translate3d(0, 0, 0)", opacity: 1 },
      { transform: "translate3d(0, 40px, 0)", opacity: 0 }
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

export default RaceSplitTime;
