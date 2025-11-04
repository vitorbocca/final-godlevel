import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';

export default defineConfig({
  plugins: [vue(), quasar({})],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // Use backend service name in Docker, or localhost when running locally
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});

