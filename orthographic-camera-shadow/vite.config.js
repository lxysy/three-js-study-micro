import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\orthographic-camera-shadow',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
