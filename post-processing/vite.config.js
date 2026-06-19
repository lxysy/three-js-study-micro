import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\post-processing',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
