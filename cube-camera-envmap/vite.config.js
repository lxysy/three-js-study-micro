import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\cube-camera-envmap',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
