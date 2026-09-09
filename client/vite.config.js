import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all network addresses
    proxy: {
      '/api': 'http://localhost:5000',
      '/download.html': 'http://localhost:5000',
    },
  }
})
