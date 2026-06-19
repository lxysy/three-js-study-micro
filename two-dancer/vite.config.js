import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\two-dancer',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
