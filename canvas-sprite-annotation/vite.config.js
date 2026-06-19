import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\canvas-sprite-annotation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
