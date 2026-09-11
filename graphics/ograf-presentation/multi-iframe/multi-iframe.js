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
  interactive: 0,
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
  overflow: visible;
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

.tile.expand-enabled {
  cursor: default;
}

.tile.expanded {
  z-index: 10000 !important;
  cursor: default;
}

.tile.expanded .page {
  width: 100% !important;
  height: 100% !important;
  transform: none !important;
  pointer-events: auto;
}

.tile.expanded-full {
  border-radius: 0;
  padding: 0;
}

.tile.expanded-full .page {
  border-radius: 0;
}

.tile.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.tile.no-anim {
  transition: none;
}

.tile-title {
  position: absolute;
  top: 0;
  left: 2.2vmin;
  transform: translateY(-100%);
  padding: 0.7vmin 1.8vmin;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.9vmin 0.9vmin 0 0;
  box-shadow: 0 -0.4vh 0.8vh rgba(0, 0, 0, 0.18);
  font-family: "Consolas", "Menlo", "Monaco", "Courier New", monospace;
  font-size: clamp(13px, 1.1vw, 18px);
  color: #33363d;
  white-space: nowrap;
  z-index: 1;
}

.tile-title[hidden] {
  display: none;
}

.tile.expanded .tile-title {
  display: none;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 18, 32, 0.8);
  color: #ffffff;
  font-size: 22px;
  line-height: 1;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.expand-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: rgba(15, 18, 32, 0.68);
  color: #ffffff;
  font-size: 18px;
  line-height: 1;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.tile.expand-enabled:not(.expanded) .expand-btn {
  display: inline-flex;
}

.tile.expanded .close-btn {
  display: inline-flex;
}

