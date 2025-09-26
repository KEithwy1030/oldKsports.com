import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Shield,
  BarChart3,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalReplies: number;
  onlineUsers: number;
  todayPosts: number;
  todayReplies: number;
  userGrowth: number;
  postGrowth: number;
}

interface SystemStatus {
  server: {
    status: string;
    message: string;
  };
  database: {
    status: string;
    message: string;
  };
  storage: {
    status: string;
    usage: number;
    message: string;
  };
}

interface RecentActivity {
  id: number;
  type: 'post' | 'reply' | 'user';
  content: string;
  user: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalReplies: 0,
    onlineUsers: 0,
    todayPosts: 0,
    todayReplies: 0,
    userGrowth: 0,
    postGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 获取统计数据
      const statsResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/dashboard/stats`, {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats({
            totalUsers: statsData.data.totalUsers,
            totalPosts: statsData.data.totalPosts,
            totalReplies: statsData.data.totalReplies,
            onlineUsers: statsData.data.onlineUsers,
            todayPosts: statsData.data.todayPosts,
            todayReplies: statsData.data.todayReplies,
            userGrowth: statsData.data.userGrowth.length > 0 ? 
              ((statsData.data.userGrowth[0]?.count || 0) / Math.max(1, statsData.data.totalUsers)) * 100 : 0,
            postGrowth: statsData.data.postGrowth.length > 0 ? 
              ((statsData.data.postGrowth[0]?.count || 0) / Math.max(1, statsData.data.totalPosts)) * 100 : 0
          });
        }
      }

      // 获取最近活动
      const activityResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/dashboard/activity`, {
        credentials: 'include'
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.data.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp).toLocaleString('zh-CN')
          })));
        }
      }

      // 获取系统状态
      const systemResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/system/status`, {
        credentials: 'include'
      });
      
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        if (systemData.success) {
          setSystemStatus(systemData.data);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      // 不再使用模拟数据，直接提示加载失败，保持显示真实状态
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">访问被拒绝</h1>
          <p className="text-gray-400">您没有权限访问管理员面板</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 头部 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">管理员控制台</h1>
              <p className="text-gray-400 mt-1">欢迎回来，{user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">当前时间</p>
                <p className="text-white font-mono">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">总用户数</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-green-400">+{stats.userGrowth}% 本月</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">总帖子数</p>
                <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
                <p className="text-xs text-green-400">+{stats.postGrowth}% 本月</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">总回复数</p>
                <p className="text-2xl font-bold text-white">{stats.totalReplies}</p>
                <p className="text-xs text-blue-400">今日 +{stats.todayReplies}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">在线用户</p>
                <p className="text-2xl font-bold text-white">{stats.onlineUsers}</p>
                <p className="text-xs text-orange-400">实时更新</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最近活动 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  最近活动
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'post' ? 'bg-green-500' :
                        activity.type === 'reply' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {activity.type === 'post' && <FileText className="w-4 h-4 text-white" />}
                        {activity.type === 'reply' && <MessageSquare className="w-4 h-4 text-white" />}
                        {activity.type === 'user' && <Users className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{activity.content}</p>
                        <p className="text-sm text-gray-400">
                          {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  快速操作
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link to="/admin/merchants" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    商家管理
                  </Link>
                  <Link to="/admin/blacklist" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    黑榜管理
                  </Link>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    帖子管理
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    数据统计
                  </button>
                </div>
              </div>
            </div>

            {/* 系统状态 */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 mt-6">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  系统状态
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">服务器状态</span>
                    <span className={`flex items-center ${
                      systemStatus?.server.status === 'normal' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        systemStatus?.server.status === 'normal' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {systemStatus?.server.status === 'normal' ? '正常' : '异常'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">数据库连接</span>
                    <span className={`flex items-center ${
                      systemStatus?.database.status === 'normal' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        systemStatus?.database.status === 'normal' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {systemStatus?.database.status === 'normal' ? '正常' : '异常'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">存储空间</span>
                    <span className={`${
                      (systemStatus?.storage.usage || 0) < 80 ? 'text-green-400' : 
                      (systemStatus?.storage.usage || 0) < 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemStatus?.storage.usage || 0}% 使用
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
