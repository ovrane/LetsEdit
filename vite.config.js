import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { handleBackendRequest } from './server/index.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false
    }),
    {
      name: 'sejda-backend-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          try {
            const handled = await handleBackendRequest(req, res);
            if (!handled) {
              next();
            }
          } catch (err) {
            next(err);
          }
        });
      }
    },
    {
      // Fix: <link rel="preload" as="style"> tags emitted by Vite's CSS plugin
      // don't get crossorigin= from crossOriginLoading (which only covers scripts).
      // Without it browsers discard the preload because the credentials mode doesn't
      // match the actual stylesheet fetch, showing the "preload not used" warning.
      // enforce:'post' ensures we run AFTER Vite's own CSS preload injection.
      name: 'css-preload-crossorigin',
      enforce: 'post',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(
            /<link rel="preload" as="style"([^>]*?)>/g,
            (match, attrs) => {
              if (/crossorigin/.test(attrs)) return match;
              return `<link rel="preload" as="style" crossorigin="anonymous"${attrs}>`;
            }
          );
        }
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    // Emit crossorigin="anonymous" on all <link rel="modulepreload"> tags Vite
    // generates so the preload credentials-mode matches the actual fetch request.
    // Without this, browsers log a "preload not used" warning for the CSS chunk.
    crossOriginLoading: 'anonymous',
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdfjs';
          }
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdf-lib')) {
            return 'vendor-pdflib';
          }
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/jszip')) {
            return 'vendor-jszip';
          }
          if (id.includes('node_modules/lucide')) {
            return 'vendor-lucide';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