.page {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 1vmin;
  background: #ffffff;
  transform-origin: top left;
  overflow: hidden;

}
`;

class MultiIframe extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._tiles = [];
    this._prevEntries = [];
    this._visible = false;
    this._expandedTile = null;

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
    if (data.interactive !== undefined) this._syncInteractivity();
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
        if (tile === this._expandedTile) this._expandedTile = null;
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

    const title = document.createElement("div");
    title.className = "tile-title";
    tile.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close fullscreen");
    closeBtn.textContent = "x";
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      this._collapseExpandedTile();
    });
    tile.appendChild(closeBtn);

    const expandBtn = document.createElement("button");
    expandBtn.className = "expand-btn";
    expandBtn.type = "button";
    expandBtn.setAttribute("aria-label", "Expand frame");
    expandBtn.textContent = "+";
    expandBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this._getInteractiveSize() <= 0) return;
      this._expandTile(tile);
    });
    tile.appendChild(expandBtn);

    const iframe = document.createElement("iframe");
    iframe.className = "page";
    // Restrict what an arbitrary, user-supplied URL is allowed to do.
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
    iframe.setAttribute("referrerpolicy", "no-referrer");
    iframe.setAttribute("loading", "eager");
    iframe.title = `Remote page ${index + 1}`;
    tile.appendChild(iframe);

    this._applyEntryToTile(tile, entry);
    this._applyTileInteractivity(tile);
    return tile;
  }

  _applyEntryToTile(tile, entry) {
    const isExpanded = tile.classList.contains("expanded");
    if (!isExpanded) {
      tile.style.left = `${entry.x}%`;
      tile.style.top = `${entry.y}%`;
      tile.style.width = `${entry.width}%`;
      tile.style.height = `${entry.height}%`;
      tile.style.zIndex = `${entry.rank || 0}`;
    }

    const title = tile.querySelector(".tile-title");
    const titleText = entry.title || "";
    title.textContent = titleText;
    title.hidden = !titleText;

    const scale = entry.scale || 1;
    const iframe = tile.querySelector("iframe");
    if (isExpanded) {
      this._applyExpandedBounds(tile, entry);
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.transform = "none";
    } else {
      // Render at (100 / scale)% then transform back down/up to 100%, so the
      // tile's own footprint never changes -- only the content zooms.
      iframe.style.width = `${100 / scale}%`;
      iframe.style.height = `${100 / scale}%`;
      iframe.style.transform = `scale(${scale})`;
    }

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

  _syncInteractivity() {
    if (this._getInteractiveSize() <= 0) {
      this._collapseExpandedTile(true);
    }
    this._tiles.forEach((tile) => this._applyTileInteractivity(tile));
  }

  _applyTileInteractivity(tile) {
    const interactive = this._getInteractiveSize() > 0;
    tile.classList.toggle("expand-enabled", interactive);
  }

  _expandTile(tile) {
    const size = this._getInteractiveSize();
    if (size <= 0) return;

    if (this._expandedTile && this._expandedTile !== tile) {
      this._expandedTile.classList.remove("expanded");
      const prevEntry = this._getEntryForTile(this._expandedTile);
      if (prevEntry) this._applyEntryToTile(this._expandedTile, prevEntry);
      this._applyTileInteractivity(this._expandedTile);
    }

    const entry = this._getEntryForTile(tile);
    if (!entry) return;

    this._expandedTile = tile;
    tile.classList.add("expanded");
    tile.classList.toggle("expanded-full", size >= 100);
    this._applyExpandedBounds(tile, entry);
    const iframe = tile.querySelector("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.transform = "none";
    this._applyTileInteractivity(tile);
  }

  _collapseExpandedTile(skipAnimation) {
    const tile = this._expandedTile;
    if (!tile) return;
    const entry = this._getEntryForTile(tile);

    if (skipAnimation) {
      tile.classList.add("no-anim");
      void tile.offsetWidth;
    }

    tile.classList.remove("expanded");
    tile.classList.remove("expanded-full");
    if (entry) {
      this._applyEntryToTile(tile, entry);
      if (!skipAnimation) {
        const targetZ = `${entry.rank || 0}`;
        tile.style.zIndex = "10000";

        const finalizeZIndex = () => {
          tile.style.zIndex = targetZ;
        };

        const onTransitionEnd = (event) => {
          if (
            event.propertyName !== "left" &&
            event.propertyName !== "top" &&
            event.propertyName !== "width" &&
            event.propertyName !== "height"
          ) {
            return;
          }
          tile.removeEventListener("transitionend", onTransitionEnd);
          finalizeZIndex();
        };

        tile.addEventListener("transitionend", onTransitionEnd);
        setTimeout(() => {
          tile.removeEventListener("transitionend", onTransitionEnd);
          finalizeZIndex();
        }, 560);
      }
    }
    this._expandedTile = null;
    this._applyTileInteractivity(tile);

    if (skipAnimation) {
      requestAnimationFrame(() => tile.classList.remove("no-anim"));
    }
  }

  _getInteractiveSize() {
    const value = this._state.interactive;
    if (value === true) return 100;
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(value, 0), 100);
  }

  _getEntryForTile(tile) {
    const index = this._tiles.indexOf(tile);
    if (index < 0) return null;
    return (this._state.iframes || [])[index] || null;
  }

  _applyExpandedBounds(tile, entry) {
    const size = this._getInteractiveSize();
    if (size <= 0) return;

    tile.classList.toggle("expanded-full", size >= 100);

    const width = size;
    const height = size;
    const rightGap = 100 - (entry.x + entry.width);
    const bottomGap = 100 - (entry.y + entry.height);

    // Keep the expanded tile near its original side when possible, while
    // clamping the result so it always remains fully visible.
    const preferredLeft = rightGap < entry.x ? 100 - width - rightGap : entry.x;
    const preferredTop = bottomGap < entry.y ? 100 - height - bottomGap : entry.y;
    const left = Math.min(Math.max(preferredLeft, 0), 100 - width);
    const top = Math.min(Math.max(preferredTop, 0), 100 - height);

    tile.style.left = `${left}%`;
    tile.style.top = `${top}%`;
    tile.style.width = `${width}%`;
    tile.style.height = `${height}%`;
    tile.style.zIndex = "10000";
  }
}

export default MultiIframe;
