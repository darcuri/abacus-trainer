import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  // Relative base so the build works from any static host path (e.g. GitHub Pages).
  base: './',
  plugins: [preact()],
});
