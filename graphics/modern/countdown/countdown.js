const DEFAULT_STATE = {
  mode: "duration", // "timestamp", "clock", "duration"
  targetTime: Date.now() + 60000,
  duration: 60,
  countdownLabel: "STARTS IN",
  openUpUponZero: false,
  themeColor: "#d32f2f",
  textColor: "#ffffff"
};

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: "Impact", "Arial Black", sans-serif;
  --theme: #d32f2f;
  --text-color: #ffffff;
}

* { box-sizing: border-box; }

.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  will-change: opacity;
  isolation: isolate; /* Crucial for mix-blend-mode to work within the component */
  transition: opacity 0.3s ease;
}

.background {
  position: absolute;
  inset: 0;
  background: var(--theme);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 1;
}

.background::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(0, 0, 0, 0.1) 20px,
    rgba(0, 0, 0, 0.1) 40px
  );
  animation: scroll-stripes 4s linear infinite;
}

@keyframes scroll-stripes {
  from { background-position: 0 0; }
  to { background-position: 100px 0; }
}

.countdown-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transform: scale(0.8);
  will-change: transform;
  /* Text will punch out when animating out */
}

/* Modifier class for the "hole" effect */
.countdown-container.punch-hole {
    mix-blend-mode: destination-out;
}

.countdown-text {
  font-size: 250px;
  color: var(--text-color);
  line-height: 1;
  text-shadow: 10px 10px 0px rgba(0,0,0,0.2);
  letter-spacing: 10px;
  font-variant-numeric: tabular-nums;
}

