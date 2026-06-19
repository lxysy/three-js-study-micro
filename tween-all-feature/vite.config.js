import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\tween-all-feature',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
