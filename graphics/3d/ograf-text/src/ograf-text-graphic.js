import * as THREE from 'three';
import { gsap } from 'gsap';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBMLoader } from 'three/addons/loaders/RGBMLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const FONT_URL = new URL('../New Science_Bold Extended.json', import.meta.url).href;
const DIFFUSE_ENV_URL = new URL('../brown_photostudio_02_1k-diffuse-RGBM.png', import.meta.url).href;
const SPECULAR_ENV_URL = new URL('../brown_photostudio_02_1k-specular-RGBM.png', import.meta.url).href;

const DEFAULT_STATE = Object.freeze({
  title: 'OGRAF GRAPHICS',
  subtitle: 'CONNECTED MOTION',
  topMaterial: 'brushedAluminium',
  bottomMaterial: 'brushedAluminium'
});

const MATERIAL_TYPES = new Set(['brushedAluminium', 'glossyOrangePlastic', 'reflectiveChrome']);
const CHROME_ENVIRONMENT_SCALE = 0.68;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function loadWith(loader, url) {
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

function createBrushedAluminiumTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const grain = Math.random() * 34;
      const band = Math.sin(y * 1.7) * 12;
      const value = clamp(128 + grain + band, 38, 228);
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1.0);
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default class OGrafMetallicText extends HTMLElement {
  constructor() {
    super();
    this._state = { ...DEFAULT_STATE };
    this._currentStep = undefined;
    this._visible = false;
    this._disposed = false;
    this._animationFrame = 0;
    this._lastFrameTime = 0;
    this._actionTimeline = null;
    this._idleTimeline = null;
    this._titleIdleTimeline = null;
    this._resourcePromise = null;
    this._resizeObserver = null;

    this.attachShadow({ mode: 'open' });
    this._canvas = document.createElement('canvas');
    this._canvas.setAttribute('aria-label', 'OGraf 3D text graphic');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;';
    this.shadowRoot.append(this._canvas);
  }

  connectedCallback() {
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._killAnimationTimelines();
    this._cancelAnimation();
  }

  async load({ data = {}, renderType = 'realtime', renderCharacteristics = {} } = {}) {
    if (this._disposed) return { statusCode: 410, statusMessage: 'Graphic has been disposed' };

    this._renderType = renderType;
    this._renderCharacteristics = renderCharacteristics;
    this._state = { ...this._state, ...this._normalizeData(data) };
    this._ensureRenderer();

    if (!this._resourcePromise) {
      this._resourcePromise = this._loadResources();
    }

    try {
      await this._resourcePromise;
      if (this._disposed) return { statusCode: 410, statusMessage: 'Graphic has been disposed' };
      this._buildScene();
      this._resize();
      this._startRenderLoop();
      return { statusCode: 200, statusMessage: 'Ready' };
    } catch (error) {
      this._resourcePromise = null;
      console.error('[OGraf] Failed to load graphic resources', error);
      return { statusCode: 500, statusMessage: error.message };
    }
  }

  async dispose() {
    this._disposed = true;
    this._killAnimationTimelines();
    this._cancelAnimation();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;

    if (this._scene) {
      this._scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
    }

    this._resources?.forEach((resource) => resource?.dispose?.());
    this._renderer?.dispose();
    this._renderer?.forceContextLoss?.();
    this._renderer = null;
    return { statusCode: 200, statusMessage: 'Disposed' };
  }

  async playAction({ goto, delta, skipAnimation = false } = {}) {
    const target = goto !== undefined
      ? (goto >= 0 ? goto : undefined)
      : ((this._currentStep === undefined ? -1 : this._currentStep) + (delta ?? 1));

    if (target === undefined || target >= 1) {
      await this.stopAction({ skipAnimation });
      return { statusCode: 200, statusMessage: 'Transitioned to end', currentStep: undefined };
    }

    this._currentStep = 0;
    this._prepareTitleFlyIn(skipAnimation);
    await this._setVisibility(true, skipAnimation, 'in');
    return { statusCode: 200, statusMessage: 'Playing', currentStep: 0 };
  }

  async stopAction({ skipAnimation = false } = {}) {
    await this._setVisibility(false, skipAnimation, 'out');
    this._currentStep = undefined;
    return { statusCode: 200, statusMessage: 'Stopped' };
  }

  async updateAction({ data = {}, skipAnimation = false } = {}) {
    if (this._disposed) return { statusCode: 410, statusMessage: 'Graphic has been disposed' };
    const nextState = { ...this._state, ...this._normalizeData(data) };
    const textChanged = nextState.title !== this._state.title || nextState.subtitle !== this._state.subtitle;
    const materialsChanged = nextState.topMaterial !== this._state.topMaterial
      || nextState.bottomMaterial !== this._state.bottomMaterial;
    this._state = nextState;

    if (this._scene && (textChanged || materialsChanged)) {
      if (materialsChanged) this._applyMaterials();
      if (textChanged) this._setText(nextState.title, nextState.subtitle);
    }

    return { statusCode: 200, statusMessage: 'Updated' };
  }

  async customAction({ id } = {}) {
    return { statusCode: 400, statusMessage: `No custom action supported: ${id ?? 'unknown'}` };
  }

  _normalizeData(data) {
    return {
      title: typeof data.title === 'string' ? data.title : this._state.title,
      subtitle: typeof data.subtitle === 'string' ? data.subtitle : this._state.subtitle,
      topMaterial: MATERIAL_TYPES.has(data.topMaterial) ? data.topMaterial : this._state.topMaterial,
      bottomMaterial: MATERIAL_TYPES.has(data.bottomMaterial) ? data.bottomMaterial : this._state.bottomMaterial
    };
  }

  _ensureRenderer() {
    if (this._renderer) return;

    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });
    this._renderer.setClearColor(0x000000, 0);
    this._renderer.setClearAlpha(0);
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.2;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  async _loadResources() {
    const fontLoader = new FontLoader();
    const rgbmLoader = new RGBMLoader().setMaxRange(16);
    const [font, diffuseEnvironment, specularEnvironment] = await Promise.all([
      loadWith(fontLoader, FONT_URL),
      loadWith(rgbmLoader, DIFFUSE_ENV_URL),
      loadWith(rgbmLoader, SPECULAR_ENV_URL)
    ]);

    // The specular asset is a prefiltered CubeUV environment. The diffuse asset
    // supplies the low-frequency irradiance term through the material envMap,
    // while the specular asset supplies reflection levels through scene.environment.
    diffuseEnvironment.mapping = THREE.EquirectangularReflectionMapping;
    specularEnvironment.mapping = THREE.CubeUVReflectionMapping;
    diffuseEnvironment.colorSpace = THREE.LinearSRGBColorSpace;
    specularEnvironment.colorSpace = THREE.LinearSRGBColorSpace;

    this._resources = [diffuseEnvironment, specularEnvironment];
    this._font = font;
    this._diffuseEnvironment = diffuseEnvironment;
    this._specularEnvironment = specularEnvironment;
  }

  _buildScene() {
    if (this._scene) return;

    this._scene = new THREE.Scene();
    this._scene.background = null;
    this._scene.environment = this._specularEnvironment;

    this._camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.1, 100);
    this._camera.position.set(0, 0.18, 12.3);
    this._camera.lookAt(0, 0, 0);

    // Keep the environment as a restrained base fill and let the colored
    // spotlights create the readable highlights and depth on the metal.
    this._lights = new THREE.Group();
    this._scene.add(this._lights);
    this._spotlights = [
      this._createSpotlight(0x25d9ff, 80, [-5.2, 4.2, 6.5], Math.PI / 6, 0.5),
      this._createSpotlight(0xff2b9d, 95, [5.2, 2.0, 4.5], Math.PI / 5, 0.65),
      this._createSpotlight(0xffb347, 55, [3.5, -4.0, 5.5], Math.PI / 4, 0.72)
    ];

    this._applyMaterials();

    this._textRoot = new THREE.Group();
    this._motionGroup = new THREE.Group();
    this._textRoot.add(this._motionGroup);
    this._scene.add(this._textRoot);
    this._setText(this._state.title, this._state.subtitle);
    this._startIdleMotion();
    this._textRoot.visible = false;
    this._setTextOpacity(0);
  }

  _createMaterial(type) {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb9c3ca,
      metalness: 1,
      roughness: 0.32,
      envMap: this._diffuseEnvironment,
      envMapIntensity: 0.11,
      clearcoat: 0.16,
      clearcoatRoughness: 0.22,
      anisotropy: 0.58,
      anisotropyRotation: Math.PI / 2,
      premultipliedAlpha: false,
      transparent: true,
      depthWrite: true
    });

    if (type === 'glossyOrangePlastic') {
      material.color.set(0xff6a00);
      material.metalness = 0;
      material.roughness = 0.16;
      material.clearcoat = 0.72;
      material.clearcoatRoughness = 0.1;
      // Keep the orange plastic driven mainly by the colored spotlights;
      // lower image-based fill prevents the ambient environment from washing
      // out its saturated color.
      material.anisotropy = 0;
    } else if (type === 'reflectiveChrome') {
      material.color.set(0xffffff);
      material.roughness = 0.035;
      material.clearcoat = 0.35;
      material.clearcoatRoughness = 0.04;
      material.envMap = this._specularEnvironment;
      material.anisotropy = 0;
      material.envMapRotation.set(0, 0, 0);
      material.onBeforeCompile = (shader) => {
        // CubeUV maps are sampled from a direction rather than UVs. Compress
        // that direction around the forward axis to show more of the studio
        // environment in each reflection.
        shader.fragmentShader = shader.fragmentShader.replace(
          'vec3 reflectVec = reflect( - viewDir, normal );',
          `vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( vec3( 0.0, 0.0, 1.0 ), reflectVec, ${CHROME_ENVIRONMENT_SCALE.toFixed(2)} ) );`
        );
      };
    } else {
      material.roughnessMap = createBrushedAluminiumTexture();
    }

    return material;
  }

  _applyMaterials() {
    const previous = [this._topMaterial, this._bottomMaterial];
    this._topMaterial = this._createMaterial(this._state.topMaterial);
    this._bottomMaterial = this._createMaterial(this._state.bottomMaterial);
    this._setTextOpacity(this._textMaterialOpacity ?? 0);

    this._titleGroup?.traverse((child) => { if (child.isMesh) child.material = this._topMaterial; });
    if (this._subtitleMesh) this._subtitleMesh.material = this._bottomMaterial;
    previous.forEach((material) => {
      if (material && material !== this._topMaterial && material !== this._bottomMaterial) {
        material.roughnessMap?.dispose();
        material.dispose();
      }
    });
  }

  _setTextOpacity(value) {
    this._textMaterialOpacity = value;
    if (this._topMaterial) this._topMaterial.opacity = value;
    if (this._bottomMaterial) this._bottomMaterial.opacity = value;
  }

  _setTextTransparency(transparent) {
    [this._topMaterial, this._bottomMaterial].forEach((material) => {
      if (material) material.transparent = transparent;
    });
  }

  _createSpotlight(color, intensity, position, angle, penumbra) {
    const light = new THREE.SpotLight(color, intensity, 30, angle, penumbra, 1.7);
    light.position.set(...position);
    light.target.position.set(0, 0, 0);
    this._lights.add(light, light.target);
    return light;
  }

  _setText(title, subtitle) {
    if (!this._motionGroup) return;
    this._motionGroup.traverse((child) => child.geometry?.dispose());
    this._motionGroup.clear();
    this._titleGroup = this._createCharacterText(title, {
      size: 1.26,
      depth: 0.19,
      maxWidth: 8.8,
      y: 0.23
    });
    this._subtitleMesh = this._createTextMesh(subtitle, {
      size: 0.48,
      depth: 0.11,
      maxWidth: 8.3,
      y: -0.77
    });
    this._motionGroup.add(this._titleGroup, this._subtitleMesh);
  }

  _createCharacterText(value, { size, depth, maxWidth, y }) {
    const group = new THREE.Group();
    const characters = [];
    const behindCameraZ = this._camera.position.z + 25;

    // Use the original full-line geometry as the layout reference. Individual
    // meshes must keep its baseline and side bearings; centering every glyph
    // from its own bounding box makes characters such as capitals, descenders,
    // and punctuation drift vertically and horizontally.
    const referenceGeometry = this._createTextGeometry(value, size, depth);
    referenceGeometry.computeBoundingBox();
    const referenceBounds = referenceGeometry.boundingBox;
    const referenceWidth = referenceBounds.max.x - referenceBounds.min.x;
    const referenceCenterX = (referenceBounds.min.x + referenceBounds.max.x) / 2;
    const referenceCenterY = (referenceBounds.min.y + referenceBounds.max.y) / 2;
    referenceGeometry.dispose();

    let cursor = 0;
    let previousCharacter = null;

    for (const character of [...(value || ' ')]) {
      cursor += this._getKerningAdjustment(previousCharacter, character, size);

      if (!/\s/.test(character)) {
        const geometry = this._createTextGeometry(character, size, depth);

        // Keep the glyph's native x side bearing and y baseline. Only apply
        // the same line-centering offset that the original full geometry uses.
        geometry.translate(0, -referenceCenterY, -depth / 2);

        const mesh = new THREE.Mesh(geometry, this._topMaterial);
        mesh.position.x = cursor;
        const rotationDirection = characters.length % 2 ? -1 : 1;
        mesh.userData.flyIn = {
          base: new THREE.Vector3(cursor, 0, 0),
          // Keep the launch point behind the camera in world space.
          start: new THREE.Vector3(cursor, rotationDirection * 0.95, behindCameraZ),
          baseRotation: 0,
          startRotation: (characters.length % 2 ? -1 : 1) * 0.72,
          baseRotationY: 0,
          startRotationY: rotationDirection * (1.8 + (characters.length % 4) * 0.22),
          delay: characters.length * 48,
          duration: 620
        };
        characters.push(mesh);
        group.add(mesh);
      }

      cursor += this._getCharacterAdvance(character, size);
      previousCharacter = character;
    }

    const scale = Math.min(1, maxWidth / Math.max(referenceWidth, 0.001));
    group.scale.setScalar(scale);
    group.position.set(-referenceCenterX * scale, y, 0);
    group.userData.characters = characters;
    return group;
  }

  _createTextGeometry(value, size, depth) {
    return new TextGeometry(value || ' ', {
      font: this._font,
      size,
      depth,
      curveSegments: 20,
      bevelEnabled: true,
      bevelThickness: Math.min(depth * 0.32, 0.06),
      bevelSize: Math.min(size * 0.035, 0.05),
      bevelSegments: 10
    });
  }

  _getCharacterAdvance(character, size) {
    const data = this._font.data || {};
    const glyph = data.glyphs?.[character] || data.glyphs?.['?'];
    if (glyph && Number.isFinite(glyph.ha)) {
      return glyph.ha * size / (data.resolution || 1000);
    }

    return size * (/\s/.test(character) ? 0.38 : 0.62);
  }

  _getKerningAdjustment(previousCharacter, character, size) {
    const kerning = this._font.data?.kerning;
    if (!previousCharacter || !kerning) return 0;

    const previousCode = previousCharacter.charCodeAt(0);
    const characterCode = character.charCodeAt(0);
    const pair = `${previousCharacter}${character}`;
    const candidates = [
      kerning[pair],
      kerning[previousCharacter]?.[character],
      kerning[previousCode]?.[characterCode],
      kerning[previousCode]?.[character],
      kerning[previousCharacter]?.[characterCode]
    ];
    const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
    return value === undefined ? 0 : Number(value) * size / (this._font.data?.resolution || 1000);
  }

  _createTextMesh(value, { size, depth, maxWidth, y }) {
    const geometry = this._createTextGeometry(value, size, depth);

    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const width = bounds.max.x - bounds.min.x;
    const scale = Math.min(1, maxWidth / Math.max(width, 0.001));
    geometry.translate(-(bounds.min.x + width / 2), -(bounds.min.y + bounds.max.y) / 2, -depth / 2);

    const mesh = new THREE.Mesh(geometry, this._bottomMaterial);
    mesh.scale.setScalar(scale);
    mesh.position.y = y;
    mesh.position.z = 0;
    return mesh;
  }

  _prepareTitleFlyIn(skipAnimation) {
    const characters = this._titleGroup?.userData.characters || [];
    characters.forEach((mesh) => {
      const flyIn = mesh.userData.flyIn;
      const position = skipAnimation ? flyIn.base : flyIn.start;
      gsap.set(mesh.position, position);
      gsap.set(mesh.rotation, {
        z: skipAnimation ? flyIn.baseRotation : flyIn.startRotation,
        y: skipAnimation ? flyIn.baseRotationY : flyIn.startRotationY
      });
    });
  }

  _startIdleMotion() {
    this._idleTimeline?.kill();
    this._idleTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut' }
    });
    this._idleTimeline
      .to(this._motionGroup.rotation, { y: 0.055, duration: 2.7 }, 0)
      .to(this._motionGroup.rotation, { x: 0.014, duration: 1.9 }, 0)
      .to(this._motionGroup.position, { y: 0.015, duration: 1.5 }, 0);
  }

  _killAnimationTimelines() {
    this._actionTimeline?.kill();
    this._actionTimeline = null;
    this._idleTimeline?.kill();
    this._idleTimeline = null;
    this._titleIdleTimeline?.kill();
    this._titleIdleTimeline = null;
  }

  _setVisibility(visible, skipAnimation, type) {
    if (!this._textRoot) return Promise.resolve();
    this._visible = visible;
    this._textRoot.visible = true;

    this._actionTimeline?.kill();
    this._actionTimeline = null;

    if (skipAnimation) {
      this._textRoot.scale.setScalar(visible ? 1 : 0.94);
      this._textRoot.position.set(0, visible ? 0 : -0.12, 0);
      this._setTextOpacity(visible ? 1 : 0);
      this._setTextTransparency(!visible);
      [this._topMaterial, this._bottomMaterial].forEach((material) => { if (material) material.depthWrite = true; });
      if (!visible) this._textRoot.visible = false;
      else this._startTitleIdleAnimation();
      return Promise.resolve();
    }

    // Use straight-alpha blending for the entire transition and keep depth
    // writes enabled so the extruded front faces do not accumulate their own
    // semi-transparent back/side surfaces as a dark ghost.
    [this._topMaterial, this._bottomMaterial].forEach((material) => {
      if (material) {
        material.premultipliedAlpha = false;
        material.transparent = true;
        material.depthWrite = true;
      }
    });

    return new Promise((resolve) => {
      const duration = type === 'in' ? 0.95 : 0.65;
      const timeline = gsap.timeline({
        onComplete: () => {
          this._actionTimeline = null;
          if (type === 'in') {
            [this._topMaterial, this._bottomMaterial].forEach((material) => { if (material) { material.depthWrite = true; material.transparent = false; } });
            this._startTitleIdleAnimation();
          } else {
            [this._topMaterial, this._bottomMaterial].forEach((material) => { if (material) { material.depthWrite = true; material.transparent = false; } });
            this._textRoot.visible = false;

            this._titleIdleTimeline?.kill();
            this._titleIdleTimeline = null;
          }
          resolve();
        }
      });
      this._actionTimeline = timeline;

      if (type === 'in') {
        timeline
          .to(this._textRoot.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration,
            ease: 'power4.out'
          }, 0)
          .to(this._textRoot.position, {
            y: 0,
            duration,
            ease: 'power4.out'
          }, 0)
          .to(this, {
            _textMaterialOpacity: 1,
            duration: duration * 0.72,
            ease: 'power2.out',
            onUpdate: () => this._setTextOpacity(this._textMaterialOpacity)
          }, 0);

        const characters = this._titleGroup?.userData.characters || [];
        characters.forEach((mesh) => {
          const flyIn = mesh.userData.flyIn;
          const startAt = flyIn.delay / 1000;
          const tween = {
            x: flyIn.base.x,
            y: flyIn.base.y,
            z: flyIn.base.z,
            duration: flyIn.duration / 1000,
            ease: 'power4.out'
          };
          timeline.to(mesh.position, tween, startAt);
          timeline.to(mesh.rotation, {
            y: flyIn.baseRotationY,
            z: flyIn.baseRotation,
            duration: flyIn.duration / 1000,
            ease: 'power3.out'
          }, startAt);
        });
      } else {
        timeline
          .to(this._textRoot.scale, {
            x: 0.94,
            y: 0.94,
            z: 0.94,
            duration,
            ease: 'power3.inOut'
          }, 0)
          .to(this._textRoot.position, {
            y: -0.12,
            duration,
            ease: 'power3.inOut'
          }, 0)
          .to(this, {
            _textMaterialOpacity: 0,
            duration: duration * 0.82,
            ease: 'power2.in',
            onUpdate: () => this._setTextOpacity(this._textMaterialOpacity)
          }, 0);
      }
    });
  }

  _startTitleIdleAnimation() {
    this._titleIdleTimeline?.kill();
    this._titleIdleTimeline = null;

    const characters = this._titleGroup?.userData.characters || [];
    if (!characters.length || !this._visible) return;

    // Each glyph occupies one stagger slot. The last glyph finishes at about
    // two seconds, then the timeline waits ten seconds before repeating.
    const characterDuration = 10 / characters.length;
    const titleIdleTimeline = gsap.timeline({
      delay: 1,
      repeat: -1,
      repeatDelay: 10
    });

    characters.forEach((mesh, index) => {
      const turn = 2 * Math.PI;
      const startAt = index * (characterDuration / 10);
      titleIdleTimeline.to(mesh.rotation, {
        x: turn,
        duration: characterDuration,
        ease: 'sine.inOut'
      }, startAt);
      titleIdleTimeline.set(mesh.rotation, { x: 0 }, 2);
    });

    this._titleIdleTimeline = titleIdleTimeline;
  }

  _startRenderLoop() {
    if (this._animationFrame) return;
    this._lastFrameTime = performance.now();
    const render = (time) => {
      this._animationFrame = requestAnimationFrame(render);
      const delta = Math.min((time - this._lastFrameTime) / 1000, 0.1);
      this._lastFrameTime = time;
      this._update(delta);
      this._renderer.render(this._scene, this._camera);
    };
    this._animationFrame = requestAnimationFrame(render);
  }

  _cancelAnimation() {
    if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    this._animationFrame = 0;
  }

  _update(delta) {
    if (!this._scene) return;
    if (this._visible && this._spotlights) {
      const time = performance.now() * 0.001;
      this._spotlights[0].position.x = -5.2 + Math.sin(time * 0.24) * 0.7;
      this._spotlights[0].position.y = 4.2 + Math.cos(time * 0.31) * 0.35;
      this._spotlights[1].position.x = 5.2 + Math.cos(time * 0.2) * 0.8;
      this._spotlights[1].position.y = 2.0 + Math.sin(time * 0.27) * 0.5;
      this._spotlights[2].position.x = 3.5 + Math.sin(time * 0.18) * 0.55;
      this._spotlights[2].position.z = 5.5 + Math.cos(time * 0.23) * 0.5;

      // Rotate the explicit chrome environment map so its studio highlights
      // travel across the letters and make the reflection source apparent.
      [this._topMaterial, this._bottomMaterial].forEach((material) => {
        if (material?.envMap === this._specularEnvironment) {
          material.envMapRotation.y = time * 0.22;
          material.envMapRotation.x = Math.sin(time * 0.12) * 0.08;
        }
      });
    }
  }

  _resize() {
    if (!this._renderer || !this._camera) return;
    const width = Math.max(1, this.clientWidth || 1920);
    const height = Math.max(1, this.clientHeight || 1080);
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }
}
