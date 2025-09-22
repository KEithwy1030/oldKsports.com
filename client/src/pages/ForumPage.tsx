import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { forumAPI } from '../utils/api';
import { FORUM_CATEGORIES } from '../data/constants';
import { formatTimeAgo } from '../utils/formatTime';
import { mockUsers } from '../data/mockData';
import { Plus, Filter, MessageSquare, Clock, Users, Briefcase, AlertTriangle, Reply, Trash2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Toast from '../components/Toast';
import UserAvatar from '../components/UserAvatar';
import ClickableUserAvatar from '../components/ClickableUserAvatar';
import UserLevelComponent from '../components/UserLevel';
import PostImageGallery from '../components/PostImageGallery';
import TokenCleaner from '../components/TokenCleaner';
import { compressImages, validateImageFile } from '../utils/imageUtils';
import { tokenSync } from '../utils/tokenSync';

const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, getForumPosts, addForumPost, getBotAccounts, onAvatarUpdate, updateUserPoints } = useAuth();
  const { openChatWith } = useChat();
  
  console.log('ForumPage - 用户状态:', {
    userExists: !!user,
    username: user?.username,
    isAdmin: user?.isAdmin,
    userId: user?.id
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 默认按最新活动排序
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [toast, setToast] = useState<{visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'points'}>({ visible: false, message: '', type: 'info' });
  const [showTokenCleaner, setShowTokenCleaner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = FORUM_CATEGORIES;

  // 首次进入时保持显示全部帖子，不需要修改selectedCategory

  // 提取帖子内容中的图片
  const extractImagesFromContent = (content: string): string[] => {
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const images: string[] = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      let imageUrl = match[1];
      // 确保使用标准端口3001
      if (imageUrl.includes('localhost:5174')) {
        imageUrl = imageUrl.replace('localhost:5174', import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001');
      }
      images.push(imageUrl);
    }
    return images;
  };

  // 提取图片网格内容
  const extractImageGridContent = (content: string): string => {
    const gridRegex = /<div class="post-images-grid"[^>]*>([\s\S]*?)<\/div>/g;
    const match = gridRegex.exec(content);
    let gridContent = match ? match[1] : '';
    // 确保使用标准端口3001
    if (gridContent.includes('localhost:5174')) {
      gridContent = gridContent.replace(/localhost:5174/g, import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001');
    }
    return gridContent;
  };

  // 获取纯文本内容
  const getTextContent = (content: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // 获取用户头像
  const getUserAvatar = (username: string): string => {
    const mockUser = mockUsers.find(u => u.username === username);
    return mockUser?.avatar || '';
  };

  // 获取帖子时间戳
  const getPostTimestamp = useCallback((post: any) => {
    return post.timestamp || post.created_at || post.createdAt || post.date;
  }, []);

  const handleSubforumClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
  };

  const handleBackToMain = (): void => {
    setSelectedCategory('all'); // 返回显示全部帖子
    setSearchTerm('');
  };

  // 管理员删除帖子功能
  const handleDeletePost = async (postId: number, postTitle: string) => {
    console.log('前端删除请求:', { postId, postTitle, userIsAdmin: user?.isAdmin });
    
    if (!user?.isAdmin) {
      setToast({ visible: true, message: '只有管理员可以删除帖子', type: 'error' });
      return;
    }

    const confirmed = window.confirm(`确定要删除帖子"${postTitle}"吗？此操作不可撤销！`);
    if (!confirmed) return;

    try {
      // 使用令牌同步工具获取有效令牌
      const token = tokenSync.getValidToken();
      if (!token) {
        setToast({ visible: true, message: '登录已过期，请重新登录', type: 'error' });
        setTimeout(() => {
          tokenSync.clearAllTokens();
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      console.log('发送删除请求:', `/api/posts/${postId}`);
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('删除响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('删除成功:', result);
        
        // 从本地状态中移除已删除的帖子
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setToast({ visible: true, message: '帖子删除成功', type: 'success' });
      } else {
        const errorData = await response.text();
        console.error('删除失败响应:', errorData);
        
        let errorMessage = '删除失败';
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.message || jsonError.error || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        setToast({ visible: true, message: errorMessage, type: 'error' });
        
        // 如果是401/403错误，清理令牌
        if (response.status === 401 || response.status === 403) {
          setTimeout(() => {
            tokenSync.clearAllTokens();
            window.location.href = '/login';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('删除帖子网络错误:', error);
      setToast({ visible: true, message: '网络错误，删除失败', type: 'error' });
    }
  };

  // 安全获取帖子数据
  const safePosts = useMemo(() => {
    return Array.isArray(posts) ? posts : [];
  }, [posts]);

  const getSubforumStats = useCallback((categoryId: string): { totalPosts: number; totalReplies: number; latestPost: string } => {
    const categoryPosts = safePosts.filter(post => post.category === categoryId);
    const totalPosts = categoryPosts.length;
    const totalReplies = categoryPosts.reduce((sum, post) => sum + (post.replies?.length || 0), 0);
    const latestPost = categoryPosts.length > 0 ? categoryPosts.reduce((latest, post) => new Date(post.timestamp) > new Date(latest.timestamp) ? post : latest) : null;
    return { totalPosts, totalReplies, latestPost: latestPost ? formatTimeAgo(latestPost.timestamp) : '暂无帖子' };
  }, [safePosts]);

  const sortedPosts = useMemo(() => {
    const filtered = safePosts.filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesCategory;
    });
    return [...filtered].sort((a, b) => {
      // 统一的排序逻辑：按最新活动时间排序（最新发布或最新回复）
      const getLatestActivity = (post: any) => {
        // 如果有回复，使用最新回复时间
        if (post.replies && post.replies.length > 0) {
          const latestReply = post.replies.reduce((latest: any, reply: any) => {
            const replyTime = new Date(reply.createdAt || reply.timestamp);
            const latestTime = new Date(latest.createdAt || latest.timestamp);
            return replyTime > latestTime ? reply : latest;
          });
          return new Date(latestReply.createdAt || latestReply.timestamp);
        }
        
        // 否则使用帖子创建时间
        const timestamp = getPostTimestamp(post);
        if (timestamp) {
          const postTime = new Date(timestamp);
          if (!isNaN(postTime.getTime())) return postTime;
        }
        
        // 如果时间戳无效，使用ID作为排序依据（ID越大越新）
        return new Date(parseInt(post.id) || 0);
      };
      
      const aTime = getLatestActivity(a);
      const bTime = getLatestActivity(b);
      
      // 根据排序方式决定顺序
      if (sortBy === 'latest') {
        // 按最新活动时间排序（最新发布或最新回复）
        return bTime.getTime() - aTime.getTime();
      } else if (sortBy === 'oldest') {
        return aTime.getTime() - bTime.getTime(); // 最旧在前
      } else if (sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0); // 按点赞数排序
      } else if (sortBy === 'replies') {
        // 按回复数量排序，回复多的在前
        const aReplies = a.replies ? a.replies.length : 0;
        const bReplies = b.replies ? b.replies.length : 0;
        if (bReplies !== aReplies) {
          return bReplies - aReplies;
        }
        // 如果回复数相同，按最新活动时间排序
        return bTime.getTime() - aTime.getTime();
      }
      
      return 0;
    });
  }, [safePosts, selectedCategory, sortBy]);

  // 加载帖子数据
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // 清理可能包含旧URL的localStorage缓存
        console.log('ForumPage: 清理旧的localStorage缓存');
        localStorage.removeItem('oldksports_forum_posts');
        
        // 直接从API获取最新数据，不使用localStorage缓存
        console.log('ForumPage: 从API获取最新帖子数据');
        
        // 然后尝试从API获取最新数据
      try {
        const response = await forumAPI.getPosts(1, 50);
        const normalized = Array.isArray(response?.posts)
          ? response.posts
          : (Array.isArray(response) ? response : []);
          
          if (normalized.length > 0) {
            console.log('ForumPage: API数据可用，更新帖子列表');
        setPosts(normalized);
          }
        } catch (apiError) {
          console.warn('ForumPage: API数据获取失败，使用localStorage数据:', apiError);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts([]);
      }
    };
    
    loadPosts();
  }, [getForumPosts]);

  useEffect(() => {
    if (user && onAvatarUpdate) {
      const unsubscribe = onAvatarUpdate((updatedUser) => {
        setPosts(currentPosts => {
          const updatedPosts = currentPosts.map(post => 
            post.author === updatedUser.username 
              ? { ...post, authorAvatar: updatedUser.avatar } 
              : post
          );
          localStorage.setItem('oldksports_forum_posts', JSON.stringify(updatedPosts));
          return updatedPosts;
        });
      });
      return () => unsubscribe();
    }
    return undefined;
  }, [user, onAvatarUpdate, getForumPosts]);

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const postCategory = newPost.category;
    
    try {
      // 将图片路径嵌入到内容中
      let contentWithImages = newPost.content;
      if (newPostImages.length > 0) {
        // 使用网格布局优化图片显示
        const imageHtml = `
          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            ${newPostImages.map((imagePath, index) => 
              `<img src="${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${imagePath}" alt="帖子图片 ${index + 1}" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />`
            ).join('')}
          </div>
        `;
        contentWithImages = contentWithImages + '\n\n' + imageHtml;
      }
      
      // 使用新的API创建帖子
      const response = await forumAPI.createPost(newPost.title, contentWithImages, postCategory);
      
      // 检查响应格式 - 支持新的 { success: true } 格式和旧的字符串格式
      const isSuccess = (response && typeof response === 'object' && response.success) || 
                       (typeof response === 'string' && response.includes('created'));
      
      if (isSuccess) {
        setToast({ visible: true, message: '帖子发布成功！', type: 'success' });
        setNewPost({ title: '', content: '', category: 'general' });
        setNewPostImages([]);
        setShowNewPostForm(false);
        
        // 重新加载帖子列表
        const updatedPosts = await forumAPI.getPosts(1, 50);
        if (updatedPosts?.posts) {
          setPosts(updatedPosts.posts);
          localStorage.setItem('oldksports_forum_posts', JSON.stringify(updatedPosts.posts));
        }
        
        // 更新用户积分
        if (updateUserPoints) {
          try {
            await updateUserPoints(10);
            setToast({ visible: true, message: '发帖成功！获得10积分', type: 'points' });
          } catch (pointsError) {
            console.warn('积分更新失败:', pointsError);
          }
        }
      } else {
        const errorMessage = (response && response.message) || 
                           (typeof response === 'string' ? response : '发帖失败，请重试');
        setToast({ visible: true, message: errorMessage, type: 'error' });
      }
    } catch (error: any) {
      console.error('发帖失败:', error);
      
      // 检查是否是认证错误
      if (error.response?.status === 403 || error.message?.includes('无效的访问令牌')) {
        setShowTokenCleaner(true);
        setToast({ visible: true, message: '登录已过期，请重新登录', type: 'error' });
      } else {
        setToast({ visible: true, message: '发帖失败，请重试', type: 'error' });
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900">
        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ visible: false, message: '', type: 'info' })}
        />
        
        {/* 顶部导航栏 */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBackToMain} 
                disabled={selectedCategory === 'all'}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === 'all' 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="text-sm">{selectedCategory === 'all' ? '全部帖子' : '返回'}</span>
              </button>
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 bg-emerald-600/20 rounded-lg"><MessageSquare className="w-6 h-6 text-emerald-400" /></div>
                <div>
                  <h1 className="text-2xl font-bold text-white">体育论坛</h1>
                  <p className="text-gray-400">选择子版块开始交流</p>
                </div>
              </div>
                <div className="flex items-center space-x-4">
                {user && (
                    <button onClick={() => setShowNewPostForm(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                      <Plus className="w-4 h-4" /><span>发帖</span>
                    </button>
                )}
                </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">

            {/* 子版块选择 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 各个子版块 */}
                {categories.map((category) => {
                  const stats = getSubforumStats(category.id);
                  const isSelected = selectedCategory === category.id;
                  return (
                    <div key={category.id} onClick={() => handleSubforumClick(category.id)} className={`cursor-pointer group transition-all duration-300 ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : 'hover:scale-105 hover:shadow-xl'}`}>
                      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 h-80 flex flex-col justify-between">
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${category.id === 'general' ? 'bg-emerald-500/20 border-2 border-emerald-400/30' : category.id === 'business' ? 'bg-blue-500/20 border-2 border-blue-400/30' : 'bg-red-500/20 border-2 border-red-400/30'}`}>
                            {category.id === 'general' ? (<Users className="w-8 h-8 text-emerald-400" />) : category.id === 'business' ? (<Briefcase className="w-8 h-8 text-blue-400" />) : (<AlertTriangle className="w-8 h-8 text-red-400" />)}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm"><span className="text-gray-400">帖子数</span><span className="text-white font-semibold">{stats.totalPosts}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">回复数</span><span className="text-white font-semibold">{stats.totalReplies}</span></div>
                          <div className="text-xs text-gray-500">最新: {stats.latestPost}</div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-emerald-400 text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>点击查看</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            {/* 发帖表单 */}
            {showNewPostForm && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">发布新帖</h2>
                <form onSubmit={handleNewPostSubmit}>
                  <div className="space-y-4">
                    <div><input type="text" placeholder="帖子标题" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required /></div>
                    <div>
                      <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                        {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
                      </select>
                      <p className="text-sm text-emerald-400 mt-2">在 {categories.find(c => c.id === newPost.category)?.name} 中发帖</p>
                    </div>
                    <div><textarea placeholder="帖子内容" rows={6} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} required /></div>
                    
                    {/* 图片上传功能 */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white text-sm font-medium">📷 图片上传</div>
                        <div className="text-gray-400 text-xs">
                          {newPostImages.length}/9
                  </div>
                </div>
                      
                      <div className="mb-3">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files) {
                              if (newPostImages.length + files.length > 9) {
                                alert('最多只能上传9张图片');
                                return;
                              }
                              
                              try {
                                const fileArray = Array.from(files);
                                
                                // 验证文件类型和大小
                                const invalidFiles = fileArray.filter(file => {
                                  if (!file.type.startsWith('image/')) return true;
                                  if (file.size > 10 * 1024 * 1024) return true; // 10MB限制
                                  return false;
                                });
                                
                                if (invalidFiles.length > 0) {
                                  alert(`以下文件格式不支持或文件过大: ${invalidFiles.map(f => f.name).join(', ')}`);
                                  return;
                                }

                                // 创建FormData上传文件
                                const formData = new FormData();
                                fileArray.forEach(file => {
                                  formData.append('images', file);
                                });

                                // 上传文件到服务器
                                const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/upload/images`, {
                                  method: 'POST',
                                  body: formData,
                                });

                                const result = await response.json();
                                
                                if (result.success) {
                                  // 更新图片列表，存储文件路径
                                  const imagePaths = result.files.map(file => file.path);
                                  setNewPostImages([...newPostImages, ...imagePaths]);
                                } else {
                                  alert(`上传失败: ${result.error}`);
                                }
                              } catch (error) {
                                console.error('图片上传失败:', error);
                                alert('图片上传失败，请重试');
                              }
                            }
                          }}
                          className="hidden"
                          id="new-post-image-upload"
                        />
                        <label
                          htmlFor="new-post-image-upload"
                          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 cursor-pointer transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          添加图片 (最多9张)
                        </label>
                                    </div>
                      
                      {newPostImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {newPostImages.map((imagePath, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${imagePath}`}
                                alt={`上传的图片 ${index + 1}`}
                                className="w-full h-16 object-cover rounded-md border border-white/20"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = newPostImages.filter((_, i) => i !== index);
                                  setNewPostImages(newImages);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                  )}
                      
                      <div className="text-xs text-gray-400">
                        JPG/PNG/GIF • 单张≤5MB • 最多9张
                </div>
              </div>
                    
                    <div className="flex items-center justify-end space-x-4">
                      <button type="button" onClick={() => setShowNewPostForm(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200">取消</button>
                      <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200">发布帖子</button>
                    </div>
            </div>
                </form>
              </div>
            )}

            {/* 帖子列表 */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {selectedCategory === 'all' ? '最新帖子' : `${categories.find(c => c.id === selectedCategory)?.name} 帖子`}
                </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="latest">最新活动</option><option value="oldest">最早发布</option><option value="popular">最受欢迎</option><option value="replies">回复最多</option>
                      </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{sortedPosts.length} 个帖子</span>
                    {user && (
                    <button onClick={() => setShowNewPostForm(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                      <Plus className="w-4 h-4" /><span>发帖</span>
                    </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 stagger-children" style={{ '--stagger-delay': '9' } as React.CSSProperties}>
                {sortedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">暂无帖子</h3>
                    <p className="text-gray-300">{selectedCategory === 'all' ? '暂无帖子，快来发布第一个帖子吧！' : '该版块暂无帖子，快来发布第一个帖子吧！'}</p>
                  </div>
                ) : (
                  sortedPosts.map((post) => {
                    const avatarUrl = getUserAvatar(post.author);
                    const lastReplyTime = post.replies && post.replies.length > 0 ? formatTimeAgo(post.replies[post.replies.length - 1].createdAt) : formatTimeAgo(post.timestamp);
                    return (
                      <div key={post.id} className="block bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-emerald-400 transition-all duration-300 overflow-hidden"
                        style={{ 
                          // 优化方案：更合理的高度和间距
                          height: '180px'
                        }}>
                        <div className="p-3 h-full">
                          <div className="flex gap-4 h-full">
                            {/* 左侧用户信息 - 优化尺寸和布局 */}
                            <div className="flex flex-col items-center justify-between py-2 flex-shrink-0 w-20">
                              <div 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (post.author_id && post.author_id !== user?.id) {
                                    openChatWith({
                                      id: post.author_id,
                                      username: post.author,
                                      avatar: avatarUrl
                                    });
                                  }
                                }}
                                className="cursor-pointer hover:scale-105 transition-transform"
                                title={`与 ${post.author} 私信`}
                              >
                                <UserAvatar 
                                  username={post.author} 
                                  size="lg"
                                  className="w-16 h-16 border-2 border-white/20"
                                />
                              </div>
                              <div className="text-center w-full">
                                <div className="font-semibold text-white text-sm mb-1 truncate">{post.author}</div>
                                <div className="w-full">
                                  <UserLevelComponent username={post.author} />
                                </div>
                              </div>
                            </div>
                            
                            {/* 右侧内容区域 */}
                            <div className="flex-1 min-w-0 flex flex-col relative">
                              {/* 管理员删除按钮 - 绝对定位在右上角 */}
                              {user?.isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeletePost(post.id, post.title);
                                  }}
                                  className="absolute top-0 right-0 p-1.5 rounded-lg transition-all duration-200 z-20 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 bg-red-500/10"
                                  title="删除帖子"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              
                              {/* 可点击的内容区域 */}
                              <Link 
                                to={`/forum/post/${String(post.id)}`} 
                                className="flex-1 flex flex-col hover:bg-white/5 rounded-lg p-2 -m-2 ml-4 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2 pr-8">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${post.category === 'general' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : post.category === 'business' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}`}>
                                      {categories.find(c => c.id === post.category)?.name || post.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                                    <div className="flex items-center space-x-1">
                                      <Clock size={12} />
                                      <span>{formatTimeAgo(getPostTimestamp(post))}</span>
                                    </div>
                                    {post.replies && post.replies.length > 0 && (
                                      <div className="flex items-center space-x-1 text-emerald-400">
                                        <MessageSquare size={12} />
                                        <span>{formatTimeAgo(post.replies[post.replies.length - 1].createdAt)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <h3 className="text-base font-semibold text-white mb-2 hover:text-emerald-400 transition-colors line-clamp-1 pr-8">{post.title}</h3>
                                
                                {/* 内容区域 - 微调方案：统一高度，内容差异化 */}
                                <div className="flex-1 flex flex-col">
                                  {(() => {
                                    const images = extractImagesFromContent(post.content);
                                    const textContent = getTextContent(post.content);
                                    
                                    if (images.length > 0) {
                                      // 有图片的帖子：只显示图片，不显示文字描述
                                      return (
                                        <div className="flex-1">
                                          <PostImageGallery 
                                            images={images} 
                                            maxPreviewImages={3}
                                            className="h-full"
                                          />
                                        </div>
                                      );
                                    } else {
                                      // 无图片的帖子：显示文本摘要（紧凑样式）
                                      return (
                                        <div className="flex-1 flex flex-col justify-center py-1">
                                          <p className="text-gray-300 text-sm leading-snug line-clamp-4">
                                            {textContent.length > 250 ? `${textContent.substring(0, 250)}...` : textContent || '点击查看详情'}
                                          </p>
                                          {textContent.length > 250 && (
                                            <p className="text-emerald-400 text-xs mt-1">点击查看完整内容</p>
                                          )}
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                                    <div className="flex items-center space-x-1">
                                      <Reply size={12} />
                                      <span>{post.replies?.length || 0} 回复</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 移动端发帖按钮 */}
        {user && (
          <button onClick={() => navigate('/forum/new', { state: { from: '/forum' } })} className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center hover:scale-110">
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Token清理组件 */}
        {showTokenCleaner && <TokenCleaner />}

        {/* Toast通知 */}
        <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      </div>
    </PageTransition>
  );
};

export default ForumPage;