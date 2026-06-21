import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file build => the produced dist/index.html opens with a double-click (no server needed).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
})
