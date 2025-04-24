import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/weatherxm-pro-pwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WeatherXM Pro PWA',
        short_name: 'WXM Pro',
        description: 'View WeatherXM Pro data',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Placeholder icon name
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Placeholder icon name
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
      protocol: 'ws'
    }
  }
})
