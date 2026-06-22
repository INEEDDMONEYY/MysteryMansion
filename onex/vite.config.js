import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/context': path.resolve(__dirname, './src/context'),
    },
  },
  server: {
    proxy: {
      // All /api/* requests proxy to the local backend (which has /api/auth/* routes natively).
      '/api': {
        target: 'http://localhost:5020',
        changeOrigin: true,
        secure: false,
      },
    },
    host: '0.0.0.0', // ✅ allow external connections
    hmr: {
      protocol: 'wss',
      clientPort: 443, // ✅ browser connects over HTTPS
    },
  },
})