.label {
    font-size: 60px;
    color: var(--text-color);
    text-transform: uppercase;
    margin-bottom: 20px;
    letter-spacing: 5px;
    background: #000;
    padding: 10px 40px;
    transform: skew(-15deg);
}
`;

class CountdownGraphic extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._isVisible = false;
    this._rafId = null;
    this._endTime = 0; // Calculated based on mode
    this._lastTickTime = 0;
    this._animations = [];
    this._hasOpened = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const scene = document.createElement("div");
    scene.className = "scene";

    const background = document.createElement("div");
    background.className = "background";

    const container = document.createElement("div");
    container.className = "countdown-container";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = "STARTS IN";

    const countdownText = document.createElement("div");
    countdownText.className = "countdown-text";
    countdownText.textContent = "00:00:00";

    container.append(label, countdownText);
    scene.append(background, container);
    root.append(style, scene);

    this._elements = { scene, background, container, label, countdownText };
  }

  connectedCallback() {}

  async load(params) {
    this._state = { ...DEFAULT_STATE, ...(params.data || {}) };
    this._applyState();
    this._calculateEndTime();
    this._tick(true); // Immediate update
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnimations();
    this._stopLoop();
    this._elements.scene.remove();
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._cancelAnimations();
    this._calculateEndTime(); // Recalculate on play to ensure accuracy
    this._hasOpened = false;

    // Reset styles that might have been changed by previous run
    this._elements.container.classList.remove("punch-hole");
    this._elements.background.style.opacity = "1";
    this._elements.container.style.transform = "scale(0.8)";
    this._elements.container.style.opacity = "1";

    this._startLoop();
    await this._animateIn(params?.skipAnimation);
    return { statusCode: 200 };
  }

  async stopAction(params) {
    await this._animateOut(params?.skipAnimation);
    this._stopLoop();
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const oldMode = this._state.mode;
    this._state = { ...this._state, ...(params.data || {}) };
    this._applyState();

    // Recalculate end time if relevant parameters changed
    if (this._state.mode !== oldMode || this._state.targetTime || this._state.duration) {
         this._calculateEndTime();
    }

    this._tick(true);
    return { statusCode: 200 };
  }

  async customAction(id, payload) {
      return { statusCode: 200 };
  }

  async setActionsSchedule(schedule) {
      return { statusCode: 200 };
  }

  async goToTime(time) {
      this._manualTime = time;

      this._animations.forEach(anim => {
          anim.currentTime = time;
      });

      if (this._state.mode === "duration") {
          const remainingMs = (this._state.duration * 1000) - time;
          this._updateDisplay(remainingMs > 0 ? remainingMs : 0);
      }

      return { statusCode: 200 };
  }

  _calculateEndTime() {
      const { mode, duration, targetTime } = this._state;
      const now = Date.now();

      if (mode === "duration") {
          this._endTime = now + (duration * 1000);
      } else if (mode === "timestamp") {
          this._endTime = targetTime;
      }
  }

  _startLoop() {
      this._stopLoop();
      const loop = () => {
          this._tick();
          this._rafId = requestAnimationFrame(loop);
      };
      this._rafId = requestAnimationFrame(loop);
  }

  _stopLoop() {
      if (this._rafId) {
          cancelAnimationFrame(this._rafId);
          this._rafId = null;
      }
  }

  _cancelAnimations() {
       this._animations.forEach(a => a.cancel());
       this._animations = [];
  }

  _tick(force = false) {
      if (!this._isVisible && !force) return;

      const { mode } = this._state;
      const now = Date.now();

      let msRemaining = 0;

      if (mode === "clock") {
          const d = new Date();
          const displayTime = d.toLocaleTimeString('en-US', { hour12: false });
          this._updateText(displayTime, "CURRENT TIME");
          return;
      } else {
          msRemaining = this._endTime - now;
          if (msRemaining < 0) msRemaining = 0;
      }

      this._updateDisplay(msRemaining);

      if (msRemaining <= 0 && this._state.openUpUponZero && !this._hasOpened) {
          this._animateOpen();
      }
  }

  _updateDisplay(ms) {
      const displayTime = this._formatTime(ms);
      this._updateText(displayTime, this._state.countdownLabel);
  }

  _updateText(timeText, labelText) {
      if (this._elements.countdownText.textContent !== timeText) {
          this._elements.countdownText.textContent = timeText;
      }
      if (this._elements.label.textContent !== labelText) {
          this._elements.label.textContent = labelText;
      }
  }

  _formatTime(ms) {
      const totalSeconds = Math.ceil(ms / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const pad = (n) => n.toString().padStart(2, "0");

      if (h > 0) {
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      }
      return `${pad(m)}:${pad(s)}`;
  }

  _applyState() {
      const { themeColor, textColor } = this._state;
      this.style.setProperty("--theme", themeColor);
      this.style.setProperty("--text-color", textColor);
  }

  async _animateIn(skip) {
    if (this._isVisible) return;
    this._isVisible = true;

    const { scene, container } = this._elements;

    if (skip) {
        scene.style.opacity = "1";
        container.style.transform = "scale(1)";
        return;
    }

    scene.style.opacity = "1";

    const anim = container.animate([
        { transform: "scale(2)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 }
    ], {
        duration: 500,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        fill: "forwards"
    });
    this._animations.push(anim);

    await anim.finished;
  }

  async _animateOut(skip) {
    if (!this._isVisible && !this._hasOpened) return;

    if (this._state.openUpUponZero && !this._hasOpened) {
        if (skip) {
            this._isVisible = false;
            this._hasOpened = true;
            this._stopLoop();
            return;
        }
        await this._animateOpen();
        return;
    }

    this._isVisible = false;
    const { scene } = this._elements;

    if (skip) {
        scene.style.opacity = "0";
        return;
    }

    const anim = scene.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 300,
        easing: "ease-in",
        fill: "forwards"
    });
    this._animations.push(anim);

    await anim.finished;
  }

  async _animateOpen() {
      if (this._hasOpened) return;
      this._hasOpened = true;

      const { container, background } = this._elements;

      this._cancelAnimations(); // Cancel existing animations like pulse/in to avoid conflicts?
      // Actually _animateIn is finished.
      // But _cancelAnimations clears this._animations array which we use to track "active" animations. Good.

      // Enable the masking
      container.classList.add("punch-hole");

      // Zoom in excessively to simulate "opening up"
      const scaleAnim = container.animate([
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(50)", opacity: 1 }
      ], {
          duration: 1000,
          easing: "ease-in",
          fill: "forwards"
      });
      this._animations.push(scaleAnim);

      // Fade out the background simultaneously
      const fadeAnim = background.animate([
          { opacity: 1 },
          { opacity: 0 }
      ], {
          duration: 500,
          easing: "ease-in",
          fill: "forwards"
      });
      this._animations.push(fadeAnim);

      await Promise.all([scaleAnim.finished, fadeAnim.finished]);

      // After opening, we are effectively invisible/done
      this._isVisible = false;
      this._stopLoop();
  }
}

export default CountdownGraphic;
