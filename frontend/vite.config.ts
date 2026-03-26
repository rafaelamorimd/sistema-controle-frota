import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const strApiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8000'
const numHmrClientPort = process.env.VITE_HMR_CLIENT_PORT
  ? Number(process.env.VITE_HMR_CLIENT_PORT)
  : undefined
const bolChokidarPolling = process.env.CHOKIDAR_USEPOLLING === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Gefther',
        short_name: 'Gefther',
        description: 'Gestao de frota e aluguel de veiculos',
        theme_color: '#2563eb',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: bolChokidarPolling ? { usePolling: true, interval: 800 } : undefined,
    hmr:
      numHmrClientPort != null && !Number.isNaN(numHmrClientPort)
        ? { clientPort: numHmrClientPort }
        : undefined,
    proxy: {
      '/api': {
        target: strApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
