import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\sprite',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
