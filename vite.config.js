import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://spistaccess.site',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://spistaccess.site',
        changeOrigin: true,
        secure: true,
      },
      '/classrooms': {
        target: 'https://spistaccess.site',
        changeOrigin: true,
        secure: true,
      }
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
