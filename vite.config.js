import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // Existing proxy for /api requests
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': { // Add this to proxy /auth requests
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});