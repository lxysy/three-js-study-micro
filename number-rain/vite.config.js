import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\number-rain',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
