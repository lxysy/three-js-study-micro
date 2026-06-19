import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: '..\\public\\demos\\gltf-draco-test',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
