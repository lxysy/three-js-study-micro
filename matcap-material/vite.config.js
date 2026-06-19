import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\matcap-material',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
