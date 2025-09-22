import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu, X, Bell, MessageCircle, AtSign, Mail, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [hideTimeoutId, setHideTimeoutId] = useState<number | null>(null);
  const [notificationCounts, setNotificationCounts] = useState({
    total: 0,
    reply: 0,
    mention: 0,
    message: 0,
    system: 0
  });
  const isHomePage = location.pathname === '/';

  // 显示通知菜单
  const showNotificationMenu = () => {
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setHideTimeoutId(null);
    }
    setIsAnimatingOut(false); // 取消渐隐动画
    setShowNotificationDropdown(true);
  };

  // 延迟隐藏通知菜单
  const hideNotificationMenu = () => {
    const timeoutId = setTimeout(() => {
      // 开始渐隐动画
      setIsAnimatingOut(true);
      // 1秒后完全隐藏
      setTimeout(() => {
        setShowNotificationDropdown(false);
        setIsAnimatingOut(false);
      }, 1000);
    }, 500); // 0.5秒后开始隐藏流程
    setHideTimeoutId(timeoutId as any);
  };
  
  // 获取通知数量
  const fetchNotificationCounts = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('oldksports_auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationCounts(data.data);
        }
      }
    } catch (error) {
      console.error('获取通知数量失败:', error);
    }
  };

  // 用户登录时获取通知
  useEffect(() => {
    if (user) {
      fetchNotificationCounts();
    }
  }, [user]);

  // 定期更新通知数量
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchNotificationCounts, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [user]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
      }
    };
  }, [hideTimeoutId]);

  // 标记通知类型为已读
  const markNotificationsAsRead = async (type: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('oldksports_auth_token')}`
        },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        // 更新本地计数
        setNotificationCounts(prev => ({
          ...prev,
          [type]: 0,
          total: prev.total - prev[type as keyof typeof prev]
        }));
      }
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/forum', label: '行业论坛' },
    { to: '/merchants', label: '优秀商家' },
    { to: '/blacklist', label: '曝光黑榜' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleAuthNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-gradient-radial from-slate-700 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-white font-bold text-xl">
            OldKSports
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 font-manrope">
            {navLinks.map((link) => (
              isAuthenticated ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-emerald-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.to}
                  onClick={() => handleAuthNavigation('/login')}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-emerald-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4 font-manrope">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* 用户名和通知 */}
                <div 
                  className="relative"
                  onMouseEnter={showNotificationMenu}
                  onMouseLeave={hideNotificationMenu}
                >
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors relative px-2 py-1 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.username}</span>
                    {user?.level && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${user.level.color}20`, color: user.level.color }}
                      >
                        {user.level.name}
                      </span>
                    )}
                    {/* 通知数字 - 微信风格 */}
                    {notificationCounts.total > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                        {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
                      </div>
                    )}
                  </Link>
                  
                  {/* 通知下拉菜单 - 带渐隐动画 */}
                  {showNotificationDropdown && (
                    <div 
                      className={`absolute right-0 mt-3 w-72 z-[9999] bg-slate-800/95 rounded-2xl border border-slate-600/50 shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-1000 ease-out ${
                        isAnimatingOut 
                          ? 'opacity-0 scale-95 translate-y-2' 
                          : 'opacity-100 scale-100 translate-y-0'
                      }`}
                      onMouseEnter={showNotificationMenu}
                      onMouseLeave={hideNotificationMenu}
                      style={{
                        transform: isAnimatingOut 
                          ? 'translateY(8px) scale(0.95)' 
                          : 'translateY(0) scale(1)',
                        opacity: isAnimatingOut ? 0 : 1,
                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* 通知标题区域 */}
                      <div className="px-5 py-4 border-b border-slate-700/50 bg-transparent">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">通知消息</h3>
                          {notificationCounts.total > 0 && (
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg">
                              {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 通知分类列表 - 深色背景 */}
                      <div className="py-2 bg-transparent">
                        {/* 回复通知 */}
                        <button
                          onClick={() => {
                            markNotificationsAsRead('reply');
                            navigate('/notifications?type=reply');
                            setShowNotificationDropdown(false);
                          }}
                          className="group flex items-center justify-between w-full px-5 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/10 hover:text-white transition-all duration-300 bg-transparent"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                              <MessageCircle size={20} className="text-blue-400" />
                            </div>
                            <span className="font-medium">回复</span>
                          </div>
                          {notificationCounts.reply > 0 && (
                            <div className="bg-blue-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
                              {notificationCounts.reply}
                            </div>
                          )}
                        </button>

                          {/* @提醒 */}
                          <button
                            onClick={() => {
                              markNotificationsAsRead('mention');
                              navigate('/notifications?type=mention');
                              setShowNotificationDropdown(false);
                            }}
                            className="group flex items-center justify-between w-full px-5 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-500/10 hover:text-white transition-all duration-300 bg-transparent"
                          >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                              <AtSign size={20} className="text-emerald-400" />
                            </div>
                            <span className="font-medium">@提醒</span>
                          </div>
                          {notificationCounts.mention > 0 && (
                            <div className="bg-emerald-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
                              {notificationCounts.mention}
                            </div>
                          )}
                        </button>

                        {/* 私信 */}
                        <button
                          onClick={() => markNotificationsAsRead('message')}
                          className="group flex items-center justify-between w-full px-5 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-500/10 hover:text-white transition-all duration-300 bg-transparent"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                              <Mail size={20} className="text-purple-400" />
                            </div>
                            <span className="font-medium">私信</span>
                          </div>
                          {notificationCounts.message > 0 && (
                            <div className="bg-purple-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
                              {notificationCounts.message}
                            </div>
                          )}
                        </button>

                          {/* 系统通知 */}
                          <button
                            onClick={() => {
                              markNotificationsAsRead('system');
                              navigate('/notifications?type=system');
                              setShowNotificationDropdown(false);
                            }}
                            className="group flex items-center justify-between w-full px-5 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-amber-500/10 hover:text-white transition-all duration-300 bg-transparent"
                          >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center group-hover:bg-amber-600/30 transition-colors">
                              <AlertCircle size={20} className="text-amber-400" />
                            </div>
                            <span className="font-medium">系统通知</span>
                          </div>
                          {notificationCounts.system > 0 && (
                            <div className="bg-amber-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
                              {notificationCounts.system}
                            </div>
                          )}
                        </button>
                      </div>

                      {/* 底部操作区域 */}
                      <div className="border-t border-slate-700/50 mt-1 bg-transparent">
                        <Link
                          to="/notifications"
                          className="group flex items-center justify-center space-x-2 px-5 py-4 text-gray-400 hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-slate-600/20 hover:text-emerald-400 transition-all duration-300 rounded-b-2xl"
                        >
                          <Bell size={18} className="group-hover:scale-110 transition-transform" />
                          <span className="font-medium">查看全部通知</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-red-500/50"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAuthNavigation('/login')}
                  className="text-sm font-medium transition-colors text-gray-300 hover:text-white"
                >
                  登录
                </button>
                <button
                  onClick={() => handleAuthNavigation('/register')}
                  className="premium-button text-sm font-medium"
                >
                  注册
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-colors ${
                isHomePage 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-slate-800 border-slate-700">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                isAuthenticated ? (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'text-emerald-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.to}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleAuthNavigation('/login');
                    }}
                    className={`block text-sm font-medium transition-colors text-left ${
                      location.pathname === link.to
                        ? 'text-emerald-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                )
              ))}
              
              <div className="pt-3 border-t border-slate-700">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-300"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{user?.username}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-all duration-200 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>登出</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="block text-sm font-medium text-gray-300"
                    >
                      登录
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/register');
                      }}
                      className="block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium text-center shadow-lg"
                    >
                      注册
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navigation;