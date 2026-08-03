import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Standard clean Vite configuration
export default defineConfig(({ command }) => ({
  appType: 'spa',
  // Always use /artex/ base during production build for GitHub Pages
  base: command === 'build' ? '/artex/' : '/',

  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },

  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
}))
