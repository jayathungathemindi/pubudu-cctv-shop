import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Saved Daraz web pages in public/images are not used by the shop - keep them out of the build
function removeSavedWebPages() {
  return {
    name: 'remove-saved-web-pages',
    apply: 'build',
    closeBundle() {
      const dir = path.resolve('dist/images')
      if (!fs.existsSync(dir)) return
      for (const name of fs.readdirSync(dir)) {
        if (name.endsWith('_files') || name.endsWith('.html')) {
          fs.rmSync(path.join(dir, name), { recursive: true, force: true })
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), removeSavedWebPages()],
  server: {
    // While developing, send API calls and uploaded images to the server on port 5000.
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
