import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for Metro Rail Scheduler.
 *
 * Path aliases:
 *   @/          →  src/
 *   @/app/      →  src/app/
 *   @/styles/   →  src/styles/
 *
 * Usage example:
 *   import { seedAlerts } from '@/app/data';
 *   import { MetroLine }  from '@/app/types';
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Raw asset imports allowed for these extensions (never add .css / .tsx / .ts here)
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/schedules': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/realtime': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'ES2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-ui': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'vendor-maps': ['leaflet'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
});
