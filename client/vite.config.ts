import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 8080, // 前端端口
      strictPort: true, // 端口被占用时直接报错
      proxy: mode === 'development' ? {
        '/api': {
          target: `http://localhost:8080`, // 指向后端服务器（统一为8080）
          changeOrigin: true,
          // 不重写路径，保持 /api 前缀
        },
      } : {},
    },
    preview: {
      port: 8080,
      host: '0.0.0.0',
      strictPort: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          }
        }
      }
    }
  };
});