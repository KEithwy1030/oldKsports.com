import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  MessageSquare, 
  Store, 
  AlertTriangle, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  MessageCircle,
  AtSign,
  Mail,
  AlertCircle
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    total: 0,
    reply: 0,
    mention: 0,
    message: 0,
    system: 0
  });
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  
  // 监听用户状态变化，确保头像实时更新
  useEffect(() => {
    if (user) {
      fetchNotificationCounts();
    }
  }, [user]);

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

  // 定期更新通知数量
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchNotificationCounts, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [user]);

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

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/forum', label: '论坛', icon: MessageSquare },
    { path: '/merchant', label: '商家', icon: Store },
    { path: '/blacklist', label: '黑榜', icon: AlertTriangle },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              Old K Sports
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                {/* 用户名按钮 - 绑定鼠标事件 */}
                <button 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-red-200 transition-colors relative border-2 border-blue-500"
                  onClick={() => {
                    console.log('用户名按钮被点击！');
                    setShowNotificationDropdown(!showNotificationDropdown);
                  }}
                  onMouseEnter={() => {
                    console.log('🔥 鼠标进入用户名按钮');
                    setShowNotificationDropdown(true);
                  }}
                  onMouseLeave={() => {
                    console.log('🔥 鼠标离开用户名按钮');
                    setTimeout(() => setShowNotificationDropdown(false), 100);
                  }}
                  style={{
                    backgroundColor: 'yellow',
                    border: '3px solid blue',
                    padding: '10px'
                  }}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                      key={user.avatar + (user.id || '') + Date.now()}
                      onError={(e) => {
                        console.error('Avatar image failed to load:', e);
                        console.log('Avatar URL:', user.avatar);
                      }}
                      onLoad={() => {
                        console.log('Avatar image loaded successfully');
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <span className="font-medium text-gray-700">
                    {user.username}
                  </span>
                  {/* 通知数字 - 微信风格 */}
                  {notificationCounts.total > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                      {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
                    </div>
                  )}
                </button>
                
                
                {/* 通知下拉菜单 */}
                {showNotificationDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-red-500 z-[9999]"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '8px',
                      zIndex: 9999,
                      backgroundColor: 'white',
                      border: '2px solid red'
                    }}
                    onMouseEnter={() => {
                      console.log('鼠标进入下拉菜单');
                      setShowNotificationDropdown(true);
                    }}
                    onMouseLeave={() => {
                      console.log('鼠标离开下拉菜单');
                      setShowNotificationDropdown(false);
                    }}
                  >
                    <div className="py-3">
                      {/* 通知标题 */}
                      <div className="px-4 pb-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                          <span>通知消息</span>
                          {notificationCounts.total > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {notificationCounts.total}
                            </span>
                          )}
                        </h3>
                      </div>
                      
                      {/* 通知分类 */}
                      <div className="py-2">
                        {/* 回复通知 */}
                        <button
                          onClick={() => markNotificationsAsRead('reply')}
                          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <MessageCircle size={18} className="text-blue-500" />
                            <span>回复</span>
                          </div>
                          {notificationCounts.reply > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                              {notificationCounts.reply}
                            </span>
                          )}
                        </button>

                        {/* @提醒 */}
                        <button
                          onClick={() => markNotificationsAsRead('mention')}
                          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <AtSign size={18} className="text-green-500" />
                            <span>@提醒</span>
                          </div>
                          {notificationCounts.mention > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                              {notificationCounts.mention}
                            </span>
                          )}
                        </button>

                        {/* 私信 */}
                        <button
                          onClick={() => markNotificationsAsRead('message')}
                          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Mail size={18} className="text-purple-500" />
                            <span>私信</span>
                          </div>
                          {notificationCounts.message > 0 && (
                            <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1">
                              {notificationCounts.message}
                            </span>
                          )}
                        </button>

                        {/* 系统通知 */}
                        <button
                          onClick={() => markNotificationsAsRead('system')}
                          className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <AlertCircle size={18} className="text-orange-500" />
                            <span>系统通知</span>
                          </div>
                          {notificationCounts.system > 0 && (
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                              {notificationCounts.system}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* 分割线和底部选项 */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          to="/notifications"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Bell size={16} />
                          <span>查看全部通知</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 用户菜单 - 暂时隐藏，只显示通知菜单 */}
                {!showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User size={16} />
                      <span>个人资料</span>
                    </Link>
                    {user.roles?.includes('admin') && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings size={16} />
                        <span>管理后台</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;