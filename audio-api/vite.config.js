import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\audio-api',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
