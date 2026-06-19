import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\snowy-forest',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
