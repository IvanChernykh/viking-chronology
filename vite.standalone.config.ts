import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2018',
    outDir: 'standalone-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
    chunkSizeWarningLimit: 1700,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'VikingChronology',
        inlineDynamicImports: true,
      },
    },
  },
});
