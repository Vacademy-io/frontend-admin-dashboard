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
        // Temporarily disabled PWA plugin due to build error
        // VitePWA({
        //     registerType: 'autoUpdate',
        //     devOptions: {
        //         enabled: false,
        //     },
        //     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        //     manifest: {
        //         name: 'Admin Dashboard',
        //         short_name: 'Admin',
        //         description: 'Admin Dashboard Application',
        //         theme_color: '#ffffff',
        //         icons: [
        //             {
        //                 src: 'pwa-192x192.png',
        //                 sizes: '192x192',
        //                 type: 'image/png',
        //             },
        //             {
        //                 src: 'pwa-512x512.png',
        //                 sizes: '512x512',
        //                 type: 'image/png',
        //             },
        //         ],
        //     },
        //     workbox: {
        //         maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30MB
        //         globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        //         runtimeCaching: [
        //             {
        //                 urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        //                 handler: 'CacheFirst',
        //                 options: {
        //                     cacheName: 'google-fonts-cache',
        //                     expiration: {
        //                         maxEntries: 10,
        //                         maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
        //                     },
        //                     cacheableResponse: {
        //                         statuses: [0, 200],
        //                     },
        //                 },
        //             },
        //         ],
        //     },
        // }),
    ],
    // plugins: [react(), tsconfigPaths(), svgr({ include: "**/*.svg" })],

    build: {
        rollupOptions: {
            external: (id) => {
                // Handle problematic dependencies
                if (id.includes('woff2-wasm')) return true;
                return false;
            },
            onLog(level, log, handler) {
                // Suppress circular dependency warnings for known safe cases
                if (log.code === 'CIRCULAR_DEPENDENCY' && log.message?.includes('pako')) return;
                handler(level, log);
            },
            output: {
                manualChunks: {
                    // Core React framework
                    'react-vendor': ['react', 'react-dom'],
                    // Router and state management
                    'routing-vendor': ['react-router-dom', '@tanstack/react-router', 'zustand'],
                    // All PDF related libraries together to avoid dependency issues
                    'pdf-vendor': ['pdfjs-dist', 'pdf-lib', '@pdfme/generator', '@pdfme/common', 'pako'],
                    // UI components
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast', 'lucide-react'],
                    // Utilities and data handling
                    'utils-vendor': ['lodash', 'date-fns', 'axios', 'clsx', 'class-variance-authority'],
                },
            },
            onwarn: (warning, warn) => {
                // Suppress specific warnings that might cause issues
                if (warning.code === 'CIRCULAR_DEPENDENCY') return;
                if (warning.code === 'INVALID_ANNOTATION') return;
                warn(warning);
            },
        },
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 0, // Disable asset inlining to prevent issues
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
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios',
            'lodash',
            'date-fns',
            'pako',
        ],
        esbuildOptions: {
            target: 'esnext',
            supported: {
                bigint: true,
            },
        },
        force: true, // Force re-optimization to fix dependency issues
    },
});
