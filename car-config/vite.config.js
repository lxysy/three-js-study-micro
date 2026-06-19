import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\car-config',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
