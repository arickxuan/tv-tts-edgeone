import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'libs',
  build: {
    outDir: 'out',
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