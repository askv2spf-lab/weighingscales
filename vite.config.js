import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'Калькулятор тензодатчика', short_name: 'Тензодатчик',
      description: 'Офлайн-калькулятор ваги та напруги',
      theme_color: '#07111f', background_color: '#07111f', display: 'standalone',
      orientation: 'any', start_url: './', scope: './', lang: 'uk',
      icons: [{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
    },
    workbox: {globPatterns:['**/*.{js,css,html,svg,webmanifest}'], navigateFallback:'index.html'}
  })]
})
