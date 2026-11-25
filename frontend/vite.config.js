import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    outDir: 'dist',
    // Every asset is emitted as a file, so the strict Content-Security-Policy in
    // nginx.conf never has to allow data: URLs for scripts or styles.
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'], // e2e/ belongs to Playwright
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
  },
});
