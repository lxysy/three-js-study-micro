import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\all-controls',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
