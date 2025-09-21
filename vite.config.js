import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  // Configuración para assets estáticos
  assetsInclude: ['**/*.ogg', '**/*.mp3', '**/*.png', '**/*.jpg', '**/*.svg']
})
