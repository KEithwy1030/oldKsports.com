import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, redirect to admin panel
  React.useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        // Check if the logged in user is admin
        const savedUser = localStorage.getItem('oldksports_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.isAdmin) {
            navigate('/admin');
          } else {
            setError('您没有管理员权限');
            // Logout non-admin user
            localStorage.removeItem('oldksports_user');
          }
        }
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">管理员登录</h2>
            <p className="text-gray-300">请输入管理员凭据以访问后台</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                  管理员账号
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                    placeholder="请输入管理员账号"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  管理员密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                    placeholder="请输入管理员密码"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '验证中...' : '登录管理后台'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-300 text-sm text-center">
                <Shield className="w-4 h-4 inline mr-1" />
                此页面仅限授权管理员访问
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminLoginPage;