import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\canvas-texture',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
