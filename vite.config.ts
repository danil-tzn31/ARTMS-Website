import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Split the two animation libraries out of the app chunk. They change
        // far less often than the page code, so they stay cached across
        // deploys instead of being re-downloaded with every copy tweak.
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/motion-')) return 'motion'
          return undefined
        },
      },
    },
  },
})
