import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\vector3-test',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
