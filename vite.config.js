import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const target = mode === 'admin' ? 'admin' : 'shop';
  const port = target === 'admin' ? 5174 : 5173;
  const env = loadEnv(mode, process.cwd(), 'API_PROXY_');
  const apiTarget = process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || 'http://127.0.0.1:8080';
  const proxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      // The browser calls this Vite origin. Forward a server-to-server request
      // so older backend CORS allowlists do not reject the new admin port.
      configure(proxyServer) {
        proxyServer.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'));
      },
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    define: { 'import.meta.env.VITE_APP_TARGET': JSON.stringify(target) },
    server: { port, strictPort: true, proxy },
    preview: { port, strictPort: true, proxy },
    build: { outDir: `dist/${target}` },
  };
})
