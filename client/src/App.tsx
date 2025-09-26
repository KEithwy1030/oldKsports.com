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
import { initUserHoverAutobind } from './components/UserHoverCard';

function App() {
  // 兜底自动绑定：让任意带 data-username/data-user 的元素都能触发用户卡片
  try { initUserHoverAutobind(); } catch {}
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;