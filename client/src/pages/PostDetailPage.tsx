import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Eye, Clock, Heart, Reply, Send, Smile, Image, Video, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FORUM_CATEGORIES } from '../data/constants';
import { mockUsers } from '../data/mockData';
import { POINTS_SYSTEM, USER_LEVELS } from '../data/constants';
import { forumAPI } from '../utils/api';
import { formatTimeAgo } from '../utils/userUtils';
import Toast from '../components/Toast';
import PostContent from '../components/PostContent';
import UserAvatar from '../components/UserAvatar';
import ClickableUserAvatar from '../components/ClickableUserAvatar';
import UserLevelComponent from '../components/UserLevel';
import '../styles/modal-fix.css';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, getForumPosts, addForumReply, incrementPostViews, addReplyToPost, updateUserPoints } = useAuth();
  const { openChatWith } = useChat();
  const [post, setPost] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadComplete, setUploadComplete] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'points'}>({ visible: false, message: '', type: 'info' });

  // 加载帖子详情
  useEffect(() => {
    const loadPost = async () => {
      console.log('PostDetailPage: 开始加载帖子, postId:', postId);
      try {
        // 先从 localStorage 读取，确保本地回复能立即显示
        try {
          const raw = localStorage.getItem('oldksports_forum_posts');
          if (raw) {
            const storedPosts = JSON.parse(raw);
            const localFound = storedPosts.find((p: any) => String(p.id) === postId);
            console.log('PostDetailPage: localStorage中找到帖子:', localFound);
            if (localFound) {
              setPost(localFound);
              try { await incrementPostViews(localFound.id); } catch {}
            }
          }
        } catch {}

        // 再请求后端API获取单个帖子，成功则以服务端数据为准
        if (postId) {
          const response = await forumAPI.getPostById(postId);
        console.log('PostDetailPage: API响应:', response);
        if (response.post) {
          try { await incrementPostViews(response.post.id); } catch {}
          // 若本地有更多回复，进行轻量合并以保证已发本地回复可见
          try {
            const raw = localStorage.getItem('oldksports_forum_posts');
            if (raw) {
              const storedPosts = JSON.parse(raw);
              const localFound = storedPosts.find((p: any) => String(p.id) === postId);
              if (localFound && Array.isArray(localFound.replies)) {
                const serverReplies = Array.isArray(response.post.replies) ? response.post.replies : [];
                if (localFound.replies.length > serverReplies.length) {
                  setPost({ ...response.post, replies: localFound.replies });
                  return;
                }
              }
            }
          } catch {}
          setPost(response.post);
          return;
        }
        }

        // API无结果时，最后再兜底一次本地数据
        try {
          const raw = localStorage.getItem('oldksports_forum_posts');
          if (raw) {
            const storedPosts = JSON.parse(raw);
            const foundPost = storedPosts.find((p: any) => String(p.id) === postId);
            if (foundPost) {
              try { await incrementPostViews(foundPost.id); } catch {}
              setPost(foundPost);
              return;
            }
          }
        } catch {}
        
        // 如果所有方法都失败，尝试从AuthContext获取
        try {
          const allPosts = await getForumPosts();
          const foundPost = allPosts.find((p: any) => String(p.id) === postId);
          if (foundPost) {
            try { await incrementPostViews(foundPost.id); } catch {}
            setPost(foundPost);
            return;
          }
        } catch {}
        
        console.log('PostDetailPage: 所有方法都失败，跳转到论坛页面');
        navigate('/forum');
      } catch (error) {
        console.error('Failed to load post:', error);
        // 回退到本地数据
        try {
          const raw = localStorage.getItem('oldksports_forum_posts');
          if (raw) {
            const storedPosts = JSON.parse(raw);
            const foundPost = storedPosts.find((p: any) => String(p.id) === postId);
            if (foundPost) {
              try { await incrementPostViews(foundPost.id); } catch {}
              setPost(foundPost);
              return;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        
        // 最后尝试从AuthContext获取
        try {
          const allPosts = await getForumPosts();
          const foundPost = allPosts.find((p: any) => String(p.id) === postId);
          if (foundPost) {
            try { await incrementPostViews(foundPost.id); } catch {}
            setPost(foundPost);
            return;
          }
        } catch (authContextError) {
          console.error('AuthContext fallback also failed:', authContextError);
        }
        
        console.log('PostDetailPage: 所有方法都失败，跳转到论坛页面');
        navigate('/forum');
      }
    };
    
    loadPost();
  }, [postId, getForumPosts, navigate, incrementPostViews]);

  // 获取用户头像
  const getUserAvatar = (username: string) => {
    // 首先检查当前用户
    if (user && user.username === username) {
      return user.avatar;
    }
    
    // 然后检查mock用户
    const mockUser = mockUsers.find((u: any) => u.username === username);
    if (mockUser && mockUser.avatar) {
      return mockUser.avatar;
    }
    
    // 最后检查帖子数据中的头像
    if (post && post.replies) {
      const reply = post.replies.find((r: any) => r.author === username);
      if (reply && reply.authorAvatar) {
        return reply.authorAvatar;
      }
    }
    
    return null;
  };




  const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // 检查图片数量限制
    if (selectedFiles.length + files.length > 9) {
      setToast({ visible: true, message: '最多只能上传9张图片', type: 'error' });
      return;
    }
    
    // 验证文件类型和大小
    const validFiles = files.filter(file => {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setToast({ visible: true, message: `图片 ${file.name} 超过10MB限制`, type: 'error' });
          return false;
        }
        return true;
      } else if (file.type.startsWith('video/')) {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          setToast({ visible: true, message: `视频 ${file.name} 超过100MB限制`, type: 'error' });
          return false;
        }
        return true;
      }
      return false;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // 模拟上传进度
    validFiles.forEach(file => {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      setUploadComplete(prev => ({
        ...prev,
        [file.name]: false
      }));
      
      // 模拟上传进度 - 确保100%完成
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10; // 确保每次至少增加10%
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // 确保最终进度为100%并标记为完成
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));
          setUploadComplete(prev => ({
            ...prev,
            [file.name]: true
          }));
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress)
          }));
        }
      }, 150); // 稍微加快进度更新
    });
  };

  // 移除文件
  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadComplete(prev => {
      const newComplete = { ...prev };
      delete newComplete[fileName];
      return newComplete;
    });
  };

  // 显示图片放大查看
  const showImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // 插入emoji
  const insertEmoji = (emoji: string) => {
    setReplyContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // 提交回复
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!replyContent.trim() && selectedFiles.length === 0)) return;

    setIsSubmitting(true);
    
    try {
      // 处理图片文件，转换为base64
      let replyData = replyContent;
      if (selectedFiles.length > 0) {
        const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          const imagePromises = imageFiles.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            });
          });
          
          const imageDataUrls = await Promise.all(imagePromises);
          const imageHtml = imageDataUrls.map((dataUrl, index) => 
            `<img src="${dataUrl}" alt="图片${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`
          ).join('');
          
          replyData = replyContent + (replyContent ? '<br/>' : '') + imageHtml;
        }
      }
      
      // 优先使用后端API创建回复
      if (postId) {
        await forumAPI.createReply(postId, replyData);
        
        // 奖励积分并检查等级
        await updateUserPoints(POINTS_SYSTEM.REPLY_POST);
        
        // 重新加载帖子数据（以服务端数据为准）
        const response = await forumAPI.getPostById(postId);
      if (response.post) {
        setPost(response.post);
      } else {
        // 如果API没有返回，回退到本地数据
        const posts = await getForumPosts();
        const updatedPost = posts.find((p: any) => String(p.id) === postId);
        if (updatedPost) {
          setPost(updatedPost);
        }
      }
      }

      // 浮窗提示积分增加
      setToast({ visible: true, message: `+${POINTS_SYSTEM.REPLY_POST} 积分`, type: 'points' });
      
      setReplyContent('');
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadComplete({});
      setShowReplyBox(false);
      
    } catch (error) {
      console.error('Failed to submit reply:', error as any);
      // 后端暂未提供 /posts/:id/replies，出现 404/500 时使用本地回退
      try {
        const newLocalReply = {
          author: user.username,
          content: replyContent,
        };
        if (postId) {
          await addReplyToPost(postId, newLocalReply);
        }
        
        // 回退路径同样给积分
        await updateUserPoints(POINTS_SYSTEM.REPLY_POST);

        // 浮窗提示积分增加
        setToast({ visible: true, message: `+${POINTS_SYSTEM.REPLY_POST} 积分`, type: 'points' });
        
        // 1) 直接在当前内存状态中追加，确保立刻可见
        let updatedLocalPost: any = null;
        setPost(prev => {
          if (!prev) return prev as any;
          const replies = Array.isArray(prev.replies) ? prev.replies : [];
          const appended = [...replies, { ...newLocalReply, id: Date.now().toString(), createdAt: new Date(), likes: 0 }];
          updatedLocalPost = { ...prev, replies: appended };
          return updatedLocalPost;
        });
        
        // 1.5) 立刻写回 localStorage，若不存在该帖子则创建
        try {
          const raw = localStorage.getItem('oldksports_forum_posts');
          const localPosts = raw ? JSON.parse(raw) : [];
          const idx = localPosts.findIndex((p: any) => String(p.id) === postId);
          if (idx >= 0) {
            localPosts[idx] = updatedLocalPost || localPosts[idx];
          } else if (updatedLocalPost) {
            localPosts.unshift(updatedLocalPost);
          }
          localStorage.setItem('oldksports_forum_posts', JSON.stringify(localPosts));
        } catch {}
        
        // 2) 再从 localStorage 读取一次，保证与存储一致
        try {
          const raw = localStorage.getItem('oldksports_forum_posts');
          if (raw) {
            const storedPosts = JSON.parse(raw);
            const updatedPost = storedPosts.find((p: any) => String(p.id) === postId);
            if (updatedPost) {
              setPost(updatedPost);
            }
          }
        } catch {}
        
        setReplyContent('');
        setSelectedFiles([]);
        setUploadProgress({});
        setUploadComplete({});
        setShowReplyBox(false);
      } catch (fallbackError) {
        console.error('Local reply fallback failed:', fallbackError);
        setToast({ visible: true, message: '❌ 回复发布失败，请稍后重试', type: 'error' });
      }
    }
    
    setIsSubmitting(false);
  };

  if (!post) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p className="text-white">加载中...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  
  const lastReplyTime = post.replies && post.replies.length > 0 
    ? formatTimeAgo(post.replies[post.replies.length - 1].createdAt)
    : formatTimeAgo(post.timestamp);

  return (
    <>
      <PageTransition>
        <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900 pb-24">
          {/* Toast */}
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ visible: false, message: '', type: 'info' })}
          />
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/forum')}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回论坛</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {post.title}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {FORUM_CATEGORIES.find(c => c.id === post.category)?.name || post.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Post Content */}
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 cursor-pointer hover:bg-white/15 transition-all duration-200 hover:border-white/30 hover:shadow-lg"
            onClick={() => setShowReplyBox(true)}
          >
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-6">
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 点击了帖子作者头像:', post.author, 'ID:', post.author_id);
                  console.log('🔥 当前用户:', user?.username, 'ID:', user?.id);
                  console.log('🔥 openChatWith函数:', typeof openChatWith);
                  
                  if (post.author_id && post.author_id !== user?.id) {
                    console.log('🔥 正在开启聊天...');
                    openChatWith({
                      id: post.author_id,
                      username: post.author,
                      avatar: getUserAvatar(post.author)
                    });
                  } else {
                    console.log('🔥 不能与自己聊天或用户ID无效');
                  }
                }}
                className="cursor-pointer hover:scale-105 transition-transform"
                title={`与 ${post.author} 私信`}
              >
                <UserAvatar 
                  username={post.author} 
                  size="md"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <div className="font-semibold text-white">{post.author}</div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <UserLevelComponent username={post.author} />
                  <span className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{formatTimeAgo(post.timestamp)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-invert max-w-none mb-6">
              <PostContent 
                content={post.content} 
                className="text-gray-300"
              />
            </div>

            {/* Post Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-400 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Reply size={16} />
                <span>{post.replies?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart size={16} />
                <span>{post.likes}</span>
              </div>
              <span className="text-xs text-gray-500">
                最后回复: {lastReplyTime}
              </span>
              <span className="text-xs text-emerald-400 ml-auto">
                点击帖子回复
              </span>
            </div>
          </div>


          {/* Replies */}
          {post.replies && post.replies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>{post.replies.length} 个回复</span>
              </h2>
              
              {post.replies
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((reply: any) => {
                return (
                  <div 
                    key={reply.id} 
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 cursor-pointer hover:bg-white/15 transition-all duration-200 hover:border-white/30 hover:shadow-lg"
                    onClick={() => setShowReplyBox(true)}
                  >
                    {/* Reply Author */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔥 点击了回复者头像:', reply.author, 'ID:', reply.author_id);
                          
                          if (reply.author_id && reply.author_id !== user?.id) {
                            console.log('🔥 正在开启与回复者的聊天...');
                            openChatWith({
                              id: reply.author_id,
                              username: reply.author,
                              avatar: getUserAvatar(reply.author)
                            });
                          } else {
                            console.log('🔥 不能与自己聊天或用户ID无效');
                          }
                        }}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        title={`与 ${reply.author} 私信`}
                      >
                        <UserAvatar 
                          username={reply.author} 
                          size="sm"
                          className="w-10 h-10"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{reply.author}</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <UserLevelComponent username={reply.author} />
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatTimeAgo(reply.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reply Content */}
                    <div className="mb-4">
                      <PostContent 
                        content={reply.content} 
                        className="text-gray-300 text-sm"
                      />
                    </div>

                    {/* Reply Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                        <Heart size={12} />
                        <span>0</span>
                      </button>
                      <div className="flex items-center space-x-1 text-emerald-400">
                        <Reply size={12} />
                        <span>点击回复</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Reply Box at Bottom */}
    {showReplyBox && (
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        {/* Backdrop */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          onClick={() => setShowReplyBox(false)}
        />
        
        {/* Reply Box */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '672px', zIndex: 10 }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '24px'
          }}>
        {user ? (
          <form onSubmit={handleReplySubmit} className="space-y-3">
            {/* Reply Editor */}
            <div className="relative">
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 0, 0.1)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 0, 0.2)'}
                  onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 0, 0.1)'}
                  title="添加表情"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <label 
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                  onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                  title="上传图片"
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Image className="w-5 h-5" />
                </label>
                <label 
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#a78bfa',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(147, 51, 234, 0.2)'}
                  onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(147, 51, 234, 0.1)'}
                  title="上传视频"
                >
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Video className="w-5 h-5" />
                </label>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 0, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  maxHeight: '192px',
                  overflowY: 'auto',
                  zIndex: 10,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="p-2 hover:bg-yellow-400/30 rounded-xl text-lg transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea */}
              <textarea
                placeholder="写下你的回复..."
                className="w-full px-6 py-5 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-gradient-to-br focus:from-slate-600/70 focus:to-slate-700/70 resize-none transition-all duration-300 text-base shadow-inner"
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm text-cyan-300 font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>已选择的文件</span>
                </h3>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-xl p-4 border border-slate-600/30 shadow-lg">
                    {file.type.startsWith('image/') ? (
                      // 图片文件显示缩略图
                      <div className="flex items-start space-x-4">
                        <div className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg border border-slate-600/50 shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => showImagePreview(file)}
                              className="text-white text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
                            >
                              放大看
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-white text-sm font-medium truncate">
                                {file.name}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                              {uploadProgress[file.name] !== undefined && (
                                <div className="w-full bg-slate-600/50 rounded-full h-1.5 shadow-inner mt-2">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                                      uploadComplete[file.name] 
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                                        : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                    }`}
                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                  />
                                </div>
                              )}
                              {uploadComplete[file.name] && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-green-400 text-xs">上传完成</span>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.name)}
                              className="p-2 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg ml-2"
                            >
                              <X className="w-4 h-4 text-slate-400 hover:text-red-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 视频文件显示图标
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-xl shadow-lg">
                            <Video className="w-5 h-5 text-blue-300" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium truncate max-w-xs">
                              {file.name}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {uploadProgress[file.name] !== undefined && (
                            <div className="w-20 bg-slate-600/50 rounded-full h-2 shadow-inner">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                                  uploadComplete[file.name] 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                                    : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                }`}
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              />
                            </div>
                          )}
                          {uploadComplete[file.name] && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              <span className="text-green-400 text-xs">完成</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="p-2 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          >
                            <X className="w-4 h-4 text-slate-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowReplyBox(false)}
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-300 rounded-2xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-slate-500/25 hover:scale-105 font-medium"
              >
                <span>取消</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!replyContent.trim() && selectedFiles.length === 0)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 disabled:from-slate-600 disabled:via-slate-700 disabled:to-slate-800 text-white rounded-2xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/30 hover:scale-105 disabled:hover:scale-100 font-medium"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '发送中...' : '发布回复'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-300 mb-4 text-base">请先登录后参与回复讨论</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
            >
              登录
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    )}
    </PageTransition>

    {/* Image Preview Modal */}
    {showImageModal && selectedImage && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={closeImagePreview}
        />
        
        {/* Image Container */}
        <div className="relative max-w-4xl max-h-[90vh] bg-slate-800/95 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closeImagePreview}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image */}
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-full object-contain max-h-[90vh]"
          />
        </div>
      </div>
    )}
    </>
  );
};

export default PostDetailPage;