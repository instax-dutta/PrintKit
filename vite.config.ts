import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The service worker is served verbatim from public/, so the build never edits
// it and its cache version would stay frozen, meaning updatefound never fires.
// Stamp a fresh version into dist/sw.js each build: a changed cache name also
// makes activate() delete the previous cache, so old assets are pruned too.
function stampServiceWorker(): Plugin {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const src = readFileSync(resolve('public/sw.js'), 'utf8')
      const version = `printkit-v${Date.now().toString(36)}`
      writeFileSync(resolve('dist/sw.js'), src.replace("'printkit-v1'", `'${version}'`))
    },
  }
}

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: false,
  },
})
