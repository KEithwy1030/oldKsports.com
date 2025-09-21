// 统一的API配置文件
export const API_CONFIG = {
  // 后端基础URL（生产环境使用环境变量，开发环境使用代理）
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
  // API端点
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout'
    },
    USERS: {
      ME: '/api/users/me',
      UPDATE: '/api/users/me',
      POSTS: '/api/users/:userId/posts'
    },
    FORUM: {
      POSTS: '/api/forum/posts',
      CREATE_POST: '/api/forum/posts'
    },
    HEALTH: '/api/health',
    DATABASE: '/api/database'
  },
  
  // 请求配置
  REQUEST: {
    TIMEOUT: 30000,
    HEADERS: {
      'Content-Type': 'application/json'
    }
  }
};

// 导出辅助函数
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('oldksports_auth_token');
  return {
    'Content-Type': 'application/json',
    // 同时支持cookie和Authorization header
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};