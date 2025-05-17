// vite.config.js (example proxy)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(), tailwindcss(),
  ],
  server: {
    proxy: {
      '/shijima': { // Or just /api if your backend is structured that way
        target: 'https://moonchan.xyz/shijima', // Your backend server
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/shijima/, '') // if you need to rewrite
      },
      '/api': { // For posting
        target: 'https://moonchan.xyz/shijima',
        changeOrigin: true,
      }
    }
  }
})