import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\decal-geometry',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
