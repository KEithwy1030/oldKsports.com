// 紧急防护组件 - 防止undefined错误
import React from 'react';
import { useAuth } from '../context/AuthContext';

interface EmergencyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const EmergencyGuard: React.FC<EmergencyGuardProps> = ({ 
  children, 
  fallback = <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
      <p>正在加载用户数据...</p>
    </div>
  </div>
}) => {
  const { user, isLoading } = useAuth();
  
  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  // 如果用户数据不完整，显示错误状态
  if (!user || !user.id || !user.username) {
    console.warn('EmergencyGuard: 用户数据不完整，显示错误状态');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ 用户数据异常</div>
          <p className="mb-4">请重新登录</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default EmergencyGuard;
