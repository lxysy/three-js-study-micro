import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\morph-animation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
