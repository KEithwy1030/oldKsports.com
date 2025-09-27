import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000, // 前端端口 - 匹配Zeabur配置
      strictPort: true, // 端口被占用时直接报错
      proxy: mode === 'development' ? {
        '/api': {
          target: `http://localhost:3000`, // 指向后端服务器（统一为3000）
          changeOrigin: true,
          // 不重写路径，保持 /api 前缀
        },
      } : {},
    },
    preview: {
      port: 3000,
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