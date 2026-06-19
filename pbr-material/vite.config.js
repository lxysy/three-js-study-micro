import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\pbr-material',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
