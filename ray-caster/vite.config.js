import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\ray-caster',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
