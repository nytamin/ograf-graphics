# OGraf brushed aluminium text

This folder contains a Three.js OGraf Graphic for a 1920 × 1080 renderer. The
manifest is [`ograf-text.ograf.json`](./ograf-text.ograf.json), and its
production entrypoint is `dist/ograf-text-graphic.js`.

The custom element accepts the OGraf state fields `title` and `subtitle`. It
loads the supplied typeface through `FontLoader`, builds two extruded
`TextGeometry` meshes, and uses both supplied RGBM images with `RGBMLoader` for
the text environment. The WebGL renderer uses an alpha channel and explicitly
keeps `scene.background` null, so the graphic canvas itself is transparent.

## Preview and build

```sh
npm install
npm run dev
```

The local preview includes a checkerboard-style presentation background only
to make transparency visible. The OGraf canvas remains transparent.

```sh
npm run build
```

The build emits the standalone OGraf entrypoint and copies the font and RGBM
assets into `dist/assets`.
