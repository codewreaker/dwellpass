import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
// import fs from 'fs'

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
    }),
    nitro()
  ],
  // server: {
  //   host: true,
  //   // https: {
  //   //   key: fs.readFileSync('./certs/key.pem'),
  //   //   cert: fs.readFileSync('./certs/cert.pem'),
  //   // },
  //   proxy: {
  //     '/api': {
  //       target: `http://localhost:${process.env.PORT || 3000}`,
  //       changeOrigin: true,
  //       secure: false, // Allow self-signed certificates
  //     }
  //   }
  // },
})
