import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // PWA as in TeamWERK: manifest generated here, service worker src/sw.ts
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        // index.html stays out of the precache (navigations are network first);
        // the card images (assets/, ~220 MB) are cached on use, not up front
        globPatterns: ['**/*.{js,css,woff2}', 'icons/*.png', 'favicon.svg'],
        globIgnores: ['assets/**/*.{png,jpg,jpeg,webp}'],
      },
      manifest: {
        name: 'Portale von Molthar',
        short_name: 'Molthar',
        description: 'Portale von Molthar online – mit Freunden oder gegen Computergegner.',
        lang: 'de',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        categories: ['games'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Full-bleed background, logo inside the 80 % safe zone
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  publicDir: 'public',
  optimizeDeps: {
    include: ['@portale-von-molthar/shared'],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  }
})
