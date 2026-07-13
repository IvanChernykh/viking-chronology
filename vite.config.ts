import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2018',
    sourcemap: false,
    modulePreload: { polyfill: true },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@react-three') || id.includes('node_modules/three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/topojson') || id.includes('node_modules/world-atlas')) {
            return 'geo-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
