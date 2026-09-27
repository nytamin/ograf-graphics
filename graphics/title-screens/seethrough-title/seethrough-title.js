/**
 * OGraf Seethrough Title
 *
 * Centered BIG title (multiline) and subtitle (multiline) with dynamic font fitting.
 *
 * In-animation (playAction):
 *   - The entire text moves as ONE unified piece.
 *   - Programmatically selects the middle letter and renders it into an off-screen
 *     canvas with distance transformation to find a guaranteed transparent region inside
 *     or adjacent to the middle letter (e.g. letter counter/pocket).
 *   - Starts zoomed into this transparent pocket at an adaptive scale such that NO text
 *     pixels are inside the viewport on the first frame.
 *   - Zooms smoothly down to normal size into the exact center.
 *   - The background waits until the text is completely in place before it animates in.
 *
 * Out-animation (stopAction):
 *   - The text animates to transparent, cutting a hole in the background to reveal
 *     whatever is behind.
 *   - Programmatically locates a point covered by the middle letter's solid color
 *     (deepest inside the stroke).
 *   - Accelerates outward through this covered point so the cutout expands until all
 *     background color is cleared from the viewport.
 *
 * State guards:
 *   - After play, an additional play does nothing (unless stop has run).
 *   - After stop, an additional stop does nothing (unless play has run).
 */

const DEFAULT_STATE = {
  title: "SEETHROUGH\nTITLE",
  subtitle: "CONNECTED MOTION & GRAPHIC REVEAL",
  font: "Montserrat",
  fontColor: "#ffffff",
  backgroundColor: "#0f172a",
  animationSpeed: "medium",
};

const SPEED_DURATIONS = {
  quick: 1000,
  medium: 2000,
  slow: 4000,
};

// Out-animation zoom phase runs at this multiple of the configured speed duration,
// making the zoom noticeably slower and more cinematic than the in-animation.
const STOP_DURATION_MULTIPLIER = 2.0;

const MAX_ZOOM_SCALE = 160.0;

const FONTS = {
  Montserrat: {
    family: "'Montserrat', sans-serif",
    weight: "900",
    subWeight: "600",
  },
  Anton: {
    family: "'Anton', sans-serif",
    weight: "400",
    subWeight: "400",
  },
  "Bebas Neue": {
    family: "'Bebas Neue', sans-serif",
    weight: "400",
    subWeight: "400",
  },
  Oswald: {
    family: "'Oswald', sans-serif",
    weight: "700",
    subWeight: "500",
  },
  "Playfair Display": {
    family: "'Playfair Display', serif",
    weight: "900",
    subWeight: "600",
  },
  Syne: {
    family: "'Syne', sans-serif",
    weight: "800",
    subWeight: "600",
  },
  Michroma: {
    family: "'Michroma', sans-serif",
    weight: "400",
    subWeight: "400",
  },
  "Berkshire Swash": {
    family: "'Berkshire Swash', cursive",
    weight: "400",
    subWeight: "400",
  },
  Limelight: {
    family: "'Limelight', display",
    weight: "400",
    subWeight: "400",
  },
  Smokum: {
    family: "'Smokum', display",
    weight: "400",
    subWeight: "400",
  },
};

