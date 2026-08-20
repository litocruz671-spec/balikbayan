import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

// Separate from vite.config.ts (which carries the PWA/Tailwind/Figma-asset
// plugins the app build needs but tests don't) to keep the test runner fast
// and free of unrelated build-time plugin behavior.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
