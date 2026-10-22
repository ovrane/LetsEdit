import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleBackendRequest } from './server/index.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
