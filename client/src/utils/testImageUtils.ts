// 测试图片URL构建工具
import { buildImageUrl, buildUploadUrl } from './imageUtils';

// 测试函数
export const testImageUtils = () => {
  console.log('=== 图片URL构建测试 ===');
  
  // 测试本地开发环境
  const originalEnv = import.meta.env.VITE_API_URL;
  
  // 模拟本地开发环境
  Object.defineProperty(import.meta, 'env', {
    value: { VITE_API_URL: '/api' },
    writable: true
  });
  
  console.log('本地开发环境测试:');
  console.log('输入: /uploads/images/test.jpg');
  console.log('输出:', buildImageUrl('/uploads/images/test.jpg'));
  console.log('上传URL:', buildUploadUrl());
  
  // 模拟生产环境
  Object.defineProperty(import.meta, 'env', {
    value: { VITE_API_URL: 'https://oldksports-backend.zeabur.app/api' },
    writable: true
  });
  
  console.log('\n生产环境测试:');
  console.log('输入: /uploads/images/test.jpg');
  console.log('输出:', buildImageUrl('/uploads/images/test.jpg'));
  console.log('上传URL:', buildUploadUrl());
  
  // 恢复原始环境
  Object.defineProperty(import.meta, 'env', {
    value: { VITE_API_URL: originalEnv },
    writable: true
  });
  
  console.log('\n=== 测试完成 ===');
};

// 在开发环境中自动运行测试
if (import.meta.env.DEV) {
  testImageUtils();
}
