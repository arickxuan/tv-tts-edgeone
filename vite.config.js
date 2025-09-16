import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'libs',
  build: {
    rollupOptions: {
      input: {
        movie: 'movie.html',
        player: 'player.html',
        speech: 'speech.html'
      }
    }
  }
})