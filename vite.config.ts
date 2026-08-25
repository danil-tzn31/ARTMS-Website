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
        // GSAP only. It is used by every section, so a stable vendor chunk
        // keeps it cached across deploys instead of being re-downloaded with
        // every copy tweak.
        //
        // Framer Motion is deliberately NOT listed. Naming a chunk manually
        // promotes it into the entry's static graph, which defeats the dynamic
        // import in Members.tsx: the dossier split into its own file but
        // framer-motion stayed modulepreloaded on first paint, so the code
        // split bought nothing. Left alone, the dynamic import produces its own
        // chunk and it loads on hover instead.
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          return undefined
        },
      },
    },
  },
})
