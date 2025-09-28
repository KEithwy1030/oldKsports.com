// 全局错误边界 - 捕获并处理undefined错误
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary捕获到错误:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary详细错误:', error, errorInfo);
    
    // 如果是undefined相关的错误，清理localStorage
    if (error.message.includes('undefined') || error.message.includes('Cannot read properties')) {
      console.warn('检测到undefined错误，清理localStorage');
      try {
        localStorage.removeItem('oldksports_auth_token');
        localStorage.removeItem('oldksports_user');
        localStorage.removeItem('access_token');
      } catch (e) {
        console.error('清理localStorage失败:', e);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️ 应用出现错误</div>
            <p className="mb-4">请刷新页面重试</p>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
