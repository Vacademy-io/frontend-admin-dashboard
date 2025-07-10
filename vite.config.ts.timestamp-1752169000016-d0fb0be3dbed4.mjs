// vite.config.ts
import react from "file:///D:/frontend-admin-dashboard/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { defineConfig } from "file:///D:/frontend-admin-dashboard/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///D:/frontend-admin-dashboard/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { TanStackRouterVite } from "file:///D:/frontend-admin-dashboard/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import svgr from "file:///D:/frontend-admin-dashboard/node_modules/vite-plugin-svgr/dist/index.js";
import { VitePWA } from "file:///D:/frontend-admin-dashboard/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\frontend-admin-dashboard";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    TanStackRouterVite(),
    svgr({ include: "**/*.svg" }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Admin Dashboard",
        short_name: "Admin",
        description: "Admin Dashboard Application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
        // 30MB
      }
    })
  ],
  // plugins: [react(), tsconfigPaths(), svgr({ include: "**/*.svg" })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor dependencies
          vendor: ["react", "react-dom", "react-router-dom"],
          // Group large libraries separately
          pdfjs: ["pdfjs-dist", "pdf-lib"]
          // Add other large dependencies here
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ".vitest/setup",
    include: ["**/test.{ts,tsx}"]
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src *; frame-ancestors 'self' https://www.youtube.com https://youtube.com https://*.youtube.com;"
    },
    proxy: {
      "/youtube": {
        target: "https://www.youtube.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/youtube/, ""),
        secure: false,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    },
    cors: true,
    hmr: {
      protocol: "ws",
      host: "localhost"
    }
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxmcm9udGVuZC1hZG1pbi1kYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGZyb250ZW5kLWFkbWluLWRhc2hib2FyZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovZnJvbnRlbmQtYWRtaW4tZGFzaGJvYXJkL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSAnQHRhbnN0YWNrL3JvdXRlci1wbHVnaW4vdml0ZSc7XHJcbmltcG9ydCBzdmdyIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcgaHR0cHM6Ly92aXRlc3QuZGV2L2NvbmZpZ1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHJlYWN0KCksXHJcbiAgICAgICAgdHNjb25maWdQYXRocygpLFxyXG4gICAgICAgIFRhblN0YWNrUm91dGVyVml0ZSgpLFxyXG4gICAgICAgIHN2Z3IoeyBpbmNsdWRlOiAnKiovKi5zdmcnIH0pLFxyXG4gICAgICAgIFZpdGVQV0Eoe1xyXG4gICAgICAgICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdtYXNrZWQtaWNvbi5zdmcnXSxcclxuICAgICAgICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdBZG1pbiBEYXNoYm9hcmQnLFxyXG4gICAgICAgICAgICAgICAgc2hvcnRfbmFtZTogJ0FkbWluJyxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQWRtaW4gRGFzaGJvYXJkIEFwcGxpY2F0aW9uJyxcclxuICAgICAgICAgICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAncHdhLTE5MngxOTIucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJ3B3YS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogMzAgKiAxMDI0ICogMTAyNCwgLy8gMzBNQlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLFxyXG4gICAgXSxcclxuICAgIC8vIHBsdWdpbnM6IFtyZWFjdCgpLCB0c2NvbmZpZ1BhdGhzKCksIHN2Z3IoeyBpbmNsdWRlOiBcIioqLyouc3ZnXCIgfSldLFxyXG5cclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdyb3VwIHZlbmRvciBkZXBlbmRlbmNpZXNcclxuICAgICAgICAgICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBHcm91cCBsYXJnZSBsaWJyYXJpZXMgc2VwYXJhdGVseVxyXG4gICAgICAgICAgICAgICAgICAgIHBkZmpzOiBbJ3BkZmpzLWRpc3QnLCAncGRmLWxpYiddLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgb3RoZXIgbGFyZ2UgZGVwZW5kZW5jaWVzIGhlcmVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHRlc3Q6IHtcclxuICAgICAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgICAgIGVudmlyb25tZW50OiAnaGFwcHktZG9tJyxcclxuICAgICAgICBzZXR1cEZpbGVzOiAnLnZpdGVzdC9zZXR1cCcsXHJcbiAgICAgICAgaW5jbHVkZTogWycqKi90ZXN0Lnt0cyx0c3h9J10sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICd1bnNhZmUtbm9uZScsXHJcbiAgICAgICAgICAgICdDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeSc6ICd1bnNhZmUtbm9uZScsXHJcbiAgICAgICAgICAgICdDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5JzogJ2Nyb3NzLW9yaWdpbicsXHJcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIFBBVENILCBPUFRJT05TJyxcclxuICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnWC1SZXF1ZXN0ZWQtV2l0aCwgY29udGVudC10eXBlLCBBdXRob3JpemF0aW9uJyxcclxuICAgICAgICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JzpcclxuICAgICAgICAgICAgICAgIFwiZGVmYXVsdC1zcmMgKiAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJyBkYXRhOiBibG9iOjsgZnJhbWUtc3JjICo7IGZyYW1lLWFuY2VzdG9ycyAnc2VsZicgaHR0cHM6Ly93d3cueW91dHViZS5jb20gaHR0cHM6Ly95b3V0dWJlLmNvbSBodHRwczovLyoueW91dHViZS5jb207XCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnL3lvdXR1YmUnOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbScsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwveW91dHViZS8sICcnKSxcclxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb3JzOiB0cnVlLFxyXG4gICAgICAgIGhtcjoge1xyXG4gICAgICAgICAgICBwcm90b2NvbDogJ3dzJyxcclxuICAgICAgICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgICBleGNsdWRlOiBbJ0BmZm1wZWcvZmZtcGVnJywgJ0BmZm1wZWcvdXRpbCddLFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sVUFBVTtBQUNqQixTQUFTLGVBQWU7QUFQeEIsSUFBTSxtQ0FBbUM7QUFVekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsbUJBQW1CO0FBQUEsSUFDbkIsS0FBSyxFQUFFLFNBQVMsV0FBVyxDQUFDO0FBQUEsSUFDNUIsUUFBUTtBQUFBLE1BQ0osY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLGlCQUFpQjtBQUFBLE1BQ3hFLFVBQVU7QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNIO0FBQUEsWUFDSSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxZQUNJLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNWO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNMLCtCQUErQixLQUFLLE9BQU87QUFBQTtBQUFBLE1BQy9DO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUFBO0FBQUEsRUFHQSxPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDSixjQUFjO0FBQUE7QUFBQSxVQUVWLFFBQVEsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUVqRCxPQUFPLENBQUMsY0FBYyxTQUFTO0FBQUE7QUFBQSxRQUduQztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3hDO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osU0FBUyxDQUFDLGtCQUFrQjtBQUFBLEVBQ2hDO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFDTCxnQ0FBZ0M7QUFBQSxNQUNoQyw4QkFBOEI7QUFBQSxNQUM5QixnQ0FBZ0M7QUFBQSxNQUNoQywrQkFBK0I7QUFBQSxNQUMvQixnQ0FBZ0M7QUFBQSxNQUNoQyxnQ0FBZ0M7QUFBQSxNQUNoQywyQkFDSTtBQUFBLElBQ1I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFlBQVk7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLGNBQWMsRUFBRTtBQUFBLFFBQ2hELFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNMLCtCQUErQjtBQUFBLFFBQ25DO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNELFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxJQUNWO0FBQUEsRUFDSjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1YsU0FBUyxDQUFDLGtCQUFrQixjQUFjO0FBQUEsRUFDOUM7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
