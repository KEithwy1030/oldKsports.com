// src/pages/BlacklistManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  EyeOff,
  FileText,
  User
} from 'lucide-react';
import BrowserCompatibleModal from '../components/BrowserCompatibleModal';

interface BlacklistEntry {
  id: number;
  merchant_name: string;
  violation_type: string;
  description: string;
  evidence_urls?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'verified' | 'resolved' | 'dismissed';
  created_by: number;
  verified_by?: number;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  verifier_username?: string;
}

interface BlacklistFormData {
  merchant_name: string;
  violation_type: string;
  description: string;
  evidence_urls: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const BlacklistManagement: React.FC = () => {
  const { user } = useAuth();
  const [blacklistEntries, setBlacklistEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 检测浏览器类型
  const isSogouBrowser = React.useMemo(() => {
    return navigator.userAgent.includes('MetaSr') || navigator.userAgent.includes('Sogou');
  }, []);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState<BlacklistFormData>({
    merchant_name: '',
    violation_type: '',
    description: '',
    evidence_urls: '',
    severity: 'medium'
  });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchBlacklistEntries();
    }
  }, [user]);

  const fetchBlacklistEntries = async () => {
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/blacklist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlacklistEntries(data.data);
        }
      }
    } catch (error) {
      console.error('获取黑榜列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowAddModal(false);
          setFormData({
            merchant_name: '',
            violation_type: '',
            description: '',
            evidence_urls: '',
            severity: 'medium'
          });
          fetchBlacklistEntries();
        }
      }
    } catch (error) {
      console.error('添加黑榜记录失败:', error);
    }
  };

  const handleEditEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/blacklist/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowEditModal(false);
          setEditingEntry(null);
          fetchBlacklistEntries();
        }
      }
    } catch (error) {
      console.error('更新黑榜记录失败:', error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('确定要删除这个黑榜记录吗？')) return;

    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/blacklist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchBlacklistEntries();
        }
      }
    } catch (error) {
      console.error('删除黑榜记录失败:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/blacklist/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchBlacklistEntries();
        }
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const openEditModal = (entry: BlacklistEntry) => {
    setEditingEntry(entry);
    setFormData({
      merchant_name: entry.merchant_name,
      violation_type: entry.violation_type,
      description: entry.description,
      evidence_urls: entry.evidence_urls || '',
      severity: entry.severity
    });
    setShowEditModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return '轻微';
      case 'medium': return '中等';
      case 'high': return '严重';
      case 'critical': return '严重';
      default: return severity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'verified': return 'text-red-400 bg-red-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      case 'dismissed': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'verified': return '已确认';
      case 'resolved': return '已解决';
      case 'dismissed': return '已驳回';
      default: return status;
    }
  };

  const filteredEntries = blacklistEntries.filter(entry => {
    const matchesSearch = entry.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.violation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || entry.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">访问被拒绝</h1>
          <p className="text-gray-400">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">曝光黑榜管理</h1>
          <p className="text-gray-400">管理不良商家黑榜，维护行业健康发展</p>
        </div>

        {/* 警告提示 */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">重要提醒</h3>
              <p className="text-gray-300 text-sm">
                以下信息仅供参考，具体情况请自行核实。黑榜记录将影响商家信誉，请谨慎操作。
              </p>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索商家名称、违规类型或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 w-full sm:w-64"
                />
              </div>

              {/* 严重程度筛选 */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">所有严重程度</option>
                <option value="low">轻微</option>
                <option value="medium">中等</option>
                <option value="high">严重</option>
                <option value="critical">严重</option>
              </select>

              {/* 状态筛选 */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">所有状态</option>
                <option value="pending">待审核</option>
                <option value="verified">已确认</option>
                <option value="resolved">已解决</option>
                <option value="dismissed">已驳回</option>
              </select>
            </div>

            {/* 添加记录按钮 */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加黑榜记录
            </button>
          </div>
        </div>

        {/* 黑榜记录列表 */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{entry.merchant_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(entry.severity)}`}>
                        {getSeverityLabel(entry.severity)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                        {getStatusLabel(entry.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">违规类型</h4>
                  <p className="text-white">{entry.violation_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">创建时间</h4>
                  <p className="text-gray-400">{new Date(entry.created_at).toLocaleString('zh-CN')}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">违规描述</h4>
                <p className="text-gray-300">{entry.description}</p>
              </div>

              {entry.evidence_urls && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">证据链接</h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.evidence_urls.split(',').map((url, index) => (
                      <a
                        key={index}
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        证据 {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>创建者: {entry.creator_username || '未知'}</span>
                  </div>
                  {entry.verifier_username && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>审核者: {entry.verifier_username}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {entry.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(entry.id, 'verified')}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        确认
                      </button>
                      <button
                        onClick={() => handleStatusChange(entry.id, 'dismissed')}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        驳回
                      </button>
                    </>
                  )}
                  {entry.status === 'verified' && (
                    <button
                      onClick={() => handleStatusChange(entry.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      标记为已解决
                    </button>
                  )}
                  {entry.status === 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(entry.id, 'verified')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm flex items-center gap-1"
                    >
                      <Clock className="w-4 h-4" />
                      重新激活
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无黑榜记录</h3>
            <p className="text-gray-500">没有找到符合条件的黑榜记录</p>
          </div>
        )}
      </div>

      {/* 添加黑榜记录模态框 */}
      <BrowserCompatibleModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        isSogouBrowser={isSogouBrowser}
      >
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-4">添加黑榜记录</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">商家名称</label>
                <input
                  type="text"
                  required
                  value={formData.merchant_name}
                  onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">违规类型</label>
                <input
                  type="text"
                  required
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">违规描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">严重程度</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="low">轻微</option>
                  <option value="medium">中等</option>
                  <option value="high">严重</option>
                  <option value="critical">严重</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">证据链接 (用逗号分隔多个链接)</label>
                <textarea
                  value={formData.evidence_urls}
                  onChange={(e) => setFormData({ ...formData, evidence_urls: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 h-16"
                  placeholder="https://example.com/evidence1, https://example.com/evidence2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      </BrowserCompatibleModal>

      {/* 编辑黑榜记录模态框 */}
      <BrowserCompatibleModal 
        isOpen={showEditModal && !!editingEntry} 
        onClose={() => setShowEditModal(false)}
        isSogouBrowser={isSogouBrowser}
      >
        {editingEntry && (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-4">编辑黑榜记录</h2>
            <form onSubmit={handleEditEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">商家名称</label>
                <input
                  type="text"
                  required
                  value={formData.merchant_name}
                  onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">违规类型</label>
                <input
                  type="text"
                  required
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">违规描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">严重程度</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="low">轻微</option>
                  <option value="medium">中等</option>
                  <option value="high">严重</option>
                  <option value="critical">严重</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">证据链接 (用逗号分隔多个链接)</label>
                <textarea
                  value={formData.evidence_urls}
                  onChange={(e) => setFormData({ ...formData, evidence_urls: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 h-16"
                  placeholder="https://example.com/evidence1, https://example.com/evidence2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </BrowserCompatibleModal>
    </div>
  );
};

export default BlacklistManagement;
