import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\3d-music-player',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
