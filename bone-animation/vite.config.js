import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\bone-animation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
