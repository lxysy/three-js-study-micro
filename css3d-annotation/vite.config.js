import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\css3d-annotation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
