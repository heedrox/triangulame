import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          // Separar Phaser en su propio chunk
          phaser: ['phaser'],
          // Separar otras librerías
          vendor: ['uuid', 'i18next']
        }
      }
    },
    // Aumentar el límite de warning para chunks grandes (Phaser es pesado)
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  // Configuración para assets estáticos
  assetsInclude: ['**/*.ogg', '**/*.mp3', '**/*.png', '**/*.jpg', '**/*.svg']
})
