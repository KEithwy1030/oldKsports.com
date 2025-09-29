// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import UserLevelSync from './components/UserLevelSync';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ForumPage from './pages/ForumPage';
import ForumSubsectionPage from './pages/ForumSubsectionPage';
import PostDetailPage from './pages/PostDetailPage';
import NewPostPage from './pages/NewPostPage';
import UserProfile from './pages/UserProfile';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import MerchantManagement from './pages/MerchantManagement';
import BlacklistManagement from './pages/BlacklistManagement';
import AdminLoginPage from './pages/AdminLoginPage';
import MerchantsPage from './pages/MerchantsPage';
import BlacklistPage from './pages/BlacklistPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleSubmissionPage from './pages/ArticleSubmissionPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatWidget from './components/ChatWidget';
import ChatHandlerSetup from './components/ChatHandlerSetup';
import EmergencyGuard from './components/EmergencyGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { initUserHoverAutobind } from './components/UserHoverCard';

function App() {
  // 兜底自动绑定：让任意带 data-username/data-user 的元素都能触发用户卡片
  try { initUserHoverAutobind(); } catch {}
  // 全局兜底：将任何指向旧域名(zeabur.app)且路径为 /uploads/images 的图片地址改写为当前域名
  // 防止由于缓存或旧构建导致的图片 404
  try {
    // 仅在浏览器环境
    if (typeof window !== 'undefined') {
      const rewriteOnce = () => {
        const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
        imgs.forEach(img => {
          const raw = img.getAttribute('src') || '';
          if (!raw) return;
          try {
            const u = new URL(raw, window.location.origin);
            if (/zeabur\.app$/i.test(u.hostname) && u.pathname.startsWith('/uploads/images/')) {
              img.src = `${window.location.origin}${u.pathname}`;
            }
          } catch {}
        });
      };
      // 立即执行一次，并在前几秒内重复数次以覆盖懒加载
      rewriteOnce();
      let count = 0;
      const timer = window.setInterval(() => {
        rewriteOnce();
        if (++count > 5) window.clearInterval(timer);
      }, 1500);
    }
  } catch {}
  return (
    <ErrorBoundary>
      <AuthProvider>
        <EmergencyGuard>
          <ChatProvider>
            <ChatHandlerSetup />
            <UserLevelSync />
            <Router>
            <div className="min-h-screen">
              <Navigation />
              <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
            <Route path="/forum/:subsection" element={<ProtectedRoute><ForumSubsectionPage /></ProtectedRoute>} />
            <Route path="/forum/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
            <Route path="/forum/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/merchants" element={<ProtectedRoute adminOnly={true}><MerchantManagement /></ProtectedRoute>} />
        <Route path="/admin/blacklist" element={<ProtectedRoute adminOnly={true}><BlacklistManagement /></ProtectedRoute>} />
            <Route path="/merchants" element={<ProtectedRoute><MerchantsPage /></ProtectedRoute>} />
            <Route path="/blacklist" element={<ProtectedRoute><BlacklistPage /></ProtectedRoute>} />
            <Route path="/articles" element={<ProtectedRoute><ArticlesPage /></ProtectedRoute>} />
            <Route path="/articles/submit" element={<ProtectedRoute><ArticleSubmissionPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* 全局聊天组件 */}
          <ChatWidget />
        </div>
      </Router>
          </ChatProvider>
        </EmergencyGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;