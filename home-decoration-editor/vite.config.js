import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '..\\public\\demos\\home-decoration-editor',
    emptyOutDir: true,
  },
  publicDir: 'public',
})
