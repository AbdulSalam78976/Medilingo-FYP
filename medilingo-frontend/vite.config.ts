import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BACKEND = 'http://localhost:8000'
const proxy = (path: string) => ({ [path]: { target: BACKEND, changeOrigin: true } })

// Admin API calls share the /admin prefix with the frontend route.
// Bypass the proxy for browser navigation (Accept: text/html) so the SPA
// handles /admin and /admin/login; only proxy actual API calls.
const adminProxy = {
  '/admin': {
    target: BACKEND,
    changeOrigin: true,
    bypass(req: { headers: Record<string, string | string[] | undefined> }) {
      if ((req.headers['accept'] ?? '').toString().includes('text/html')) {
        return '/index.html';
      }
    },
  },
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Medilingo',
        short_name: 'Medilingo',
        description: 'Cross-lingual medical AI assistant — English, Urdu, Roman Urdu',
        theme_color: '#1A5F7A',
        background_color: '#FAFAF7',
        display: 'standalone',
        start_url: '/chat',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      ...proxy('/auth'),
      ...proxy('/sessions'),
      ...proxy('/query'),
      ...proxy('/retrieve'),
      ...proxy('/pipeline'),
      ...proxy('/config'),
      ...proxy('/info'),
      ...proxy('/health'),
      ...adminProxy,
      ...proxy('/symptom-check'),
      ...proxy('/drug-interactions'),
    },
  },
})
