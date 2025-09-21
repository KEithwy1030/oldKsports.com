import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173, // 前端端口
      strictPort: true, // 端口被占用时直接报错
      proxy: {
        '/api': {
          target: `http://localhost:3001`, // 指向后端服务器
          changeOrigin: true,
          // 不重写路径，保持 /api 前缀
        },
      },
    },
  };
});