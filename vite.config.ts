import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/dataset/**',
        '**/lok_sabha_dataset/**',
        '**/rajya_sabha_dataset/**',
        '**/*.csv',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.csv'],
})
