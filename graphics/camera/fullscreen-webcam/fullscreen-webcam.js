/**
 * Fullscreen Webcam Graphic
 * Displays a webcam input in full screen.
 */

const DEFAULT_STATE = {
  deviceIndex: 0,
  width: 1920,
  height: 1080,
  frameRate: 30,
  objectFit: 'cover'
};

class FullscreenWebcam extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._stream = null;

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
        color: white;
        font-family: sans-serif;
      }
      video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      #device-list {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 8px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        display: none;
        z-index: 10;
      }
      h2 { margin-top: 0; }
      ul { list-style: none; padding: 0; }
      li { padding: 5px 0; border-bottom: 1px solid #444; }
      .device-index { font-weight: bold; color: #aaa; margin-right: 10px; }
      .device-label { color: #fff; }
    `;
    shadow.appendChild(style);

    this._video = document.createElement('video');
    this._video.autoplay = true;
    this._video.muted = true; // Avoid feedback loops
    this._video.playsInline = true;
    shadow.appendChild(this._video);

    this._deviceListContainer = document.createElement('div');
    this._deviceListContainer.id = 'device-list';
    this._deviceListContainer.innerHTML = '<h2>Available Video Inputs</h2><ul id="list-content"></ul>';
    shadow.appendChild(this._deviceListContainer);
    this._listContent = this._deviceListContainer.querySelector('#list-content');
  }

  connectedCallback() {
      // No specific resize logic needed as CSS handles layout
  }

  disconnectedCallback() {
    this._stopStream();
  }

  async load(params) {
    this._updateState(params.data);
    await this._startCamera();
    return { statusCode: 200 };
  }

  async dispose() {
    this._stopStream();
    return { statusCode: 200 };
  }

  async playAction(params) {
    if (this._state.deviceIndex > 0) {
        this._video.style.opacity = '1';
        if (this._video.paused) {
            try {
                await this._video.play();
            } catch (e) {
                console.error("Error playing video:", e);
            }
        }
    } else {
        this._deviceListContainer.style.display = 'block';
    }
    return { statusCode: 200 };
  }

  async stopAction(params) {
    this._video.style.opacity = '0';
    this._deviceListContainer.style.display = 'none';
    // We don't stop the stream here, just hide it, so it's ready for play again instantly.
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const oldState = { ...this._state };
    this._updateState(params.data);

    // If critical parameters changed, restart camera
    if (
        oldState.deviceIndex !== this._state.deviceIndex ||
        oldState.width !== this._state.width ||
        oldState.height !== this._state.height ||
        oldState.frameRate !== this._state.frameRate
    ) {
        await this._startCamera();
    }

    if (oldState.objectFit !== this._state.objectFit) {
        this._video.style.objectFit = this._state.objectFit;
    }

    // Update visibility based on play state roughly (ignoring refined state tracking for now as simple works)
    if (this._video.style.opacity === '1' || this._deviceListContainer.style.display === 'block') {
         if (this._state.deviceIndex === 0) {
             this._video.style.opacity = '0';
             this._deviceListContainer.style.display = 'block';
         } else {
             this._deviceListContainer.style.display = 'none';
             this._video.style.opacity = '1';
         }
    }

    return { statusCode: 200 };
  }

  // Non-realtime methods (no-op as per plan)
  async customAction(params) { return { statusCode: 200 }; }
  async goToTime(params) { return { statusCode: 200 }; }
  async setActionsSchedule(params) { return { statusCode: 200 }; }

  _updateState(data) {
    if (!data) return;
    this._state = { ...this._state, ...data };
  }

  async _startCamera() {
    if (this._stream) {
        this._stopStream();
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("Media Devices API not supported.");
        this._renderDeviceList([]);
        return;
    }

    try {
        // If we need to list devices, we first try to get permissions to ensure labels are visible
        if (this._state.deviceIndex === 0) {
             // Requesting a stream briefly to trigger permission prompt & ensure labels are available
             try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                tempStream.getTracks().forEach(t => t.stop());
             } catch (e) {
                 console.warn("Could not get permission/stream for listing:", e);
                 // We proceed anyway, maybe labels are empty but we can list IDs
             }

             const devices = await navigator.mediaDevices.enumerateDevices();
             const videoDevices = devices.filter(device => device.kind === 'videoinput');
             this._renderDeviceList(videoDevices);
             return;
        }

        // Normal camera start logic
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        let deviceId = undefined;
        if (videoDevices.length > 0) {
            // 1-based index conversion
            const targetIndex = this._state.deviceIndex - 1;
            const index = Math.max(0, Math.min(targetIndex, videoDevices.length - 1));
            deviceId = videoDevices[index].deviceId;
        } else {
             console.warn("No video devices found.");
             return;
        }

        const constraints = {
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: this._state.width },
                height: { ideal: this._state.height },
                frameRate: { ideal: this._state.frameRate }
            },
            audio: false
        };

        this._stream = await navigator.mediaDevices.getUserMedia(constraints);
        this._video.srcObject = this._stream;
        try {
            await this._video.play();
        } catch (e) {
             // Autoplay might fail if not interracted with, but we try.
        }

    } catch (err) {
        console.error("Error accessing camera:", err);
    }
  }

  _renderDeviceList(devices) {
      if (this._listContent) {
          // Display logic: show user-friendly 1-based index
          this._listContent.innerHTML = devices.length > 0
            ? devices.map((d, i) => `<li><span class="device-index">[${i + 1}]</span> <span class="device-label">${d.label || 'Unknown Device'}</span></li>`).join('')
            : '<li>No video input devices found.</li>';
      }
  }

  _stopStream() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
    this._video.srcObject = null;
  }
}

export default FullscreenWebcam;
