// src/pages/MerchantManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Star,
  Globe,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import BrowserCompatibleModal from '../components/BrowserCompatibleModal';

interface Merchant {
  id: number;
  name: string;
  description: string;
  category: 'gold' | 'advertiser' | 'streamer';
  contact_info: string;
  website: string;
  logo_url?: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface MerchantFormData {
  name: string;
  description: string;
  category: 'gold' | 'advertiser' | 'streamer';
  contact_info: string;
  website: string;
  logo_url: string;
}

const MerchantManagement: React.FC = () => {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 检测浏览器类型
  const isSogouBrowser = React.useMemo(() => {
    return navigator.userAgent.includes('MetaSr') || navigator.userAgent.includes('Sogou');
  }, []);

  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    description: '',
    category: 'gold',
    contact_info: '',
    website: '',
    logo_url: ''
  });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchMerchants();
    }
  }, [user]);

  const fetchMerchants = async () => {
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/merchants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMerchants(data.data);
        }
      }
    } catch (error) {
      console.error('获取商家列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/merchants`, {
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
            name: '',
            description: '',
            category: 'gold',
            contact_info: '',
            website: '',
            logo_url: ''
          });
          fetchMerchants();
        }
      }
    } catch (error) {
      console.error('添加商家失败:', error);
    }
  };

  const handleEditMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant) return;

    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/merchants/${editingMerchant.id}`, {
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
          setEditingMerchant(null);
          fetchMerchants();
        }
      }
    } catch (error) {
      console.error('更新商家失败:', error);
    }
  };

  const handleDeleteMerchant = async (id: number) => {
    if (!confirm('确定要删除这个商家吗？')) return;

    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/merchants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchMerchants();
        }
      }
    } catch (error) {
      console.error('删除商家失败:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('oldksports_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/merchants/${id}/status`, {
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
          fetchMerchants();
        }
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const openEditModal = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setFormData({
      name: merchant.name,
      description: merchant.description,
      category: merchant.category,
      contact_info: merchant.contact_info,
      website: merchant.website,
      logo_url: merchant.logo_url || ''
    });
    setShowEditModal(true);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'gold': return '金牌商家';
      case 'advertiser': return '诚信甲方';
      case 'streamer': return '靠谱主播';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'inactive': return 'text-red-400 bg-red-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '已激活';
      case 'inactive': return '已停用';
      case 'pending': return '待审核';
      default: return status;
    }
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || merchant.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || merchant.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">优秀商家管理</h1>
          <p className="text-gray-400">管理平台上的优质商家和合作伙伴</p>
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
                  placeholder="搜索商家名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* 分类筛选 */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">所有分类</option>
                <option value="gold">金牌商家</option>
                <option value="advertiser">诚信甲方</option>
                <option value="streamer">靠谱主播</option>
              </select>

              {/* 状态筛选 */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">所有状态</option>
                <option value="active">已激活</option>
                <option value="pending">待审核</option>
                <option value="inactive">已停用</option>
              </select>
            </div>

            {/* 添加商家按钮 */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加商家
            </button>
          </div>
        </div>

        {/* 商家列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => (
            <div key={merchant.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {merchant.logo_url ? (
                    <img
                      src={merchant.logo_url}
                      alt={merchant.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{merchant.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(merchant.status)}`}>
                      {getStatusLabel(merchant.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(merchant)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMerchant(merchant.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{merchant.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>{getCategoryLabel(merchant.category)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>评分: {merchant.rating}/5.0</span>
                </div>
                {merchant.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Globe className="w-4 h-4" />
                    <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                      访问网站
                    </a>
                  </div>
                )}
                {merchant.contact_info && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{merchant.contact_info}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {merchant.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(merchant.id, 'active')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      通过
                    </button>
                    <button
                      onClick={() => handleStatusChange(merchant.id, 'inactive')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝
                    </button>
                  </>
                )}
                {merchant.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(merchant.id, 'inactive')}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Clock className="w-4 h-4" />
                    停用
                  </button>
                )}
                {merchant.status === 'inactive' && (
                  <button
                    onClick={() => handleStatusChange(merchant.id, 'active')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    激活
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMerchants.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无商家</h3>
            <p className="text-gray-500">没有找到符合条件的商家</p>
          </div>
        )}
      </div>

      {/* 添加商家模态框 */}
      <BrowserCompatibleModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        isSogouBrowser={isSogouBrowser}
      >
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-4">添加商家</h2>
            <form onSubmit={handleAddMerchant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">商家名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="gold">金牌商家</option>
                  <option value="advertiser">诚信甲方</option>
                  <option value="streamer">靠谱主播</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">联系信息</label>
                <input
                  type="text"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">网站</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      </BrowserCompatibleModal>

      {/* 编辑商家模态框 */}
      <BrowserCompatibleModal 
        isOpen={showEditModal && !!editingMerchant} 
        onClose={() => setShowEditModal(false)}
        isSogouBrowser={isSogouBrowser}
      >
        {editingMerchant && (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-4">编辑商家</h2>
            <form onSubmit={handleEditMerchant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">商家名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">描述</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="gold">金牌商家</option>
                  <option value="advertiser">诚信甲方</option>
                  <option value="streamer">靠谱主播</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">联系信息</label>
                <input
                  type="text"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">网站</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

export default MerchantManagement;
