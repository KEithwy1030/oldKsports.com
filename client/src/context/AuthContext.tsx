// client/src/context/AuthContext.tsx (FINAL-FIXED VERSION 2)

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { userAPI, authAPI, healthCheck, databaseCheck, handleApiError, forumAPI } from '../utils/api';
import { getUserLevel } from '../utils/userUtils';

const BOT_ACCOUNTS_KEY = 'oldksports_bot_accounts';
const FORUM_POSTS_KEY = 'oldksports_forum_posts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserPoints: (points: number) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  recalculateUserLevel: () => void;
  checkHealth: () => Promise<any>;
  checkDatabase: () => Promise<any>;
  getBotAccounts: () => User[];
  addBotAccounts: (bots: any[]) => void;
  updateBotAccount: (botId: string, updatedData: Partial<User>) => void;
  getForumPosts: () => Promise<any[]>;
  addForumPost: (post: any) => void;
  updateForumPost: (postId: string, updatedData: Partial<any>) => void;
  addForumReply: (postId: string, reply: any) => void;
  incrementPostViews: (postId: string) => void;
  addReplyToPost: (postId: string, reply: any) => void;
  onAvatarUpdate: (callback: (user: User) => void) => () => void;
  removeAvatarUpdateListener: (callback: (user: User) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const avatarUpdateListeners = useRef<((user: User) => void)[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('oldksports_auth_token');
    const savedUser = localStorage.getItem('oldksports_user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // 确保所有字段正确映射，特别是isAdmin字段
        const processedUserData = {
          ...userData,
          isAdmin: userData.is_admin || userData.isAdmin || false,
          hasUploadedAvatar: userData.has_uploaded_avatar || userData.hasUploadedAvatar || false
        };
        
        console.log('AuthContext初始化 - 从localStorage加载用户数据:', userData);
        console.log('AuthContext初始化 - 处理后的用户数据:', processedUserData);
        console.log('用户头像数据:', {
          hasAvatar: !!processedUserData.avatar,
          avatarLength: processedUserData.avatar?.length,
          hasUploadedAvatar: processedUserData.hasUploadedAvatar
        });
        
        setUser(processedUserData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('oldksports_auth_token');
        localStorage.removeItem('oldksports_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const userData = response.user || response;
      
      // 确保令牌同步到所有位置
      if (response.token) {
        localStorage.setItem('oldksports_auth_token', response.token);
        localStorage.setItem('access_token', response.token); // 兼容性
        console.log('登录成功 - 令牌已同步到所有位置');
      }
      
      // 处理字段映射，确保所有字段正确
      const processedUserData = {
        ...userData,
        isAdmin: userData.isAdmin || false,
        hasUploadedAvatar: userData.hasUploadedAvatar || false
      };
      
      console.log('Login - 原始用户数据:', userData);
      console.log('Login - 处理后的用户数据:', processedUserData);
        console.log('Login - isAdmin字段检查:', {
        原始isAdmin: userData.isAdmin,
        最终isAdmin: processedUserData.isAdmin
      });
      
      // 将处理后的数据保存到localStorage
      localStorage.setItem('oldksports_user', JSON.stringify(processedUserData));
      console.log('Login - 头像信息:', {
        hasAvatar: !!processedUserData.avatar,
        avatarLength: processedUserData.avatar?.length,
        hasUploadedAvatar: processedUserData.hasUploadedAvatar
      });
      
      setUser(processedUserData);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401 || status === 404) throw new Error('登录邮箱或密码错误');
        if (status === 400) throw new Error('登录信息格式错误，请检查输入');
        if (status === 500) throw new Error('服务器暂时不可用，请稍后重试');
        throw new Error(data.error || data.message || '登录失败，请重试');
      } else if (error.request) {
        throw new Error('网络连接异常，请检查网络后重试');
      } else {
        throw new Error(error.message || '登录失败，请重试');
      }
    }
  };
  
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(username, email, password);
      const userData = response.user || response;
      
      // 处理字段映射，确保 isAdmin 字段正确
      const processedUserData = {
        ...userData,
        isAdmin: userData.isAdmin || false
      };
      
      setUser(processedUserData);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 409) throw new Error('用户名或邮箱已被注册，请更换后重试');
        if (status === 400) throw new Error('注册信息格式错误，请检查输入');
        if (status === 500) throw new Error('服务器暂时不可用，请稍后重试');
        throw new Error(data.error || data.message || '注册失败，请重试');
      } else if (error.request) {
        throw new Error('网络连接异常，请检查网络后重试');
      } else {
        throw new Error(error.message || '注册失败，请重试');
      }
    }
  };
  
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 新增：处理无效token的函数
  const handleInvalidToken = useCallback(() => {
    console.warn('处理无效token，清理用户状态...');
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    // 显示提示信息
    alert('登录已过期，请重新登录');
    // 跳转到登录页面
    window.location.href = '/login';
  }, []);

  const updateUserPoints = async (pointsToAdd: number) => {
    if (!user) return;
    
    const newTotalPoints = user.points + pointsToAdd;
    console.log('Adding', pointsToAdd, 'points to user. From', user.points, 'to', newTotalPoints);
    
    try {
      // 尝试调用API更新积分
      const response = await userAPI.updatePoints(newTotalPoints);
      // 确保保留所有用户数据，特别是头像数据
      const updatedUser = { 
        ...user, 
        points: newTotalPoints, 
        level: getUserLevel(newTotalPoints),
        // 明确保留头像相关字段
        avatar: user.avatar,
        hasUploadedAvatar: user.hasUploadedAvatar
      };
      setUser(updatedUser);
      localStorage.setItem('oldksports_user', JSON.stringify(updatedUser));
      
      console.log('Points updated successfully via API:', updatedUser);
      
      // 强制重新渲染UI
      setTimeout(() => {
        setUser(prev => prev ? { ...prev } : null);
      }, 100);
      
      return response;
    } catch (error) {
      console.warn('API update points failed, using local fallback:', error);
      
      // API失败时的本地回退机制
      const updatedUser = { 
        ...user, 
        points: newTotalPoints, 
        level: getUserLevel(newTotalPoints),
        // 明确保留头像相关字段
        avatar: user.avatar,
        hasUploadedAvatar: user.hasUploadedAvatar
      };
      setUser(updatedUser);
      localStorage.setItem('oldksports_user', JSON.stringify(updatedUser));
      
      console.log('Points updated locally:', updatedUser);
      
      // 强制重新渲染UI
      setTimeout(() => {
        setUser(prev => prev ? { ...prev } : null);
      }, 100);
      
      // 返回一个模拟的成功响应
      return { success: true, message: 'Points updated locally' };
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('Cannot update user: user is null');
    try {
      await userAPI.updateProfile(userData as any);
      const updatedUser: User = { ...user, ...userData, level: userData.points ? getUserLevel(userData.points) : user.level } as User;
      setUser(updatedUser);
      localStorage.setItem('oldksports_user', JSON.stringify(updatedUser));
      if (userData.avatar && userData.avatar !== user.avatar) {
        avatarUpdateListeners.current.forEach(listener => listener(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error(handleApiError(error as Error));
    }
  };

  // 重新计算用户等级（用于等级积分要求变更后）
  const recalculateUserLevel = useCallback(() => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, level: getUserLevel(prevUser.points) };
      localStorage.setItem('oldksports_user', JSON.stringify(updatedUser));
      console.log('User level recalculated:', updatedUser.level);
      return updatedUser;
    });
  }, []);

  const onAvatarUpdate = useCallback((callback: (user: User) => void) => {
    avatarUpdateListeners.current.push(callback);
    return () => {
      avatarUpdateListeners.current = avatarUpdateListeners.current.filter(listener => listener !== callback);
    };
  }, []);

  const removeAvatarUpdateListener = useCallback((callback: (user: User) => void) => {
    avatarUpdateListeners.current = avatarUpdateListeners.current.filter(listener => listener !== callback);
  }, []);

  const checkHealth = async () => {
    try { return await healthCheck(); } 
    catch (error) { console.error('Health check failed:', error); throw error; }
  };

  const checkDatabase = async () => {
    try { return await databaseCheck(); } 
    catch (error) { console.error('Database check failed:', error); throw error; }
  };

  const getBotAccounts = useCallback((): User[] => {
    const stored = localStorage.getItem(BOT_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);
  
  const saveBotAccounts = (bots: any[]) => {
    localStorage.setItem(BOT_ACCOUNTS_KEY, JSON.stringify(bots));
  };
  
  const addBotAccounts = (newBots: any[]) => {
    const existingBots = getBotAccounts();
    saveBotAccounts([...existingBots, ...newBots]);
  };
  
  const updateBotAccount = (botId: string, updatedData: Partial<User>) => {
    const existingBots = getBotAccounts();
    // FIXED: Corrected the type comparison issue by converting bot.id to string.
    const updatedBots = existingBots.map(bot => String(bot.id) === botId ? { ...bot, ...updatedData } : bot);
    saveBotAccounts(updatedBots);
  };

  const getForumPosts = useCallback(async (): Promise<any[]> => {
    try {
      // 优先从后端API获取帖子数据
      const response = await forumAPI.getPosts();
      return response.posts || [];
    } catch (error) {
      console.warn('Failed to fetch posts from API, using localStorage fallback:', error);
      // API失败时使用localStorage作为回退
      const stored = localStorage.getItem(FORUM_POSTS_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((p: any) => {
        // 确保时间戳是有效的
        let timestamp = p.timestamp;
        if (!timestamp) {
          timestamp = new Date().toISOString(); // 如果没有时间戳，使用当前时间
        } else if (typeof timestamp === 'string') {
          // 如果是字符串，检查是否有效
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            timestamp = new Date().toISOString(); // 无效时间戳，使用当前时间
          }
        }
        return { ...p, timestamp };
      });
    }
  }, []);

  const saveForumPosts = (posts: any[]) => {
    localStorage.setItem(FORUM_POSTS_KEY, JSON.stringify(posts));
  };

  const addForumPost = async (post: any) => {
    try {
      // 使用后端API创建帖子
      const response = await forumAPI.createPost(post.title, post.content, post.category);
      return response;
    } catch (error) {
      console.warn('Failed to create post via API, using localStorage fallback:', error);
      // API失败时使用localStorage作为回退
      const existingPosts = await getForumPosts();
      const newPost = { 
        ...post, 
        id: Date.now().toString(), 
        timestamp: new Date().toISOString(), // 使用ISO字符串格式
        likes: 0, 
        replies: [] 
      };
      saveForumPosts([newPost, ...existingPosts]);
      return newPost;
    }
  };

  const updateForumPost = async (postId: string, updatedData: Partial<any>) => {
    // 操作本地存储，避免通过 getForumPosts 触发 API 覆盖
    const raw = localStorage.getItem(FORUM_POSTS_KEY);
    const localPosts = raw ? JSON.parse(raw) : [];
    const updatedPosts = localPosts.map((post: any) => String(post.id) === postId ? { ...post, ...updatedData } : post);
    saveForumPosts(updatedPosts);
  };

  const addReplyToPost = async (postId: string, reply: any) => {
    // 直接操作本地存储，避免 getForumPosts 优先走 API 导致丢数据
    const raw = localStorage.getItem(FORUM_POSTS_KEY);
    const localPosts = raw ? JSON.parse(raw) : [];
    const updatedPosts = localPosts.map((post: any) => {
      if (String(post.id) === postId) {
        const replies = Array.isArray(post.replies) ? post.replies : [];
        const newReply = { ...reply, id: Date.now().toString(), createdAt: new Date(), likes: 0 };
        return { ...post, replies: [...replies, newReply] };
      }
      return post;
    });
    saveForumPosts(updatedPosts);
  };

  const addForumReply = addReplyToPost;

  const incrementPostViews = async (postId: string) => {
    // 直接操作本地存储
    const raw = localStorage.getItem(FORUM_POSTS_KEY);
    const localPosts = raw ? JSON.parse(raw) : [];
    const updatedPosts = localPosts.map((post: any) => String(post.id) === postId ? { ...post, views: (post.views || 0) + 1 } : post);
    saveForumPosts(updatedPosts);
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated, login, register, logout, updateUserPoints, updateUser, recalculateUserLevel, checkHealth, checkDatabase,
      getBotAccounts, addBotAccounts, updateBotAccount, getForumPosts, addForumPost, updateForumPost,
      addForumReply, incrementPostViews, addReplyToPost, onAvatarUpdate, removeAvatarUpdateListener
    }}>
      {children}
    </AuthContext.Provider>
  );
};