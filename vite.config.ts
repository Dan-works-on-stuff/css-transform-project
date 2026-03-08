import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    css: {
        devSourcemap: true,
    },
    build: {
        sourcemap: true,
        cssMinify: false,
    },
    server: {
        watch: {
            usePolling: true,
        }
    }
})