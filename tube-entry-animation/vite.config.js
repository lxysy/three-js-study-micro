import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\tube-entry-animation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
