// API utility functions for Old K Sports
import { User } from '../types';
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '../config/api.config';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

// Auth Response
export interface AuthResponse {
  token: string;
  user: User;
}

// User Response
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  points: number;
  level: string;
  joinDate: Date;
  lastLogin: Date;
  isAdmin: boolean;
  roles: string[];
  avatar: string | null;
  hasUploadedAvatar: boolean;
}

// Generic HTTP request function with standardized response handling
const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const url = buildApiUrl(endpoint);
    const config: RequestInit = {
      headers: getAuthHeaders(),
      credentials: 'include',
      ...options
    };

    console.log('API Request:', { url, config });
    
    const response = await fetch(url, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      
      // 如果是403错误且提示无效token，自动清理token
      if (response.status === 403 && (errorData.error?.includes('无效的访问令牌') || errorData.error?.includes('invalid signature'))) {
        console.warn('检测到无效token，正在清理...');
        localStorage.removeItem('oldksports_auth_token');
        localStorage.removeItem('oldksports_user');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // 不要立即刷新，而是抛出错误让上层处理
      }
      
      // 创建一个带有response属性的错误对象
      const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = {
        status: response.status,
        data: errorData
      };
      throw error;
    }

    const data: ApiResponse<T> = await response.json();
    console.log('API Response:', data);
    
    // Handle standardized success responses
    if (data.success) {
      return data.data || data as T;
    }
    
    return data as T;
  } catch (error) {
    console.error('API Request failed:', error);
    
    // 为网络错误添加request属性
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      const networkError = new Error('网络连接失败，请检查网络设置');
      (networkError as any).request = {};
      throw networkError;
    }
    
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password })
    });
    
    // Store token and user data
    if (response.token && response.user) {
      localStorage.setItem('oldksports_auth_token', response.token);
      localStorage.setItem('oldksports_user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    
    // Store token and user data
    if (response.token && response.user) {
      localStorage.setItem('oldksports_auth_token', response.token);
      localStorage.setItem('oldksports_user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('oldksports_auth_token');
    localStorage.removeItem('oldksports_user');
    // 清除所有可能的相关缓存
    localStorage.removeItem('oldksports_bot_accounts');
    localStorage.removeItem('oldksports_forum_posts');
    // 清除cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  // 新增：清理无效token的函数
  clearInvalidTokens: () => {
    console.log('清理无效的认证token...');
    localStorage.removeItem('oldksports_auth_token');
    localStorage.removeItem('oldksports_user');
    localStorage.removeItem('oldksports_bot_accounts');
    localStorage.removeItem('oldksports_forum_posts');
    // 清除cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // 刷新页面以重置状态
    window.location.reload();
  },
  
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string; resetLink?: string }> => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  
  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword })
    });
  }
};

// User API functions
export const userAPI = {
  getProfile: async (): Promise<UserResponse> => {
    return apiRequest<UserResponse>('/users/me');
  },
  
  updateProfile: async (userData: Partial<UserResponse>): Promise<UserResponse> => {
    return apiRequest<UserResponse>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  updatePoints: async (points: number): Promise<UserResponse> => {
    return apiRequest<UserResponse>('/users/me/points', {
      method: 'PATCH',
      body: JSON.stringify({ points })
    });
  },
  
  getPosts: async (userId: string, page: number = 1, limit: number = 10) => {
    return apiRequest(`/users/${userId}/posts?page=${page}&limit=${limit}`);
  },
  
  getAvatar: async (username: string): Promise<{ success: boolean; avatar: string | null }> => {
    return apiRequest<{ success: boolean; avatar: string | null }>(`/users/${username}/avatar`);
  },

  getUserInfo: async (username: string): Promise<{ success: boolean; user: { id: number; username: string; email: string; points: number; joinDate: string } }> => {
    return apiRequest<{ success: boolean; user: { id: number; username: string; email: string; points: number; joinDate: string } }>(`/users/${username}/info`);
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await fetch(`${buildApiUrl('/health')}`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', message: (error as Error).message };
  }
};

// Database check function
export const databaseCheck = async () => {
  try {
    const response = await fetch(`${buildApiUrl('/database')}`);
    return await response.json();
  } catch (error) {
    console.error('Database check failed:', error);
    return { status: 'error', message: (error as Error).message };
  }
};

// Upload helpers
export const uploadAPI = {
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('oldksports_auth_token');
    const headers: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${buildApiUrl('/users/me/avatar')}`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Avatar upload failed');
    }
    
    return await response.json();
  }
};

// Export configuration
export const API_UTILS_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  console.error('API Error:', error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('Network Error')) {
    return '网络连接失败，请检查网络设置';
  }
  
  if (errorMessage.includes('401')) {
    return '登录已过期，请重新登录';
  }
  
  if (errorMessage.includes('403')) {
    return '权限不足，无法执行此操作';
  }
  
  if (errorMessage.includes('404')) {
    return '请求的资源不存在';
  }
  
  if (errorMessage.includes('413')) {
    return '文件过大，请选择小于10MB的图片';
  }
  
  if (errorMessage.includes('429')) {
    return '请求过于频繁，请稍后重试';
  }
  
  // Handle standardized error messages
  if (errorMessage.includes('Validation failed')) {
    return '输入数据验证失败，请检查输入';
  }
  
  if (errorMessage.includes('No fields to update')) {
    return '没有可更新的字段';
  }
  
  // Handle specific auth errors
  if (errorMessage.includes('already exists')) {
    return '该邮箱或用户名已被注册，请使用其他邮箱';
  }
  
  if (errorMessage.includes('Invalid credentials')) {
    return '邮箱或密码错误，请重新输入';
  }
  
  if (errorMessage.includes('User not found')) {
    return '该邮箱尚未注册，请先注册';
  }
  
  if (errorMessage.includes('Invalid token')) {
    return '登录已过期，请重新登录';
  }
  
  if (errorMessage.includes('Access token required')) {
    return '请先登录后再进行此操作';
  }
  
  return errorMessage || '操作失败，请重试';
};

// Forum API functions
export const forumAPI = {
  getPosts: async (page = 1, limit = 20, category?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // 后端使用 `cat` 作为分类查询参数
    if (category && category !== 'all') {
      params.append('cat', category);
    }

    // 服务端直接返回数组，这里包装成 { posts: [...] }
    const posts = await apiRequest<any[]>(`/posts?${params.toString()}`);
    return { posts };
  },
  
  getPostById: async (postId: string) => {
    // 服务端直接返回单个帖子对象，这里包装成 { post: {...} }
    const post = await apiRequest<any>(`/posts/${postId}`);
    return { post };
  },
  
  createPost: async (title: string, content: string, category = 'general') => {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category })
    });
  },
  
  createReply: async (postId: string, content: string) => {
    return await apiRequest(`/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }
};