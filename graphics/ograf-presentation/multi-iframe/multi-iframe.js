/**
 * Multi Iframe Layout
 * Displays multiple web pages, each loaded from its own URL, positioned and
 * sized independently (x/y/width/height, all in percent) on a transparent
 * background, with an optional per-tile content scale and stacking rank
 * (z-index). The frame's on-screen footprint always stays exactly
 * x/y/width/height -- the iframe itself is rendered at (100 / scale)% and
 * then shrunk/grown back to 100% via CSS transform, so only its content
 * appears zoomed in or out. Each tile shares the same soft border, rounded
 * corners, and drop shadow, and animates in (staggered) on play and out on
 * stop. Layout updates reconcile tiles by index instead of rebuilding: an
 * iframe only reloads if its own url changed, and position/size changes
 * animate via CSS transition. When a rank change puts a tile on top of an
 * overlapping tile, a reveal animation plays: a fade-in if the newly-topped
 * tile was fully hidden behind it, or a brief shuffle-apart-and-back if they
 * only partially overlapped; no animation if they don't overlap at all.
 */

const DEFAULT_STATE = {
  iframes: [],
};

const STAGGER_MS = 60;
const MAX_STAGGER_MS = 480;

const STYLE_TEXT = `
:host {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

.stage {
  position: absolute;
  inset: 0;
}

.tile {
  position: absolute;
  padding: 0.5vmin;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.4vmin;
  box-shadow:
    0 1.6vmin 3.2vmin rgba(0, 0, 0, 0.3),
    0 0.3vmin 0.8vmin rgba(0, 0, 0, 0.2);
  overflow: hidden;
  opacity: 0;
  transform: scale(0.92) translateY(1.6vmin);
  transition:
    opacity 500ms ease,
    transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
    left 500ms cubic-bezier(0.22, 1, 0.36, 1),
    top 500ms cubic-bezier(0.22, 1, 0.36, 1),
    width 500ms cubic-bezier(0.22, 1, 0.36, 1),
    height 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tile.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.tile.no-anim {
  transition: none;
}

.page {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 1vmin;
  background: #ffffff;
  transform-origin: top left;

}
`;

