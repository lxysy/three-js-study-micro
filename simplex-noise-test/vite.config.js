import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\simplex-noise-test',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
