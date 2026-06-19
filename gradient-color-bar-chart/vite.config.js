import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\gradient-color-bar-chart',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
