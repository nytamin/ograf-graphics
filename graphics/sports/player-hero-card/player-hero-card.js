/**
 * Player Hero Profile Card
 * High-impact profile card presenting star athletes with photo, vitals, and animated stat meters.
 * Kinetic masked card wipe, photo scale-settle, text slide-ups, staggered stat fill, and asymmetric razor slice exit.
 */

const DEFAULT_STATE = {
  name: "JUDE BELLINGHAM",
  playerNumber: "5",
  position: "ATTACKING MIDFIELDER",
  teamName: "REAL MADRID",
  vitals: "22 YRS • 1.86M • ENGLAND",
  photoUrl: "",
  stats: [
    { label: "GOALS", value: "21", percentage: 85 },
    { label: "ASSISTS", value: "12", percentage: 65 },
    { label: "CHANCES CREATED", value: "68", percentage: 90 }
  ],
  teamColor: "#eeb111"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Barlow Semi Condensed", "Rajdhani", "Roboto Condensed", sans-serif;
  --team-color: #eeb111;
  --text-main: #f0f3f8;
  --text-dim: #9aa3b4;
  --bg-panel: rgba(11, 15, 24, 0.95);
  --border-subtle: rgba(255, 255, 255, 0.14);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base Scene: Zero Initial Paint */
.scene {
  position: absolute;
  top: max(8vh, 60px);
  bottom: max(8vh, 60px);
  left: max(5vw, 65px);
  width: min(440px, 34vw);
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity, clip-path;
  display: flex;
}

.scene.active {
  opacity: 1;
  visibility: visible;
  transform: none;
  clip-path: none;
}

.scene.instant {
  animation: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  clip-path: none !important;
  transform: none !important;
}

.scene.instant * {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

.card-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
  position: relative;
}

/* Photo Hero Area */
.hero-photo-area {
  position: relative;
  height: 48%;
  background: radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08), rgba(0,0,0,0.6));
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-bottom: 2px solid var(--team-color);
}

.watermark-num {
  position: absolute;
  right: -10px;
  bottom: -20px;
  font-size: 190px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.05);
  line-height: 1;
  user-select: none;
  font-variant-numeric: tabular-nums;
  will-change: opacity, transform;
}

.player-img {
  position: absolute;
  bottom: 0;
  height: 100%;
  max-width: 90%;
  object-fit: cover;
  object-position: bottom;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
  will-change: transform, opacity;
}

.avatar-fallback {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--team-color), #111);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 42px;
  font-weight: 900;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.team-pill {
  position: absolute;
  top: 16px;
  left: 18px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--team-color);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fff;
  text-transform: uppercase;
}

/* Info & Identity Area */
.identity-area {
  padding: 16px 22px 10px;
}

.mask-wrap {
  overflow: hidden;
  display: flex;
  align-items: center;
}

.reveal-text {
  display: block;
  will-change: transform, opacity;
}

.position-tag {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--team-color);
  text-transform: uppercase;
}

.player-name {
  font-size: clamp(24px, 2.8vh, 32px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.1;
  margin: 4px 0 6px;
}

.vitals-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Stats Section */
.stats-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 8px 22px 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.3));
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  text-transform: uppercase;
}

.stat-val {
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.stat-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--team-color), #fff);
  border-radius: 3px;
  box-shadow: 0 0 8px var(--team-color);
  transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ============================================================
   IN ANIMATION CHOREOGRAPHY:
   Phase 1: Card container wipes open
   Phase 2: Photo settles and watermark fades
   Phase 3: Team pill drops and names slide up
   Phase 4: Stat rows stagger in
   ============================================================ */
.scene.anim-in {
  opacity: 1;
  visibility: visible;
}

.scene.anim-in .card-container {
  animation: heroCardWipe 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes heroCardWipe {
  0% {
    clip-path: polygon(-60px -60px, -60px -60px, -90px calc(100% + 60px), -90px calc(100% + 60px));
    opacity: 0;
    transform: translateX(-20px);
    box-shadow: 0 0 0 transparent;
  }
  100% {
    clip-path: polygon(-60px -60px, calc(100% + 60px) -60px, calc(100% + 60px) calc(100% + 60px), -60px calc(100% + 60px));
    opacity: 1;
    transform: translateX(0);
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7);
  }
}

.scene.anim-in .watermark-num {
  animation: watermarkFade 480ms ease-out 100ms backwards;
}

