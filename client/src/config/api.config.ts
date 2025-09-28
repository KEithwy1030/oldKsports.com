// 统一的API配置文件
export const API_CONFIG = {
  // 后端基础URL（生产环境使用环境变量，开发环境使用代理）
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
  // API端点（不带/api前缀，因为BASE_URL已经包含）
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      ME: '/users/me',
      UPDATE: '/users/me',
      POSTS: '/users/:userId/posts'
    },
    FORUM: {
      POSTS: '/forum/posts',
      CREATE_POST: '/forum/posts'
    },
    HEALTH: '/health',
    DATABASE: '/database'
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
  
  console.log('getAuthHeaders Debug:', {
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
  });
  
  if (!token) {
    console.warn('⚠️ 没有找到认证token');
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};