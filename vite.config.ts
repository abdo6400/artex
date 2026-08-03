import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// /artex/ when running in GitHub Actions, / for local dev
const base = process.env.GITHUB_ACTIONS ? '/artex/' : '/'

// Standard clean Vite configuration
export default defineConfig({
  appType: 'spa',
  base,

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
})
