/**
 * Remote Video Graphic
 * Plays YouTube or Vimeo videos in full screen using iframes.
 */

const DEFAULT_STATE = {
  url: "",
  volume: 100,
  loop: false
};

class RemoteVideo extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentPlatform = null;
    this._iframe = null;

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }
      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        opacity: 0; /* Hidden by default until play */
        transition: opacity 0.5s ease;
        pointer-events: none; /* Disable interaction unless needed? Ograf usually controls playback */
      }
    `;
    shadow.appendChild(style);
    this._container = shadow;
  }

  connectedCallback() {}

  disconnectedCallback() {
    this._clearIframe();
  }

  async load(params) {
    this._updateState(params.data);
    this._setupVideo();
    return { statusCode: 200 };
  }

  async dispose() {
    this._clearIframe();
    return { statusCode: 200 };
  }

  async playAction(params) {
    if (this._iframe) {
        this._iframe.style.opacity = '1';
        this._playVideo();
    }
    return { statusCode: 200 };
  }

  async stopAction(params) {
    if (this._iframe) {
        this._iframe.style.opacity = '0';
        this._pauseVideo();
    }
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const oldUrl = this._state.url;
    const oldVolume = this._state.volume;

    this._updateState(params.data);

    if (this._state.url !== oldUrl) {
        this._setupVideo();
        // If we were playing (opacity 1), we might want to autoplay the new one or wait for next play call.
        // Usually, updateAction updates content live. If visibility is 1, we should probably play.
        if (this._iframe && this._iframe.style.opacity === '1') {
             // Give iframe a moment to load then play?
             // Logic simplified: just setup. _setupVideo clears old iframe.
             // We need to restore opacity if it was visible.
             this._iframe.style.opacity = '1';
             // We can't immediately play because iframe isn't loaded.
             // Embeds usually autoplay if allowed.
        }
    } else if (this._state.volume !== oldVolume) {
        this._setVolume(this._state.volume);
    }

    return { statusCode: 200 };
  }

  // Non-realtime methods (no-op)
  async customAction(params) { return { statusCode: 200 }; }
  async goToTime(params) { return { statusCode: 200 }; }
  async setActionsSchedule(params) { return { statusCode: 200 }; }

  _updateState(data) {
    if (!data) return;
    this._state = { ...this._state, ...data };
  }

  _clearIframe() {
      if (this._iframe) {
          this._iframe.remove();
          this._iframe = null;
      }
      this._currentPlatform = null;
  }

  _setupVideo() {
      this._clearIframe();
      const url = this._state.url;
      if (!url) return;

      const { platform, id } = this._parseUrl(url);
      if (!platform || !id) {
          console.warn("Invalid or unsupported video URL:", url);
          return;
      }

      this._currentPlatform = platform;
      this._iframe = document.createElement('iframe');
      this._iframe.allow = "autoplay; encrypted-media";

      let src = "";
      if (platform === 'youtube') {
          // enablejsapi=1 is required for postMessage
          // autoplay=1 might be needed but we control via playAction
          // controls=0 to hide UI
          // mute=1 if we want to ensure autoplay? We will try to respect volume.
          src = `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=0&rel=0&iv_load_policy=3&disablekb=1&loop=${this._state.loop ? 1 : 0}&playlist=${id}`; // Loop requires playlist=id
      } else if (platform === 'vimeo') {
          // api=1, background=1 (hides controls, loops, autoplays usually), but we want manual control?
          // background=1 makes it muted by default usually.
          // controls=0
          src = `https://player.vimeo.com/video/${id}?api=1&badge=0&autopause=0&player_id=vimeo_player&controls=0&loop=${this._state.loop ? 1 : 0}`;
      }

      this._iframe.src = src;
      this._container.appendChild(this._iframe);

      // We might need to wait for load to set volume, but safe to send messages usually after a bit.
      this._iframe.onload = () => {
          this._setVolume(this._state.volume);
      };
  }

  _playVideo() {
      if (!this._iframe) return;
      if (this._currentPlatform === 'youtube') {
          this._postMessage({ event: 'command', func: 'playVideo', args: [] });
      } else if (this._currentPlatform === 'vimeo') {
           this._postMessage({ method: 'play' });
      }
  }

  _pauseVideo() {
      if (!this._iframe) return;
      if (this._currentPlatform === 'youtube') {
          this._postMessage({ event: 'command', func: 'pauseVideo', args: [] });
      } else if (this._currentPlatform === 'vimeo') {
           this._postMessage({ method: 'pause' });
      }
  }

  _setVolume(vol) {
      if (!this._iframe) return;
      if (this._currentPlatform === 'youtube') {
          this._postMessage({ event: 'command', func: 'setVolume', args: [vol] });
      } else if (this._currentPlatform === 'vimeo') {
          // Vimeo takes 0-1
           this._postMessage({ method: 'setVolume', value: vol / 100 });
      }
  }

  _postMessage(msg) {
      if (this._iframe && this._iframe.contentWindow) {
          this._iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
      }
  }

  _parseUrl(url) {
      let platform = null;
      let id = null;

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          platform = 'youtube';
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          id = (match && match[2].length === 11) ? match[2] : null;
      } else if (url.includes('vimeo.com')) {
          platform = 'vimeo';
          const regExp = /vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
          const match = url.match(regExp);
          id = match ? match[1] : null;
      }

      return { platform, id };
  }
}

export default RemoteVideo;
