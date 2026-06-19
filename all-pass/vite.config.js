import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\all-pass',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
