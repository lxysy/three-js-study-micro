import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\sprite-text-test',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
