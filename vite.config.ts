import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Disable React Compiler for now if it's causing issues
          ['babel-plugin-react-compiler', {}]
        ]
      }
    })
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT}`,
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core and router
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/@tanstack/react-router')) {
            return 'react-vendor'
          }
          
          // AG Grid - heavy library (separate chunks for better caching)
          if (id.includes('node_modules/ag-grid-community')) {
            return 'ag-grid-community'
          }
          if (id.includes('node_modules/ag-grid-react')) {
            return 'ag-grid-react'
          }
          
          // UI and utilities
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/react-grid-layout') ||
              id.includes('node_modules/zustand')) {
            return 'ui-vendor'
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // Increase chunk size warning limit to 1MB
    chunkSizeWarningLimit: 1000,
  },
})
