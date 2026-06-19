import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\material-share',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
