import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// allowedHosts: lets a tunnel (ngrok) reach `vite preview` for on-device testing.
export default defineConfig({ plugins: [react()], preview: { allowedHosts: true }, test: { setupFiles: ['test/setup.js'] } })
