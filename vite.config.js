import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
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