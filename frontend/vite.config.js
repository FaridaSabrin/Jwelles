import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned so the dev server's origin always matches Django's
    // CORS_ALLOWED_ORIGINS/CSRF_TRUSTED_ORIGINS (config/settings.py).
    // strictPort fails loudly instead of silently drifting to another
    // port (e.g. 5183) if 5174 is already taken, which would otherwise
    // reintroduce CORS errors with no obvious cause.
    port: 5174,
    strictPort: true,
  },
})
