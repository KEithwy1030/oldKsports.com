import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

const ArticleSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('文章投稿成功！我们将在3个工作日内完成审核。');
      navigate('/articles');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FileText className="w-8 h-8 text-emerald-600 mr-3" />
            投稿文章
          </h1>
          <p className="text-gray-300 mt-2">分享您的专业见解和行业经验</p>
        </div>

        {/* Submission Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                文章标题 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400"
                placeholder="请输入文章标题"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-white mb-2">
                文章摘要 *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400"
                placeholder="请输入文章摘要（100-200字）"
              />
            </div>

            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-white mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                封面图片链接
              </label>
              <input
                type="url"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400"
                placeholder="请输入图片链接（可选）"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                文章内容 *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="请输入文章内容（不少于800字）"
                rows={15}
              />
              <p className="text-sm text-gray-400 mt-2">
                当前字数：{formData.content.length} / 最少800字
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <div className="text-sm text-gray-300">
                投稿人：<span className="font-medium text-white">{user?.username}</span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/articles')}
                  className="px-6 py-2 border border-white/30 text-gray-300 rounded-md hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.content.length < 800}
                  className="inline-flex items-center bg-emerald-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? '提交中...' : '提交投稿'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">投稿须知</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-200">
            <div>
              <h4 className="font-medium mb-2 text-white">内容标准</h4>
              <ul className="space-y-1">
                <li>• 必须为原创内容</li>
                <li>• 与体育自媒体相关</li>
                <li>• 内容专业且有价值</li>
                <li>• 语言表达清晰准确</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-white">审核说明</h4>
              <ul className="space-y-1">
                <li>• 3个工作日内完成审核</li>
                <li>• 审核通过获得50积分</li>
                <li>• 未通过会说明具体原因</li>
                <li>• 可根据建议修改后重新投稿</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSubmissionPage;