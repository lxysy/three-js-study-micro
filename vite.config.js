import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    // Only scan main app entry points — don't scan demo source directories
    // which contain importmap-based bare specifiers Vite can't resolve
    entries: ['index.html', 'src/main.jsx'],
  },
})