class MultiIframe extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._tiles = [];
    this._prevEntries = [];
    this._visible = false;

    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE_TEXT;

    const stage = document.createElement("div");
    stage.className = "stage";

    root.appendChild(style);
    root.appendChild(stage);

    this._stage = stage;

    this._syncTiles(this._state.iframes);
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

  _updateState(data) {
    if (!data) return;
    this._state = { ...this._state, ...data };
    if (data.iframes !== undefined) this._syncTiles(data.iframes);
  }

  // Reconciles tiles by index instead of rebuilding everything: existing
  // tiles are repositioned/resized in place (animated via CSS transition)
  // and only reload their iframe if that entry's own url changed; extra
  // tiles are created (and enter-animated if already visible) or removed
  // (fading out) as the list grows or shrinks.
  _syncTiles(list) {
    const entries = list || [];
    const count = Math.max(entries.length, this._tiles.length);

    for (let i = 0; i < count; i++) {
      const entry = entries[i];
      const tile = this._tiles[i];

      if (entry && tile) {
        this._applyEntryToTile(tile, entry);
      } else if (entry && !tile) {
        const newTile = this._createTile(entry, i);
        this._tiles[i] = newTile;
        this._stage.appendChild(newTile);
        if (this._visible) {
          requestAnimationFrame(() => newTile.classList.add("visible"));
        }
      } else if (!entry && tile) {
        tile.classList.remove("visible");
        tile.addEventListener("transitionend", () => tile.remove(), { once: true });
      }
    }

    this._tiles = this._tiles.slice(0, entries.length);
    this._animateRankChanges(entries, this._prevEntries);
    this._prevEntries = entries.map((e) => ({ ...e }));
  }

  _createTile(entry, index) {
    const tile = document.createElement("div");
    tile.className = "tile";

    const iframe = document.createElement("iframe");
    iframe.className = "page";
    // Restrict what an arbitrary, user-supplied URL is allowed to do.
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
    iframe.setAttribute("referrerpolicy", "no-referrer");
    iframe.setAttribute("loading", "eager");
    iframe.title = `Remote page ${index + 1}`;
    tile.appendChild(iframe);

    this._applyEntryToTile(tile, entry);
    return tile;
  }

  _applyEntryToTile(tile, entry) {
    tile.style.left = `${entry.x}%`;
    tile.style.top = `${entry.y}%`;
    tile.style.width = `${entry.width}%`;
    tile.style.height = `${entry.height}%`;
    tile.style.zIndex = `${entry.rank || 0}`;

    const scale = entry.scale || 1;
    const iframe = tile.querySelector("iframe");
    // Render at (100 / scale)% then transform back down/up to 100%, so the
    // tile's own footprint never changes -- only the content zooms.
    iframe.style.width = `${100 / scale}%`;
    iframe.style.height = `${100 / scale}%`;
    iframe.style.transform = `scale(${scale})`;

    // Only reload the page if its own url actually changed.
    if (iframe.dataset.srcUrl !== entry.url) {
      iframe.dataset.srcUrl = entry.url;
      iframe.src = entry.url || "about:blank";
    }
  }

  // For every pair of tiles where at least one's rank changed, checks
  // whether their stacking order flipped -- either tile could be the one
  // that moved (raised above the other, or lowered below it) -- and plays a
  // reveal effect on the newly-topmost tile based on how much they overlap.
  _animateRankChanges(entries, prevEntries) {
    for (let i = 0; i < entries.length; i++) {
      const a = entries[i];
      const prevA = prevEntries[i];
      const tileA = this._tiles[i];
      if (!a || !prevA || !tileA) continue;

      for (let j = i + 1; j < entries.length; j++) {
        const b = entries[j];
        const prevB = prevEntries[j];
        const tileB = this._tiles[j];
        if (!b || !prevB || !tileB) continue;

        const rankA = a.rank || 0;
        const rankB = b.rank || 0;
        const prevRankA = prevA.rank || 0;
        const prevRankB = prevB.rank || 0;
        if (rankA === prevRankA && rankB === prevRankB) continue; // neither moved

        // Was B on top of (or level with) A before, and is A now strictly above B?
        const aRoseAboveB = prevRankA <= prevRankB && rankA > rankB;
        // Was A on top of (or level with) B before, and is B now strictly above A?
        const bFellBelowA = prevRankB <= prevRankA && rankB > rankA;

        let topTile, bottomTile, topEntry, bottomEntry, prevTopRank, prevBottomRank;
        if (aRoseAboveB) {
          topTile = tileA; bottomTile = tileB;
          topEntry = a; bottomEntry = b;
          prevTopRank = prevRankA; prevBottomRank = prevRankB;
        } else if (bFellBelowA) {
          topTile = tileB; bottomTile = tileA;
          topEntry = b; bottomEntry = a;
          prevTopRank = prevRankB; prevBottomRank = prevRankA;
        } else {
          continue; // stacking order didn't flip
        }

        const overlap = this._computeOverlap(topEntry, bottomEntry);
        if (!overlap) continue; // no overlap: no animation needed

        if (overlap.contained) {
          this._playFadeReveal(topTile);
        } else {
          this._playShuffleReveal(
            topEntry,
            bottomEntry,
            topTile,
            bottomTile,
            overlap,
            prevTopRank,
            prevBottomRank
          );
        }
      }
    }
  }

  _computeOverlap(a, b) {
    const ax2 = a.x + a.width;
    const ay2 = a.y + a.height;
    const bx2 = b.x + b.width;
    const by2 = b.y + b.height;
    const overlapW = Math.min(ax2, bx2) - Math.max(a.x, b.x);
    const overlapH = Math.min(ay2, by2) - Math.max(a.y, b.y);
    if (overlapW <= 0 || overlapH <= 0) return null;
    const aInB = a.x >= b.x && a.y >= b.y && ax2 <= bx2 && ay2 <= by2;
    const bInA = b.x >= a.x && b.y >= a.y && bx2 <= ax2 && by2 <= ay2;
    return { overlapW, overlapH, contained: aInB || bInA };
  }

  // A was fully hidden behind B; now that A is on top, simply fade it in.
  _playFadeReveal(tileA) {
    tileA.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 420,
      easing: "ease-out",
    });
  }

  // A and B only partially overlapped; nudge them apart to make room for the
  // reveal, then bring them back to their normal positions. The z-index swap
  // is deferred to the animation's midpoint (peak separation), so A visually
  // stays behind B until they're apart, then reveals on top as they return.
  _playShuffleReveal(a, b, tileA, tileB, overlap, prevRankA, prevRankB) {
    const horizontal = overlap.overlapW <= overlap.overlapH;
    const centerA = horizontal ? a.x + a.width / 2 : a.y + a.height / 2;
    const centerB = horizontal ? b.x + b.width / 2 : b.y + b.height / 2;
    const signA = centerA <= centerB ? -1 : 1;
    const signB = -signA;
    const nudgePercent = 14; // percent of each tile's own box size
    const buildTransform = (sign) =>
      horizontal
        ? `translateX(${sign * nudgePercent}%)`
        : `translateY(${sign * nudgePercent}%)`;
    const keyframes = (sign) => [
      { transform: "translate(0, 0)" },
      { transform: buildTransform(sign), offset: 0.5 },
      { transform: "translate(0, 0)" },
    ];
    const duration = 620;
    const timing = { duration, easing: "ease-in-out" };

    tileA.style.zIndex = `${prevRankA}`;
    tileB.style.zIndex = `${prevRankB}`;
    setTimeout(() => {
      tileA.style.zIndex = `${a.rank || 0}`;
      tileB.style.zIndex = `${b.rank || 0}`;
    }, duration / 2);

    tileA.animate(keyframes(signA), timing);
    tileB.animate(keyframes(signB), timing);
  }

  _setVisible(visible, skipAnimation) {
    this._visible = visible;
    this._tiles.forEach((tile, i) => {
      const apply = () => {
        if (skipAnimation) {
          tile.classList.add("no-anim");
          void tile.offsetWidth;
        }
        tile.classList.toggle("visible", visible);
        if (skipAnimation) {
          requestAnimationFrame(() => tile.classList.remove("no-anim"));
        }
      };
      if (visible && !skipAnimation) {
        setTimeout(apply, Math.min(i * STAGGER_MS, MAX_STAGGER_MS));
      } else {
        apply();
      }
    });
  }
}

export default MultiIframe;
