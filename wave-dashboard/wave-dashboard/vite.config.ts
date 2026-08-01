import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = 'http://127.0.0.1:4000';

export default defineConfig({
  root: 'client',
  plugins: [react()],
  server: {
    port: 5173,
    // The dev server proxies the API so the frontend can use same-origin
    // relative URLs (/api/...) in both dev and production.
    proxy: {
      '/api': { target: API, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
