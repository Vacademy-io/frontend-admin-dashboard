/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        TanStackRouterVite(),
        svgr({ include: '**/*.svg' }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Admin Dashboard',
                short_name: 'Admin',
                description: 'Admin Dashboard Application',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB
            },
        }),
    ],
    // plugins: [react(), tsconfigPaths(), svgr({ include: "**/*.svg" })],

    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Group vendor dependencies
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // Group large libraries separately
                    pdfjs: ['pdfjs-dist', 'pdf-lib'],

                    // Add other large dependencies here
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: '.vitest/setup',
        include: ['**/test.{ts,tsx}'],
    },
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
            'Cross-Origin-Opener-Policy': 'unsafe-none',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            'Content-Security-Policy':
                "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src *; frame-ancestors 'self' https://www.youtube.com https://youtube.com https://*.youtube.com;",
        },
        proxy: {
            '/youtube': {
                target: 'https://www.youtube.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/youtube/, ''),
                secure: false,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            },
        },
        cors: true,
        hmr: {
            protocol: 'ws',
            host: 'localhost',
        },
    },
    optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
});
