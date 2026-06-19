import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\vector-dot',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
