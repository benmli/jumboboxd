import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    // use a proxy to bypass CORS policy
    proxy: {
      '/api': {
        target: 'https://jumboboxd.soylemez.net',
        changeOrigin: true,
        secure: false,

        // exclude webhooks from proxy
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // don't proxy webhook requests
            if (req.url?.includes('/api/webhooks')) {
              proxyReq.destroy();
              return;
            }
          });
        },
      },
    },
  },
  plugins: [react()],
});
