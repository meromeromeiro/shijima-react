import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    legacy({
      targets: ['ie >= 11','> 0.5%'],
      modernPolyfills: [
        'es.array.iterator',
        'es.promise',
        'es.object.assign'
      ],
      renderLegacyChunks: true,
      polyfills: true
    }),

    react(),
    tailwindcss(),

  ],
  server: {
    proxy: {
      // Proxying /api/v2 requests to your backend
      '/api/v2/': {
        target: 'https://moonchan.xyz', // e.g., http://localhost:8080 if backend is local
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api\/v2/, '/api/v2') // Usually not needed if target path is same
      }
    }
  },
  build: {
    // target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  optimizeDeps: {
    include: ['core-js']
  }

})