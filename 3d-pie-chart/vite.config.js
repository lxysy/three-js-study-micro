import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\3d-pie-chart',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
