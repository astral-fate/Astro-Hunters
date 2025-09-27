// vite.config.ts (AFTER)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['styled-jsx/babel'],
      },
    }),
  ],
  // This part is needed to process the CSS correctly
  css: {
    modules: {
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  server: {
    allowedHosts: ["9eeb91d6dd5b.ngrok-free.app"],
  },
})