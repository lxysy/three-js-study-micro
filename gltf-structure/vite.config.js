import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\gltf-structure',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
