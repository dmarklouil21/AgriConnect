import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Any request starting with /uploads goes to backend
      '/uploads': 'http://localhost:5000',
      // Any request starting with /api goes to backend
      // '/api': 'http://localhost:5000', 
    }
  },
  plugins: [react()],
})
