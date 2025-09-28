import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, AtSign, AlertCircle, Bell, Trash2, ExternalLink, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

interface Notification {
  id: number;
  type: 'reply' | 'mention' | 'system';
  title: string;
  content: string;
  sender_username?: string;
  sender_avatar?: string;
  post_title?: string;
  related_post_id?: number;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('type') || 'all');
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());

  // 切换通知展开状态
  const toggleNotificationExpanded = (notificationId: number) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  // 获取通知列表
  const fetchNotifications = async (type?: string) => {
    if (!user) return;
    
    try {
      const url = type && type !== 'all' 
        ? `/api/notifications/list?type=${type}` 
        : '/api/notifications/list';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('oldksports_auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
        }
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [user, activeFilter]);

  // 筛选器配置
  const filters = [
    { id: 'all', label: '全部', icon: Bell, color: 'emerald' },
    { id: 'reply', label: '回复', icon: MessageCircle, color: 'blue' },
    { id: 'mention', label: '@提醒', icon: AtSign, color: 'green' },
    { id: 'system', label: '系统通知', icon: AlertCircle, color: 'amber' }
  ];

  // 切换筛选器
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    if (filterId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type: filterId });
    }
  };

  // 标记单个通知为已读
  const markAsRead = async (notificationId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/notifications/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('oldksports_auth_token')}`
        },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 删除通知
  const deleteNotification = async (notificationId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('oldksports_auth_token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  // 跳转到相关帖子
  const goToPost = (postId: number) => {
    navigate(`/forum/post/${postId}`);
  };

  // 获取通知图标和颜色
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'reply':
        return { icon: MessageCircle, color: 'blue', bgColor: 'bg-blue-600/20', textColor: 'text-blue-400' };
      case 'mention':
        return { icon: AtSign, color: 'emerald', bgColor: 'bg-emerald-600/20', textColor: 'text-emerald-400' };
      case 'system':
        return { icon: AlertCircle, color: 'amber', bgColor: 'bg-amber-600/20', textColor: 'text-amber-400' };
      default:
        return { icon: Bell, color: 'gray', bgColor: 'bg-gray-600/20', textColor: 'text-gray-400' };
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
               <button
                 onClick={() => navigate(-1)}
                 className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-emerald-500/50"
               >
                 <ArrowLeft size={20} />
               </button>
              <div>
                <h1 className="text-2xl font-bold text-white">通知中心</h1>
                <p className="text-gray-400 text-sm">管理您的所有通知消息</p>
              </div>
            </div>
          </div>

          {/* 筛选标签栏 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = activeFilter === filter.id;
              
              return (
                 <button
                   key={filter.id}
                   onClick={() => handleFilterChange(filter.id)}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                     isActive
                       ? filter.id === 'system'
                         ? 'bg-amber-600 text-white shadow-lg'
                         : filter.id === 'reply'
                         ? 'bg-blue-600 text-white shadow-lg'
                         : filter.id === 'mention'
                         ? 'bg-emerald-600 text-white shadow-lg'
                         : 'bg-emerald-600 text-white shadow-lg'
                       : 'bg-slate-700/30 text-gray-300 hover:bg-slate-700/50 hover:text-white border border-slate-600/50'
                   }`}
                 >
                  <IconComponent size={16} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* 通知列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4"></div>
              <p className="text-gray-300">正在加载通知...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;
                
                return (
                   <div
                     key={notification.id}
                     className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-600/30 p-4 hover:border-slate-500/50 transition-all duration-200 ${
                       !notification.is_read 
                         ? notification.type === 'system' 
                           ? 'ring-1 ring-amber-500/50 border-amber-500/30' 
                           : notification.type === 'mention'
                           ? 'ring-1 ring-emerald-500/50 border-emerald-500/30'
                           : 'ring-1 ring-blue-500/50 border-blue-500/30'
                         : ''
                     }`}
                   >
                    <div className="flex items-start space-x-4">
                      {/* 通知图标 */}
                      <div className={`w-10 h-10 ${style.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <IconComponent size={20} className={style.textColor} />
                      </div>
                      
                       {/* 通知内容 */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             {/* 标题和展开按钮 */}
                             <div 
                               className="flex items-center space-x-2 cursor-pointer hover:text-emerald-400 transition-colors"
                               onClick={() => toggleNotificationExpanded(notification.id)}
                             >
                               <h3 className={`font-medium ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>
                                 {notification.title}
                               </h3>
                               {expandedNotifications.has(notification.id) ? (
                                 <ChevronDown size={16} className="text-gray-400" />
                               ) : (
                                 <ChevronRight size={16} className="text-gray-400" />
                               )}
                             </div>
                             
                             {/* 展开的内容 */}
                             {expandedNotifications.has(notification.id) && (
                               <div className="mt-2 space-y-2">
                                 <p className="text-gray-400 text-sm whitespace-pre-line">
                                   {notification.content}
                                 </p>
                                 
                                 {/* 发送者和帖子信息 */}
                                 {notification.sender_username && (
                                   <div className="flex items-center space-x-2 text-xs text-gray-500">
                                     <span>来自：{notification.sender_username}</span>
                                     {notification.post_title && (
                                       <>
                                         <span>•</span>
                                         <span>帖子：{notification.post_title}</span>
                                       </>
                                     )}
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                          
                          {/* 时间和状态 */}
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatTime(notification.created_at)}</span>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex items-center space-x-2 mt-3">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              标记已读
                            </button>
                          )}
                          
                          {notification.related_post_id && (
                            <button
                              onClick={() => goToPost(notification.related_post_id!)}
                              className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink size={12} />
                              <span>查看帖子</span>
                            </button>
                          )}
                          
                           <button
                             onClick={() => deleteNotification(notification.id)}
                             className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 transition-all duration-200"
                           >
                             <Trash2 size={12} />
                             <span>删除</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">暂无通知</h3>
              <p className="text-gray-400">当有新的互动时，通知会显示在这里</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default NotificationsPage;
