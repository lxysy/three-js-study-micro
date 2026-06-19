import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\geometry-color',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
