import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // OGraf renderers load the manifest and main module from arbitrary URLs.
  // Keep Vite's generated asset URLs relative to the bundled entrypoint.
  base: './',
  build: {
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: {
        preview: fileURLToPath(new URL('./index.html', import.meta.url)),
        graphic: fileURLToPath(new URL('./src/ograf-text-graphic.js', import.meta.url))
      },
      output: {
        exports: 'auto',
        entryFileNames: (chunk) => chunk.name === 'graphic'
          ? 'ograf-text-graphic.js'
          : 'assets/[name]-[hash].js'
      }
    }
  }
});
