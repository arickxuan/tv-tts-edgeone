import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'public/index.html',
        movie: 'public/movie.html',
        player: 'public/player.html',
        speech: 'public/speech.html'
      }
    }
  }
})