@keyframes watermarkFade {
  0% { opacity: 0; transform: scale(0.9) translateX(30px); }
  100% { opacity: 1; transform: scale(1) translateX(0); }
}

.scene.anim-in .player-img,
.scene.anim-in .avatar-fallback {
  animation: photoZoomIn 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

@keyframes photoZoomIn {
  0% { transform: scale(1.08); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.scene.anim-in .team-pill {
  animation: teamPillDrop 380ms cubic-bezier(0.16, 1, 0.3, 1) 140ms backwards;
}

@keyframes teamPillDrop {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .reveal-text {
  animation: heroTextSlide 380ms cubic-bezier(0.16, 1, 0.3, 1) 160ms backwards;
}

@keyframes heroTextSlide {
  0% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.scene.anim-in .stat-row {
  animation: statRowFade 360ms ease-out backwards;
}
.scene.anim-in .stat-row:nth-child(1) { animation-delay: 200ms; }
.scene.anim-in .stat-row:nth-child(2) { animation-delay: 240ms; }
.scene.anim-in .stat-row:nth-child(3) { animation-delay: 280ms; }

@keyframes statRowFade {
  0% { opacity: 0; transform: translateX(-15px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* ============================================================
   OUT ANIMATION:
   Card lateral razor slice exit (210ms)
   ============================================================ */
.scene.anim-out {
  opacity: 1;
  visibility: visible;
}

.scene.anim-out .card-container {
  animation: heroCardOut 210ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes heroCardOut {
  0% {
    clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 100% 0 0);
    transform: translateX(-40px);
    opacity: 0;
  }
}
`;

class ApexPlayerHeroCard extends HTMLElement {
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
    scene.innerHTML = `
      <div class="card-container">
        <div class="hero-photo-area">
          <span class="watermark-num" id="watermarkNum"></span>
          <div class="team-pill" id="teamPill"></div>
          <div id="photoContainer" style="height:100%; width:100%; display:flex; justify-content:center; align-items:flex-end;"></div>
        </div>

        <div class="identity-area">
          <div class="mask-wrap"><div class="position-tag reveal-text" id="position"></div></div>
          <div class="mask-wrap"><div class="player-name reveal-text" id="name"></div></div>
          <div class="mask-wrap"><div class="vitals-text reveal-text" id="vitals"></div></div>
        </div>

        <div class="stats-area">
          <!-- Stat 1 -->
          <div class="stat-row">
            <div class="stat-header">
              <span class="stat-label" id="stat1Label"></span>
              <span class="stat-val" id="stat1Val"></span>
            </div>
            <div class="stat-bar-track"><div class="stat-bar-fill" id="stat1Bar"></div></div>
          </div>

          <!-- Stat 2 -->
          <div class="stat-row">
            <div class="stat-header">
              <span class="stat-label" id="stat2Label"></span>
              <span class="stat-val" id="stat2Val"></span>
            </div>
            <div class="stat-bar-track"><div class="stat-bar-fill" id="stat2Bar"></div></div>
          </div>

          <!-- Stat 3 -->
          <div class="stat-row">
            <div class="stat-header">
              <span class="stat-label" id="stat3Label"></span>
              <span class="stat-val" id="stat3Val"></span>
            </div>
            <div class="stat-bar-track"><div class="stat-bar-fill" id="stat3Bar"></div></div>
          </div>
        </div>
      </div>
    `;

    root.append(style, scene);

    this._elements = {
      scene,
      card: scene.querySelector(".card-container"),
      watermarkNum: scene.querySelector("#watermarkNum"),
      teamPill: scene.querySelector("#teamPill"),
      photoContainer: scene.querySelector("#photoContainer"),
      position: scene.querySelector("#position"),
      name: scene.querySelector("#name"),
      vitals: scene.querySelector("#vitals"),
      stat1Label: scene.querySelector("#stat1Label"),
      stat1Val: scene.querySelector("#stat1Val"),
      stat1Bar: scene.querySelector("#stat1Bar"),
      stat2Label: scene.querySelector("#stat2Label"),
      stat2Val: scene.querySelector("#stat2Val"),
      stat2Bar: scene.querySelector("#stat2Bar"),
      stat3Label: scene.querySelector("#stat3Label"),
      stat3Val: scene.querySelector("#stat3Val"),
      stat3Bar: scene.querySelector("#stat3Bar")
    };
  }

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params?.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async dispose() {
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  _waitForAnimation(el, fallbackMs = 520) {
    return new Promise(resolve => {
      let resolved = false;
      const onEnd = (e) => {
        if (e && e.target !== el && e.target !== this._elements.card) {
          return;
        }
        if (resolved) return;
        resolved = true;
        el.removeEventListener("animationend", onEnd);
        resolve();
      };
      el.addEventListener("animationend", onEnd);
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener("animationend", onEnd);
        resolve();
      }, fallbackMs);
    });
  }

  async playAction(params) {
    const skip = params?.skipAnimation === true;
    const { scene } = this._elements;
    this._isVisible = true;

    if (skip) {
      scene.className = "scene active instant";
      this._currentStep = 1;
      this._animateBars();
      return { statusCode: 200, currentStep: 1 };
    }

    scene.className = "scene anim-in";
    setTimeout(() => this._animateBars(), 220);
    await this._waitForAnimation(scene, 520);
    scene.className = "scene active";
    this._currentStep = 1;
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    const skip = params?.skipAnimation === true;
    const { scene } = this._elements;
    this._isVisible = false;
    this._resetBars();

    if (skip) {
      scene.className = "scene";
      this._currentStep = undefined;
      return { statusCode: 200 };
    }

    scene.className = "scene anim-out";
    await this._waitForAnimation(scene, 240);
    scene.className = "scene";
    this._currentStep = undefined;
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params?.data || {}) };
    this._applyState();
    if (this._isVisible) {
      this._animateBars();
    }
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

  _animateBars() {
    const { stats, stat1Pct, stat2Pct, stat3Pct } = this._state;
    const el = this._elements;
    const p1 = stats?.[0]?.percentage ?? stat1Pct ?? 0;
    const p2 = stats?.[1]?.percentage ?? stat2Pct ?? 0;
    const p3 = stats?.[2]?.percentage ?? stat3Pct ?? 0;
    el.stat1Bar.style.width = `${Math.min(100, Math.max(0, p1))}%`;
    el.stat2Bar.style.width = `${Math.min(100, Math.max(0, p2))}%`;
    el.stat3Bar.style.width = `${Math.min(100, Math.max(0, p3))}%`;
  }

  _resetBars() {
    const el = this._elements;
    el.stat1Bar.style.width = "0%";
    el.stat2Bar.style.width = "0%";
    el.stat3Bar.style.width = "0%";
  }

  _applyState() {
    const {
      name, playerNumber, position, teamName, vitals, photoUrl,
      stats, stat1Label, stat1Val, stat1Pct, stat2Label, stat2Val, stat2Pct, stat3Label, stat3Val, stat3Pct, teamColor
    } = this._state;
    const el = this._elements;

    el.name.textContent = name || "";
    el.watermarkNum.textContent = playerNumber || "";
    el.position.textContent = position || "";
    el.teamPill.textContent = teamName || "";
    el.vitals.textContent = vitals || "";

    const s1 = stats?.[0] || { label: stat1Label || "GOALS", value: stat1Val || "0", percentage: stat1Pct ?? 85 };
    const s2 = stats?.[1] || { label: stat2Label || "ASSISTS", value: stat2Val || "0", percentage: stat2Pct ?? 65 };
    const s3 = stats?.[2] || { label: stat3Label || "CHANCES CREATED", value: stat3Val || "0", percentage: stat3Pct ?? 90 };

    el.stat1Label.textContent = s1.label || "STAT 1";
    el.stat1Val.textContent = String(s1.value ?? "0");
    el.stat2Label.textContent = s2.label || "STAT 2";
    el.stat2Val.textContent = String(s2.value ?? "0");
    el.stat3Label.textContent = s3.label || "STAT 3";
    el.stat3Val.textContent = String(s3.value ?? "0");

    if (teamColor) {
      this.style.setProperty("--team-color", teamColor);
    }

    el.photoContainer.innerHTML = "";
    if (photoUrl) {
      const img = document.createElement("img");
      img.className = "player-img";
      img.src = photoUrl;
      img.alt = name;
      el.photoContainer.append(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "avatar-fallback";
      fb.textContent = (playerNumber || (name ? name.substring(0, 1) : "★"));
      el.photoContainer.append(fb);
    }
  }
}

export default ApexPlayerHeroCard;
