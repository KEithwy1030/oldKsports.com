// 开发环境工具函数，用于验证API配置

export const validateApiConfig = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const isDev = import.meta.env.DEV;
  
  console.group('🔍 API Configuration Validation');
  
  if (isDev) {
    console.log('✅ Development mode detected');
    console.log('📍 VITE_API_URL:', apiUrl);
    console.log('🌐 Full API Base URL:', `${apiUrl}/auth/login`);
    
    // 验证API URL格式
    if (!apiUrl) {
      console.error('❌ VITE_API_URL is not defined');
    } else if (!apiUrl.startsWith('http')) {
      console.error('❌ VITE_API_URL should start with http:// or https://');
    } else if (!apiUrl.includes('/api')) {
      console.warn('⚠️  VITE_API_URL should include /api path');
    } else {
      console.log('✅ API URL format is correct');
    }
    
    // 测试API连接
    testApiConnection();
  }
  
  console.groupEnd();
};

export const testApiConnection = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health`);
    const data = await response.json();
    console.log('✅ API Health Check:', data.status);
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
  }
};

// 在开发环境中自动验证（改为需要显式开启）
if (import.meta.env.DEV && String(import.meta.env.VITE_DEV_HEALTHCHECK) === '1') {
  validateApiConfig();
}