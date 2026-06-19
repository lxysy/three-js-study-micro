import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\dancing-mirror',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
