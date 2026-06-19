import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\orbit-controls',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
