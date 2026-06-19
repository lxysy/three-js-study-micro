import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\css2d-annotation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
