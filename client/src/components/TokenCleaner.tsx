import React from 'react';
import { authAPI } from '../utils/api';

const TokenCleaner: React.FC = () => {
  const handleClearTokens = () => {
    // 清理所有可能的认证数据
    localStorage.removeItem('oldksports_auth_token');
    localStorage.removeItem('oldksports_user');
    localStorage.removeItem('oldksports_bot_accounts');
    localStorage.removeItem('oldksports_forum_posts');
    
    // 清除cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // 清除sessionStorage中的数据
    sessionStorage.clear();
    
    alert('已清理所有认证数据，页面将刷新');
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-3 rounded-lg shadow-lg">
      <p className="text-sm mb-2">检测到认证问题</p>
      <button 
        onClick={handleClearTokens}
        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
      >
        清理并重新登录
      </button>
    </div>
  );
};

export default TokenCleaner;
