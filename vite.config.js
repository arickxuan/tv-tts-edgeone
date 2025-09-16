import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        movie: 'movie.html',
        player: 'player.html',
        speech: 'speech.html'
      }
    }
  }
})