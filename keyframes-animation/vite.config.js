import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\keyframes-animation',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
