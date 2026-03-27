import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@workspace/api-client-react': path.resolve(__dirname, '../../lib/api-client-react/src'),
      '@workspace/api-spec': path.resolve(__dirname, '../../lib/api-spec/src'),
      '@workspace/api-zod': path.resolve(__dirname, '../../lib/api-zod/src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
