/**
 * Boxing Title Graphic
 * High energy A vs B title screen.
 */

const DEFAULT_STATE = {
    fighterA: "ROCKY",
    fighterB: "APOLLO",
    matchTitle: "HEAVYWEIGHT CHAMPIONSHIP",
    fighterAColor: "#d32f2f",
    fighterBColor: "#1976d2"
};

const STYLE_TEXT = `
:host {
    position: absolute;
    inset: 0;
    display: block;
    pointer-events: none;
    font-family: "Impact", "Arial Black", sans-serif;
    --fighter-a-color: #d32f2f;
    --fighter-b-color: #1976d2;
    --text-primary: #ffffff;
}

* { box-sizing: border-box; }

.scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /*background: radial-gradient(circle at center, #222, #000);*/
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    will-change: opacity;
}

.fighter-container {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
}

.fighter-a {
    left: 0;
    background: linear-gradient(135deg, rgba(0,0,0,1), rgba(90,90,90,1));
    transform: translateX(-100%);
    border-right: 5px solid var(--fighter-a-color);
}

.fighter-b {
    right: 0;
    background: linear-gradient(-135deg, rgba(0,0,0,1), rgba(90,90,90,1));
    transform: translateX(100%);
    border-left: 5px solid var(--fighter-b-color);
}

.fighter-name {
    font-size: 150px;
    text-transform: uppercase;
    color: white;
    text-shadow: 0 10px 20px rgba(0,0,0,0.5);
    white-space: nowrap;
    position: relative;
    z-index: 2;
    font-style: italic;
}

.fighter-a .fighter-name { color: var(--fighter-a-color); text-shadow: 4px 4px 0 #fff; }
.fighter-b .fighter-name { color: var(--fighter-b-color); text-shadow: -4px 4px 0 #fff; }

.vs-badge {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 100px;
    font-weight: 900;
    color: #ffeb3b;
    z-index: 10;
    text-shadow: 0 0 20px rgba(255, 235, 59, 0.8);
    font-family: "Brush Script MT", cursive;
}

.match-title {
    position: absolute;
    top: 10%;
    width: 100%;
    text-align: center;
    font-size: 40px;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 10px;
    opacity: 0;
    transform: translateY(-50px);
}

/* Animations */
.shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate(-1px, 0); }
  20%, 80% { transform: translate(2px, 0); }
  30%, 50%, 70% { transform: translate(-4px, 0); }
  40%, 60% { transform: translate(4px, 0); }
}
`;

class BoxingTitle extends HTMLElement {
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

        // Fighter A
        const fighterAContainer = document.createElement("div");
        fighterAContainer.className = "fighter-container fighter-a";
        const fighterAName = document.createElement("div");
        fighterAName.className = "fighter-name";
        fighterAContainer.append(fighterAName);

        // Fighter B
        const fighterBContainer = document.createElement("div");
        fighterBContainer.className = "fighter-container fighter-b";
        const fighterBName = document.createElement("div");
        fighterBName.className = "fighter-name";
        fighterBContainer.append(fighterBName);

        // VS Badge
        const vsBadge = document.createElement("div");
        vsBadge.className = "vs-badge";
        vsBadge.textContent = "VS";

        // Match Title
        const matchTitle = document.createElement("div");
        matchTitle.className = "match-title";

        scene.append(fighterAContainer, fighterBContainer, vsBadge, matchTitle);
        root.append(style, scene);

        this._elements = {
            scene,
            fighterAContainer, fighterAName,
            fighterBContainer, fighterBName,
            vsBadge, matchTitle
        };
    }

    connectedCallback() {}

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
        this._animations.forEach(anim => {
            anim.currentTime = time;
        });
        return { statusCode: 200 };
    }

    _cancelAnimations() {
         this._animations.forEach(a => a.cancel());
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

    _applyState() {
        const { fighterA, fighterB, matchTitle, fighterAColor, fighterBColor } = this._state;
        const el = this._elements;

        el.fighterAName.textContent = fighterA;
        el.fighterBName.textContent = fighterB;
        el.matchTitle.textContent = matchTitle;

        if (fighterAColor) this.style.setProperty("--fighter-a-color", fighterAColor);
        if (fighterBColor) this.style.setProperty("--fighter-b-color", fighterBColor);
    }

    async _animateIn(skip) {
        if (this._isVisible) return;
        this._isVisible = true;

        const { scene, fighterAContainer, fighterBContainer, vsBadge, matchTitle } = this._elements;

        if (skip) {
            scene.style.opacity = "1";
            fighterAContainer.style.transform = "translateX(0)";
            fighterBContainer.style.transform = "translateX(0)";
            vsBadge.style.transform = "translate(-50%, -50%) scale(1)";
            matchTitle.style.opacity = "1";
            matchTitle.style.transform = "translateY(0)";
            return;
        }

        scene.style.opacity = "1";
        this._cancelAnimations();

        // Simultaneous crash in
        const duration = 600;
        const easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";

        const anim1 = fighterAContainer.animate([
            { transform: "translateX(-100%)" },
            { transform: "translateX(0)" }
        ], { duration, easing, fill: "forwards" });
        this._animations.push(anim1);

        const anim2 = fighterBContainer.animate([
            { transform: "translateX(100%)" },
            { transform: "translateX(0)" }
        ], { duration, easing, fill: "forwards" });
        this._animations.push(anim2);

        await Promise.all([anim1.finished, anim2.finished]);

        // Camera shake
        scene.classList.add("shake");
        setTimeout(() => scene.classList.remove("shake"), 500);

        // VS Badge explode in
        const anim3 = vsBadge.animate([
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
            { transform: "translate(-50%, -50%) scale(1.5)", opacity: 1, offset: 0.6 },
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 }
        ], { duration: 400, delay: 100, fill: "forwards", easing: "ease-out" });
        this._animations.push(anim3);

        // Title fade in
        const anim4 = matchTitle.animate([
            { transform: "translateY(-50px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 }
        ], { duration: 500, delay: 300, fill: "forwards", easing: "ease-out" });
        this._animations.push(anim4);
    }

    async _animateOut(skip) {
        if (!this._isVisible) return;
        this._isVisible = false;

        const { scene, fighterAContainer, fighterBContainer, vsBadge, matchTitle } = this._elements;

        if (skip) {
            scene.style.opacity = "0";
            return;
        }

        const duration = 400;
        const easing = "cubic-bezier(0.4, 0, 1, 1)";

        this._cancelAnimations();

        const anim1 = fighterAContainer.animate([
            { transform: "translateX(0)" },
            { transform: "translateX(-100%)" }
        ], { duration, easing, fill: "forwards" });
        this._animations.push(anim1);

        const anim2 = fighterBContainer.animate([
            { transform: "translateX(0)" },
            { transform: "translateX(100%)" }
        ], { duration, easing, fill: "forwards" });
        this._animations.push(anim2);

        const anim3 = vsBadge.animate([
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0 }
        ], { duration: 300, fill: "forwards" });
        this._animations.push(anim3);

        const anim4 = matchTitle.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 300, fill: "forwards" });
        this._animations.push(anim4);

        await Promise.all([anim1.finished, anim2.finished]);
        scene.style.opacity = "0";
    }
}

export default BoxingTitle;