const LOCAL_FONT_FACES = {
  Montserrat: {
    url: new URL("./fonts/Montserrat-Variable.woff2", import.meta.url).href,
    weight: "600 900",
  },
  Anton: {
    url: new URL("./fonts/Anton-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
  "Bebas Neue": {
    url: new URL("./fonts/Bebas-Neue-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
  Oswald: {
    url: new URL("./fonts/Oswald-Variable.woff2", import.meta.url).href,
    weight: "500 700",
  },
  "Playfair Display": {
    url: new URL("./fonts/Playfair-Display-Variable.woff2", import.meta.url).href,
    weight: "600 900",
  },
  Syne: {
    url: new URL("./fonts/Syne-Variable.woff2", import.meta.url).href,
    weight: "600 800",
  },
  Michroma: {
    url: new URL("./fonts/Michroma-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
  "Berkshire Swash": {
    url: new URL("./fonts/Berkshire-Swash-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
  Limelight: {
    url: new URL("./fonts/Limelight-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
  Smokum: {
    url: new URL("./fonts/Smokum-Regular.woff2", import.meta.url).href,
    weight: "400",
  },
};

const LOCAL_FONT_LOADS = new Map();

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
  width: 100%;
  height: 100%;
  opacity: 0;
  will-change: opacity;
}

.char-text {
  text-anchor: middle;
  dominant-baseline: middle;
  user-select: none;
}

.sub-text {
  text-anchor: middle;
  dominant-baseline: middle;
  user-select: none;
}
`;

class OgrafSeethroughTitle extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    // Play states: "stopped" | "playing" | "played" | "stopping"
    this._playState = "stopped";
    this._activeRaf = null;
    this._resolveAction = null;
    this._maskUid = "mask-" + Math.random().toString(36).slice(2, 9);

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;
    root.appendChild(style);

    this._stage = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._stage.setAttribute("class", "stage");
    this._stage.setAttribute("viewBox", "0 0 1920 1080");
    this._stage.setAttribute("preserveAspectRatio", "xMidYMid meet");

    this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    this._mask.setAttribute("id", this._maskUid);
    this._mask.setAttribute("maskUnits", "userSpaceOnUse");
    this._mask.setAttribute("x", "-6000");
    this._mask.setAttribute("y", "-6000");
    this._mask.setAttribute("width", "14000");
    this._mask.setAttribute("height", "14000");

    this._maskWhiteBase = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this._maskWhiteBase.setAttribute("x", "-6000");
    this._maskWhiteBase.setAttribute("y", "-6000");
    this._maskWhiteBase.setAttribute("width", "14000");
    this._maskWhiteBase.setAttribute("height", "14000");
    this._maskWhiteBase.setAttribute("fill", "white");
    this._mask.appendChild(this._maskWhiteBase);

    this._maskCutout = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._maskCutout.setAttribute("fill", "black");

    this._maskZoomGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._maskCutout.appendChild(this._maskZoomGroup);

    this._mask.appendChild(this._maskCutout);
    this._defs.appendChild(this._mask);
    this._stage.appendChild(this._defs);

    this._bgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this._bgRect.setAttribute("x", "0");
    this._bgRect.setAttribute("y", "0");
    this._bgRect.setAttribute("width", "1920");
    this._bgRect.setAttribute("height", "1080");
    this._bgRect.setAttribute("fill", this._state.backgroundColor);
    this._bgRect.setAttribute("mask", `url(#${this._maskUid})`);
    this._bgRect.setAttribute("opacity", "0");
    this._stage.appendChild(this._bgRect);

    // Single unified text group for all text elements
    this._fgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this._fgGroup.setAttribute("opacity", "0");

    this._fgTitleGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._fgSubtitleGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    this._fgGroup.appendChild(this._fgTitleGroup);
    this._fgGroup.appendChild(this._fgSubtitleGroup);
    this._stage.appendChild(this._fgGroup);

    root.appendChild(this._stage);

    this._layout = null;
    this._measureCanvas = document.createElement("canvas");
    this._measureCtx =
      this._measureCanvas.getContext("2d", { willReadFrequently: true }) ||
      this._measureCanvas.getContext("2d");

    this._computeLayout();
  }

  async load(params) {
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }
    await this._loadFont();
    this._computeLayout();
    this._resetToTransparent();
    this._playState = "stopped";
    return { statusCode: 200 };
  }

  async dispose() {
    this._cancelAnim();
    this._resetToTransparent();
    this._playState = "stopped";
    return { statusCode: 200 };
  }

  async playAction(params) {
    // State guard: after play, an additional play does nothing (unless stop has run)
    if (this._playState === "played" || this._playState === "playing") {
      return { statusCode: 200, currentStep: 0 };
    }

    this._cancelAnim();
    await this._loadFont();
    this._computeLayout();

    const skip = Boolean(params && params.skipAnimation);
    if (skip) {
      this._playState = "played";
      this._applyStaticVisible();
      return { statusCode: 200, currentStep: 0 };
    }

    const duration = SPEED_DURATIONS[this._state.animationSpeed] || 2000;
    this._playState = "playing";

    return new Promise((resolve) => {
      this._resolveAction = (res) => {
        this._playState = "played";
        resolve(res);
      };
      this._runPlayAnimation(duration);
    });
  }

  async startAction(params) {
    return this.playAction(params);
  }

  async stopAction(params) {
    // State guard: after stop, an additional stop does nothing (unless play has run)
    if (this._playState === "stopped" || this._playState === "stopping") {
      return { statusCode: 200 };
    }

    this._cancelAnim();

    const skip = Boolean(params && params.skipAnimation);
    if (skip) {
      this._playState = "stopped";
      this._resetToTransparent();
      return { statusCode: 200 };
    }

    const duration = (SPEED_DURATIONS[this._state.animationSpeed] || 2000) * STOP_DURATION_MULTIPLIER;
    this._playState = "stopping";

    return new Promise((resolve) => {
      this._resolveAction = (res) => {
        this._playState = "stopped";
        resolve(res);
      };
      this._runStopAnimation(duration);
    });
  }

  async updateAction(params) {
    const prevFont = this._state.font;
    if (params && params.data) {
      this._state = { ...this._state, ...params.data };
    }

    if (this._state.font !== prevFont) {
      await this._loadFont();
    }

    this._computeLayout();

    if (this._playState === "played") {
      this._applyStaticVisible();
    }
    return { statusCode: 200 };
  }

  async customAction(params) {
    if (params && (params.id === "startAction" || params.id === "playAction")) {
      return this.playAction(params.payload || {});
    }
    if (params && params.id === "stopAction") {
      return this.stopAction(params.payload || {});
    }
    return { statusCode: 200 };
  }

  async goToTime() {
    return { statusCode: 200 };
  }

  async setActionsSchedule() {
    return { statusCode: 200 };
  }

  async _loadFont() {
    if (document.fonts && document.fonts.load) {
      try {
        const localFont = LOCAL_FONT_FACES[this._state.font];
        if (localFont) {
          let fontLoad = LOCAL_FONT_LOADS.get(this._state.font);
          if (!fontLoad) {
            fontLoad = new FontFace(
              this._state.font,
              `url("${localFont.url}")`,
              { weight: localFont.weight }
            )
              .load()
              .then((fontFace) => document.fonts.add(fontFace))
              .catch((error) => {
                LOCAL_FONT_LOADS.delete(this._state.font);
                throw error;
              });
            LOCAL_FONT_LOADS.set(this._state.font, fontLoad);
          }
          await fontLoad;
        } else {
          const fontCfg = FONTS[this._state.font] || FONTS.Montserrat;
          await Promise.all([
            document.fonts.load(`${fontCfg.weight} 48px ${fontCfg.family}`),
            document.fonts.load(
              `${fontCfg.subWeight || "600"} 48px ${fontCfg.family}`
            ),
          ]);
        }
      } catch (error) {
        console.error(`Failed to load ${this._state.font}; using fallback font.`, error);
      }
    }
  }

  _cancelAnim() {
    if (this._activeRaf) {
      cancelAnimationFrame(this._activeRaf);
      this._activeRaf = null;
    }
    if (this._resolveAction) {
      const resolve = this._resolveAction;
      this._resolveAction = null;
      resolve({ statusCode: 200, currentStep: 0 });
    }
  }

  _resetToTransparent() {
    this._stage.style.opacity = "0";
    this._bgRect.setAttribute("opacity", "0");
    this._fgGroup.setAttribute("opacity", "0");
    this._fgGroup.removeAttribute("transform");
    this._maskZoomGroup.innerHTML = "";
  }

  _computeLayout() {
    const fontCfg = FONTS[this._state.font] || FONTS.Montserrat;
    const ctx = this._measureCtx;

    const rawTitleLines = String(this._state.title || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l, i, arr) => l.length > 0 || (i === 0 && arr.length === 1));

    const titleLines =
      rawTitleLines.length > 0 ? rawTitleLines : ["SEETHROUGH TITLE"];

    const rawSubLines = String(this._state.subtitle || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const subRatio = 0.36;
    const maxBoxW = 1600;
    const maxBoxH = 780;

    ctx.font = `${fontCfg.weight} 100px ${fontCfg.family}`;
    const titleLineWidths100 = titleLines.map((l) => ctx.measureText(l).width);
    const maxTitleW100 = Math.max(...titleLineWidths100, 10);

    ctx.font = `${fontCfg.subWeight} 100px ${fontCfg.family}`;
    const subLineWidths100 = rawSubLines.map((l) => ctx.measureText(l).width);
    const maxSubW100 =
      subLineWidths100.length > 0 ? Math.max(...subLineWidths100, 10) : 0;

    const titleH100 = titleLines.length * 94;
    const gap100 = rawSubLines.length > 0 ? 20 : 0;
    const subH100 = rawSubLines.length * (subRatio * 112);
    const totalH100 = titleH100 + gap100 + subH100;
    const totalW100 = Math.max(maxTitleW100, maxSubW100 * subRatio);

    const scaleFromW = maxBoxW / (totalW100 / 100);
    const scaleFromH = maxBoxH / (totalH100 / 100);
    let titleFontSize = Math.min(scaleFromW, scaleFromH);
    titleFontSize = Math.min(Math.max(titleFontSize, 36), 210);

    let subtitleFontSize = Math.round(titleFontSize * subRatio);
    subtitleFontSize = Math.min(
      Math.max(subtitleFontSize, 20),
      Math.round(titleFontSize * 0.44)
    );

    const titleLineH = titleFontSize * 0.94;
    const subLineH = subtitleFontSize * 1.12;
    const gap =
      rawSubLines.length > 0
        ? Math.max(14, Math.round(titleFontSize * 0.20))
        : 0;

    const totalHeight =
      titleLines.length * titleLineH +
      (rawSubLines.length > 0 ? gap + rawSubLines.length * subLineH : 0);

    const startY = 540 - totalHeight / 2 + titleLineH / 2;

    const characters = [];
    ctx.font = `${fontCfg.weight} ${titleFontSize}px ${fontCfg.family}`;

    titleLines.forEach((line, lineIndex) => {
      const lineW = ctx.measureText(line).width;
      const startX = 960 - lineW / 2;
      const lineY = startY + lineIndex * titleLineH;

      for (let j = 0; j < line.length; j++) {
        const beforeW = ctx.measureText(line.slice(0, j)).width;
        const charW = ctx.measureText(line[j]).width;
        const charX = startX + beforeW + charW / 2;

        characters.push({
          char: line[j],
          x: charX,
          y: lineY,
          fontSize: titleFontSize,
          fontFamily: fontCfg.family,
          fontWeight: fontCfg.weight,
          lineIndex,
          charIndex: j,
          lineCharCount: line.length,
          isSpace: line[j] === " ",
        });
      }
    });

    const subLines = [];
    if (rawSubLines.length > 0) {
      const subStartY =
        startY +
        (titleLines.length - 0.5) * titleLineH +
        gap +
        subLineH * 0.5;
      rawSubLines.forEach((line, k) => {
        subLines.push({
          text: line,
          x: 960,
          y: subStartY + k * subLineH,
          fontSize: subtitleFontSize,
          fontFamily: fontCfg.family,
          fontWeight: fontCfg.subWeight,
        });
      });
    }

    // Determine the line from which to pick the center letter:
    // When the title has an uneven / odd number of lines (e.g. 1 line, 3 lines, 5 lines),
    // the position MUST be picked from the exact middle line (Math.floor(titleLines.length / 2)).
    // When the title has an even number of lines (e.g. 2, 4), pick from the center lines.
    const isEvenLines = titleLines.length % 2 === 0;
    let targetLineIndex;
    if (!isEvenLines) {
      targetLineIndex = Math.floor(titleLines.length / 2);
    } else {
      const mid1 = titleLines.length / 2 - 1;
      const mid2 = titleLines.length / 2;
      const count1 = titleLines[mid1].replace(/\s/g, "").length;
      const count2 = titleLines[mid2].replace(/\s/g, "").length;
      targetLineIndex = count2 >= count1 ? mid2 : mid1;
    }

    let primaryChars = characters.filter(
      (c) => c.lineIndex === targetLineIndex && !c.isSpace
    );
    if (primaryChars.length === 0) {
      for (let offset = 1; offset < titleLines.length; offset++) {
        for (const dir of [-1, 1]) {
          const lIdx = targetLineIndex + dir * offset;
          if (lIdx >= 0 && lIdx < titleLines.length) {
            const chs = characters.filter((c) => c.lineIndex === lIdx && !c.isSpace);
            if (chs.length > 0) {
              primaryChars = chs;
              targetLineIndex = lIdx;
              break;
            }
          }
        }
        if (primaryChars.length > 0) break;
      }
    }

    // Pick the character closest to the horizontal center (x = 960) on that middle line
    let middleLetter = null;
    if (primaryChars.length > 0) {
      let closestDist = Infinity;
      primaryChars.forEach((c) => {
        const d = Math.abs(c.x - 960);
        if (d < closestDist) {
          closestDist = d;
          middleLetter = c;
        }
      });
    }

    if (!middleLetter) {
      middleLetter = characters.find((c) => !c.isSpace) || {
        char: "O",
        x: 960,
        y: 540,
        fontSize: titleFontSize,
        fontFamily: fontCfg.family,
        fontWeight: fontCfg.weight,
      };
    }

    this._layout = {
      titleLines,
      startY,
      titleLineH,
      titleFontSize,
      subtitleFontSize,
      fontFamily: fontCfg.family,
      fontWeight: fontCfg.weight,
      subWeight: fontCfg.subWeight,
      characters,
      subLines,
      middleLetter,
    };

    this._analyzeMiddleLetter();
    this._buildElements();
  }

  _analyzeMiddleLetter() {
    const mid = this._layout.middleLetter;
    if (!mid || !this._measureCanvas || !this._measureCtx) {
      this._layout.startZoomCenter = { x: 960, y: 540, clearRadius: 10 };
      this._layout.startScale = MAX_ZOOM_SCALE;
      this._layout.endZoomCenter = { x: 960, y: 540, solidRadius: 10 };
      this._layout.endScale = MAX_ZOOM_SCALE;
      return;
    }

    const canvas = this._measureCanvas;
    const canvasW = Math.max(480, Math.ceil(mid.fontSize * 3.5));
    const canvasH = Math.max(480, Math.ceil(mid.fontSize * 3.0));
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = this._measureCtx;

    const localCx = Math.floor(canvasW / 2);
    const localCy = Math.floor(canvasH / 2);

    // 1. Render ONLY the middle letter to determine its solid bounding box and covered position
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.font = `${mid.fontWeight} ${mid.fontSize}px ${mid.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(mid.char, localCx, localCy);

    let midImg;
    try {
      midImg = ctx.getImageData(0, 0, canvasW, canvasH);
    } catch {
      this._layout.startZoomCenter = { x: mid.x, y: mid.y, clearRadius: 10 };
      this._layout.startScale = MAX_ZOOM_SCALE;
      this._layout.endZoomCenter = { x: mid.x, y: mid.y, solidRadius: 10 };
      this._layout.endScale = MAX_ZOOM_SCALE;
      return;
    }
    const midData = midImg.data;

    let minU = canvasW;
    let maxU = 0;
    let minV = canvasH;
    let maxV = 0;
    let solidPixelCount = 0;

    for (let v = 0; v < canvasH; v++) {
      for (let u = 0; u < canvasW; u++) {
        const a = midData[(v * canvasW + u) * 4 + 3];
        if (a > 64) {
          if (u < minU) minU = u;
          if (u > maxU) maxU = u;
          if (v < minV) minV = v;
          if (v > maxV) maxV = v;
          solidPixelCount++;
        }
      }
    }

    if (solidPixelCount === 0) {
      minU = localCx - Math.round(mid.fontSize * 0.25);
      maxU = localCx + Math.round(mid.fontSize * 0.25);
      minV = localCy - Math.round(mid.fontSize * 0.35);
      maxV = localCy + Math.round(mid.fontSize * 0.35);
    }

    // Distance Transform on solid pixels of the middle letter
    // to find the deepest point inside the stroke (end position for cutout zoom-out)
    const distSolid = new Float32Array(canvasW * canvasH);
    for (let i = 0; i < canvasW * canvasH; i++) {
      distSolid[i] = midData[i * 4 + 3] > 128 ? 1e6 : 0;
    }
    for (let v = 1; v < canvasH - 1; v++) {
      for (let u = 1; u < canvasW - 1; u++) {
        const idx = v * canvasW + u;
        if (distSolid[idx] > 0) {
          distSolid[idx] = Math.min(
            distSolid[idx],
            distSolid[idx - canvasW] + 1,
            distSolid[idx - 1] + 1,
            distSolid[idx - canvasW - 1] + 1.414,
            distSolid[idx - canvasW + 1] + 1.414
          );
        }
      }
    }
    for (let v = canvasH - 2; v >= 1; v--) {
      for (let u = canvasW - 2; u >= 1; u--) {
        const idx = v * canvasW + u;
        if (distSolid[idx] > 0) {
          distSolid[idx] = Math.min(
            distSolid[idx],
            distSolid[idx + canvasW] + 1,
            distSolid[idx + 1] + 1,
            distSolid[idx + canvasW + 1] + 1.414,
            distSolid[idx + canvasW - 1] + 1.414
          );
        }
      }
    }

    const glyphCenterX = (minU + maxU) / 2;
    const glyphCenterY = (minV + maxV) / 2;

    let bestSolidScore = -Infinity;
    let bestSolidU = Math.round(glyphCenterX);
    let bestSolidV = Math.round(glyphCenterY);
    let bestSolidDist = 1;

    for (let v = minV; v <= maxV; v++) {
      for (let u = minU; u <= maxU; u++) {
        const d = distSolid[v * canvasW + u];
        if (d > 0) {
          const distFromCenter = Math.hypot(u - glyphCenterX, v - glyphCenterY);
          // Strongly prefer center of glyph so it never sits at an edge
          const score = d - distFromCenter * 0.45;
          if (score > bestSolidScore) {
            bestSolidScore = score;
            bestSolidU = u;
            bestSolidV = v;
            bestSolidDist = d;
          }
        }
      }
    }

    const endZoomCenter = {
      x: mid.x + (bestSolidU - localCx),
      y: mid.y + (bestSolidV - localCy),
      solidRadius: bestSolidDist,
    };

    const corners = [
      [0, 0],
      [1920, 0],
      [0, 1080],
      [1920, 1080],
    ];
    const maxDistToEndCorner = Math.max(
      ...corners.map(([cx, cy]) =>
        Math.hypot(cx - endZoomCenter.x, cy - endZoomCenter.y)
      )
    );
    // Multiply by 2.4 so the out-zoom is ~140% larger than the minimum needed to clear the viewport.
    const endScale = Math.round(Math.max(
      160,
      Math.ceil(maxDistToEndCorner / Math.max(3, bestSolidDist))
    ) * 2.4);

    // 2. Render surrounding characters to find a guaranteed transparent region for start position
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    this._layout.characters.forEach((c) => {
      if (c.isSpace) return;
      const cu = localCx + (c.x - mid.x);
      const cv = localCy + (c.y - mid.y);
      if (
        cu >= -c.fontSize &&
        cu <= canvasW + c.fontSize &&
        cv >= -c.fontSize &&
        cv <= canvasH + c.fontSize
      ) {
        ctx.font = `${c.fontWeight} ${c.fontSize}px ${c.fontFamily}`;
        ctx.fillText(c.char, cu, cv);
      }
    });

    this._layout.subLines.forEach((s) => {
      const su = localCx + (s.x - mid.x);
      const sv = localCy + (s.y - mid.y);
      if (
        su >= -1000 &&
        su <= canvasW + 1000 &&
        sv >= -s.fontSize &&
        sv <= canvasH + s.fontSize
      ) {
        ctx.font = `${s.fontWeight} ${s.fontSize}px ${s.fontFamily}`;
        ctx.fillText(s.text, su, sv);
      }
    });

    const allImg = ctx.getImageData(0, 0, canvasW, canvasH);
    const allData = allImg.data;

    // Distance Transform on TRANSPARENT pixels (no text coverage)
    const distClear = new Float32Array(canvasW * canvasH);
    for (let i = 0; i < canvasW * canvasH; i++) {
      distClear[i] = allData[i * 4 + 3] <= 30 ? 1e6 : 0;
    }
    for (let v = 1; v < canvasH - 1; v++) {
      for (let u = 1; u < canvasW - 1; u++) {
        const idx = v * canvasW + u;
        if (distClear[idx] > 0) {
          distClear[idx] = Math.min(
            distClear[idx],
            distClear[idx - canvasW] + 1,
            distClear[idx - 1] + 1,
            distClear[idx - canvasW - 1] + 1.414,
            distClear[idx - canvasW + 1] + 1.414
          );
        }
      }
    }
    for (let v = canvasH - 2; v >= 1; v--) {
      for (let u = canvasW - 2; u >= 1; u--) {
        const idx = v * canvasW + u;
        if (distClear[idx] > 0) {
          distClear[idx] = Math.min(
            distClear[idx],
            distClear[idx + canvasW] + 1,
            distClear[idx + 1] + 1,
            distClear[idx + canvasW + 1] + 1.414,
            distClear[idx + canvasW - 1] + 1.414
          );
        }
      }
    }

    // Search for starting transparent zoom position following user's hierarchy:
    // Priority 1: Inside a letter (counter or pocket of the middle letter, e.g. 'O', 's', 'S', 'm', 'M', 'C', 'A')
    // Priority 2: When an even number of lines: between the lines if no good inside position was found
    // Priority 3: Between two letters (horizontally flanked by letters, strictly within line height)
    // Priority 4: Fallback adjacent horizontally, strictly within line height (never above or below the text)

    // 1. Inside the middle letter: must be geometrically enclosed by the glyph's strokes
    let bestInside = null;
    let bestInsideScore = -Infinity;

    for (let v = minV + 2; v <= maxV - 2; v++) {
      for (let u = minU + 2; u <= maxU - 2; u++) {
        const d = distClear[v * canvasW + u];
        if (d >= 4) {
          // Check ray cast in 4 directions inside midData
          let hasTop = false, hasBottom = false, hasLeft = false, hasRight = false;
          for (let y = v - 1; y >= minV; y--) {
            if (midData[(y * canvasW + u) * 4 + 3] > 64) {
              hasTop = true;
              break;
            }
          }
          for (let y = v + 1; y <= maxV; y++) {
            if (midData[(y * canvasW + u) * 4 + 3] > 64) {
              hasBottom = true;
              break;
            }
          }
          for (let x = u - 1; x >= minU; x--) {
            if (midData[(v * canvasW + x) * 4 + 3] > 64) {
              hasLeft = true;
              break;
            }
          }
          for (let x = u + 1; x <= maxU; x++) {
            if (midData[(v * canvasW + x) * 4 + 3] > 64) {
              hasRight = true;
              break;
            }
          }

          const isVertEnclosed = hasTop && hasBottom;
          const isCupEnclosed = (hasLeft && hasRight) && (hasTop || hasBottom);
          if (isVertEnclosed || isCupEnclosed) {
            const distFromCenterX = Math.abs(u - glyphCenterX);
            const distFromCenterY = Math.abs(v - glyphCenterY);
            // Pocket / counter bonus: +4 for vertical enclosure (pockets in S, s, C, O, A)
            const score = d + (isVertEnclosed ? 4 : 0) - distFromCenterX * 0.05 - distFromCenterY * 0.02;
            if (score > bestInsideScore) {
              bestInsideScore = score;
              bestInside = { u, v, d, score };
            }
          }
        }
      }
    }

    // 2. Between the lines (when there are an even number of lines)
    let bestBetweenLines = null;
    const titleLines = this._layout.titleLines || [];
    const isEvenLines = titleLines.length > 0 && titleLines.length % 2 === 0;

    if (isEvenLines) {
      const midLineIdx1 = titleLines.length / 2 - 1;
      const midLineIdx2 = titleLines.length / 2;
      const lineY1 = this._layout.startY + midLineIdx1 * this._layout.titleLineH;
      const lineY2 = this._layout.startY + midLineIdx2 * this._layout.titleLineH;
      const betweenY = (lineY1 + lineY2) / 2;

      const targetU = localCx + (960 - mid.x);
      const targetV = localCy + (betweenY - mid.y);

      let bestGapD = 0;
      let bestGapU = targetU, bestGapV = targetV;
      for (let dv = -20; dv <= 20; dv++) {
        for (let du = -40; du <= 40; du++) {
          const u = Math.round(targetU + du);
          const v = Math.round(targetV + dv);
          if (u >= 2 && u < canvasW - 2 && v >= 2 && v < canvasH - 2) {
            const d = distClear[v * canvasW + u];
            if (d > bestGapD) {
              bestGapD = d;
              bestGapU = u;
              bestGapV = v;
            }
          }
        }
      }
      if (bestGapD >= 6) {
        bestBetweenLines = { u: bestGapU, v: bestGapV, d: bestGapD };
      }
    }

    // 3. Between two letters (horizontally flanked by letters, strictly within line height)
    let bestBetweenLetters = null;
    let bestBetweenLettersScore = -Infinity;
    const hMargin = Math.round(mid.fontSize * 0.9);

    for (let v = minV + 5; v <= maxV - 5; v++) {
      for (
        let u = Math.max(2, minU - hMargin);
        u <= Math.min(canvasW - 3, maxU + hMargin);
        u++
      ) {
        const d = distClear[v * canvasW + u];
        if (d >= 4) {
          let hasLeft = false, hasRight = false;
          for (let x = u - 1; x >= Math.max(0, u - 160); x--) {
            if (allData[(v * canvasW + x) * 4 + 3] > 64) {
              hasLeft = true;
              break;
            }
          }
          for (let x = u + 1; x <= Math.min(canvasW - 1, u + 160); x++) {
            if (allData[(v * canvasW + x) * 4 + 3] > 64) {
              hasRight = true;
              break;
            }
          }
          if (hasLeft && hasRight) {
            const distFromCenterX = Math.abs(u - localCx);
            const distFromCenterY = Math.abs(v - localCy);
            const score = d - distFromCenterX * 0.08 - distFromCenterY * 0.03;
            if (score > bestBetweenLettersScore) {
              bestBetweenLettersScore = score;
              bestBetweenLetters = { u, v, d, score };
            }
          }
        }
      }
    }

    // Select chosen starting position according to user's hierarchy:
    // 1. On even number of lines: simply use a position between the lines
    // 2. On uneven number of lines:
    //    a. Inside a letter on the middle line (pocket or counter with d >= 5)
    //    b. Between two letters on the middle line (d >= 5)
    //    c. Fallbacks: inside letter -> between letters -> horizontal side of glyph (v in [minV, maxV])
    let chosenTrans = null;

    if (isEvenLines && bestBetweenLines) {
      chosenTrans = bestBetweenLines;
    } else if (bestInside && bestInside.d >= 5) {
      chosenTrans = bestInside;
    } else if (bestBetweenLetters && bestBetweenLetters.d >= 5) {
      chosenTrans = bestBetweenLetters;
    } else if (bestInside && bestInside.d >= 2) {
      chosenTrans = bestInside;
    } else if (bestBetweenLetters) {
      chosenTrans = bestBetweenLetters;
    } else {
      // Horizontal fallback: strictly stay within glyph vertical span [minV, maxV] to never go above or below
      let fallbackD = 0;
      let fallbackU = localCx, fallbackV = Math.round(glyphCenterY);
      for (let v = minV + 2; v <= maxV - 2; v++) {
        for (
          let u = Math.max(2, minU - hMargin);
          u <= Math.min(canvasW - 3, maxU + hMargin);
          u++
        ) {
          const d = distClear[v * canvasW + u];
          if (d > fallbackD) {
            fallbackD = d;
            fallbackU = u;
            fallbackV = v;
          }
        }
      }
      chosenTrans = { u: fallbackU, v: fallbackV, d: Math.max(6, fallbackD) };
    }

    const startZoomCenter = {
      x: mid.x + (chosenTrans.u - localCx),
      y: mid.y + (chosenTrans.v - localCy),
      clearRadius: Math.max(1, chosenTrans.d),
    };

    const maxDistToStartCorner = Math.max(
      ...corners.map(([cx, cy]) =>
        Math.hypot(cx - startZoomCenter.x, cy - startZoomCenter.y)
      )
    );
    const startScale = Math.min(
      MAX_ZOOM_SCALE,
      Math.max(80, Math.ceil(maxDistToStartCorner / Math.max(2, chosenTrans.d)))
    );

    this._layout.startZoomCenter = startZoomCenter;
    this._layout.startScale = startScale;
    this._layout.endZoomCenter = endZoomCenter;
    this._layout.endScale = endScale;
  }

  _buildElements() {
    this._fgTitleGroup.innerHTML = "";
    this._fgSubtitleGroup.innerHTML = "";
    this._maskZoomGroup.innerHTML = "";

    this._bgRect.setAttribute("fill", this._state.backgroundColor);

    this._charElements = [];
    this._layout.characters.forEach((c) => {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      el.setAttribute("class", "char-text");
      el.setAttribute("x", c.x.toFixed(2));
      el.setAttribute("y", c.y.toFixed(2));
      el.setAttribute("font-family", c.fontFamily);
      el.setAttribute("font-weight", c.fontWeight);
      el.setAttribute("font-size", c.fontSize.toFixed(2));
      el.setAttribute("fill", this._state.fontColor);
      el.textContent = c.char;
      this._fgTitleGroup.appendChild(el);
      this._charElements.push(el);
    });

    this._subElements = [];
    this._layout.subLines.forEach((s) => {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      el.setAttribute("class", "sub-text");
      el.setAttribute("x", s.x.toFixed(2));
      el.setAttribute("y", s.y.toFixed(2));
      el.setAttribute("font-family", s.fontFamily);
      el.setAttribute("font-weight", s.fontWeight);
      el.setAttribute("font-size", s.fontSize.toFixed(2));
      el.setAttribute("fill", this._state.fontColor);
      el.textContent = s.text;
      this._fgSubtitleGroup.appendChild(el);
      this._subElements.push(el);
    });
  }

  _populateMaskCutout() {
    this._maskZoomGroup.innerHTML = "";
    this._layout.characters.forEach((c) => {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      el.setAttribute("class", "char-text");
      el.setAttribute("x", c.x.toFixed(2));
      el.setAttribute("y", c.y.toFixed(2));
      el.setAttribute("font-family", c.fontFamily);
      el.setAttribute("font-weight", c.fontWeight);
      el.setAttribute("font-size", c.fontSize.toFixed(2));
      el.setAttribute("fill", "black");
      el.textContent = c.char;
      this._maskZoomGroup.appendChild(el);
    });

    this._layout.subLines.forEach((s) => {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      el.setAttribute("class", "sub-text");
      el.setAttribute("x", s.x.toFixed(2));
      el.setAttribute("y", s.y.toFixed(2));
      el.setAttribute("font-family", s.fontFamily);
      el.setAttribute("font-weight", s.fontWeight);
      el.setAttribute("font-size", s.fontSize.toFixed(2));
      el.setAttribute("fill", "black");
      el.textContent = s.text;
      this._maskZoomGroup.appendChild(el);
    });
  }

  _applyStaticVisible() {
    this._stage.style.opacity = "1";
    this._bgRect.setAttribute("opacity", "1");
    this._fgGroup.setAttribute("opacity", "1");
    this._fgGroup.removeAttribute("transform");
    this._fgSubtitleGroup.setAttribute("opacity", "1");
    this._maskZoomGroup.innerHTML = "";
  }

  _runPlayAnimation(duration) {
    this._stage.style.opacity = "1";
    // FIRST FRAME: Absolutely NO text visible, NO background visible
    // Guaranteed by positioning the viewport at startZoomCenter (a transparent pocket of the middle letter)
    // with startScale scaling the transparent region beyond the viewport corners.
    this._fgGroup.setAttribute("opacity", "0");
    this._bgRect.setAttribute("opacity", "0");
    this._maskZoomGroup.innerHTML = "";

    const startCenter = this._layout.startZoomCenter || { x: 960, y: 540 };
    const startScale = this._layout.startScale || MAX_ZOOM_SCALE;
    const cx = startCenter.x;
    const cy = startCenter.y;

    // Set initial position: centered on the transparent pocket of the middle letter at startScale
    this._fgGroup.setAttribute(
      "transform",
      `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${startScale.toFixed(
        2
      )}) translate(${-cx.toFixed(2)} ${-cy.toFixed(2)})`
    );

    const startTime = performance.now();

    // In-animation sequence:
    // Phase 1 (0.0 -> textEndThreshold): Text zooms in from startScale to 1.0. Background remains transparent (opacity = 0).
    // Phase 2 (textEndThreshold -> 1.0): Text has finished animating and stays locked in place; background animates in to full opacity.
    const textEndThreshold = 0.62;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      if (progress <= textEndThreshold) {
        // Phase 1: Text zooming in
        const textProg = progress / textEndThreshold;
        const ease = 1.0 - Math.pow(1.0 - textProg, 3.2);
        const currentScale = 1.0 + (startScale - 1.0) * (1.0 - ease);

        this._fgGroup.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${currentScale.toFixed(
            4
          )}) translate(${-cx.toFixed(2)} ${-cy.toFixed(2)})`
        );

        // Text opacity: stays 0 during initial rapid zoom, fades in smoothly as letters approach viewport size
        const textOpacity = Math.max(0, Math.min(1.0, (textProg - 0.15) / 0.30));
        this._fgGroup.setAttribute("opacity", textOpacity.toFixed(4));

        // Subtitle reveals smoothly as text approaches target size
        const subProg = Math.max(0, (textProg - 0.35) / 0.65);
        const subEase = 1.0 - Math.pow(1.0 - subProg, 2.0);
        this._fgSubtitleGroup.setAttribute("opacity", subEase.toFixed(4));

        // Background stays transparent while text is animating
        this._bgRect.setAttribute("opacity", "0");
      } else {
        // Phase 2: Text has finished animating; background animates in
        this._fgGroup.removeAttribute("transform");
        this._fgGroup.setAttribute("opacity", "1");
        this._fgSubtitleGroup.setAttribute("opacity", "1");

        const bgProg = (progress - textEndThreshold) / (1.0 - textEndThreshold);
        const bgEase = 1.0 - Math.pow(1.0 - bgProg, 2.2);
        this._bgRect.setAttribute("opacity", bgEase.toFixed(4));
      }

      if (progress < 1.0) {
        this._activeRaf = requestAnimationFrame(tick);
      } else {
        this._activeRaf = null;
        this._applyStaticVisible();
        if (this._resolveAction) {
          const resolve = this._resolveAction;
          this._resolveAction = null;
          resolve({ statusCode: 200, currentStep: 0 });
        }
      }
    };

    this._activeRaf = requestAnimationFrame(tick);
  }

  _runStopAnimation(duration) {
    // Step 1: Initialize mask cutout underneath while foreground text starts at full opacity
    this._fgGroup.setAttribute("opacity", "1");
    this._populateMaskCutout();
    this._bgRect.setAttribute("opacity", "1");
    this._stage.style.opacity = "1";

    const endCenter = this._layout.endZoomCenter || { x: 960, y: 540 };
    const endScale = this._layout.endScale || MAX_ZOOM_SCALE;
    const cx = endCenter.x;
    const cy = endCenter.y;

    this._maskZoomGroup.setAttribute("transform", "translate(0 0) scale(1)");

    const startTime = performance.now();

    // Out-animation sequence:
    // Phase 1 (0.0 -> fadeThreshold): Text animates from solid to transparent (revealing the cutout hole)
    // Phase 2 (fadeThreshold -> holdThreshold): Brief hold static on the see-through cutout stencil
    // Phase 3 (holdThreshold -> 1.0): Accelerating out-zoom through the covered (solid) stroke of the middle letter
    const fadeThreshold = 0.22;
    const holdThreshold = 0.32;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      if (progress <= holdThreshold) {
        // Still at normal scale 1.0 (no zoom yet)
        this._maskZoomGroup.setAttribute(
          "transform",
          "translate(0 0) scale(1)"
        );
        this._bgRect.setAttribute("opacity", "1");

        // Animate text becoming transparent to the cutout
        if (progress <= fadeThreshold) {
          const fadeProg = progress / fadeThreshold;
          const fadeEase = 1.0 - Math.pow(1.0 - fadeProg, 2.0);
          const fgOpacity = Math.max(0, 1.0 - fadeEase);
          this._fgGroup.setAttribute("opacity", fgOpacity.toFixed(4));
        } else {
          this._fgGroup.setAttribute("opacity", "0");
        }
      } else {
        // Phase 3: Text is completely transparent, accelerating out-zoom through covered letter stroke
        this._fgGroup.setAttribute("opacity", "0");

        const zoomProg = (progress - holdThreshold) / (1.0 - holdThreshold);
        const zoomEase = Math.pow(zoomProg, 3.2);

        const curScale = 1.0 + (endScale - 1.0) * zoomEase;

        // Zoom centered directly on the covered/solid stroke of the middle letter
        this._maskZoomGroup.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${curScale.toFixed(
            2
          )}) translate(${-cx.toFixed(2)} ${-cy.toFixed(2)})`
        );

        // Background opacity cleanly clears as the zoom concludes
        if (zoomProg > 0.60) {
          const bgFade = Math.max(0, 1.0 - (zoomProg - 0.60) / 0.40);
          this._bgRect.setAttribute("opacity", bgFade.toFixed(4));
        } else {
          this._bgRect.setAttribute("opacity", "1");
        }
      }

      if (progress < 1.0) {
        this._activeRaf = requestAnimationFrame(tick);
      } else {
        this._activeRaf = null;
        this._resetToTransparent();
        if (this._resolveAction) {
          const resolve = this._resolveAction;
          this._resolveAction = null;
          resolve({ statusCode: 200, currentStep: 0 });
        }
      }
    };

    this._activeRaf = requestAnimationFrame(tick);
  }
}

customElements.get("ograf-seethrough-title") ||
  customElements.define("ograf-seethrough-title", OgrafSeethroughTitle);

export default OgrafSeethroughTitle;
