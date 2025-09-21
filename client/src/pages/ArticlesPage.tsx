import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, User, Eye } from 'lucide-react';
import { mockArticles } from '../data/mockData';
import UserLevelBadge from '../components/UserLevelBadge';
import PageTransition from '../components/PageTransition';

const ArticlesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'published'>('published');
  
  const filteredArticles = mockArticles.filter(article => 
    filter === 'all' || article.status === filter
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-radial from-slate-700 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 stagger-children">
            <div style={{ '--stagger-delay': '1' } as React.CSSProperties}>
              <h1 className="text-3xl font-bold text-white">精选文章</h1>
              <p className="text-gray-300 mt-2">深度文章和行业洞察</p>
            </div>
            <Link
              to="/articles/submit"
              className="mt-4 sm:mt-0 inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
              style={{ '--stagger-delay': '2' } as React.CSSProperties}
            >
              <Plus className="w-5 h-5 mr-2" />
              投稿文章
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm p-1 rounded-lg w-fit border border-white/20" style={{ '--stagger-delay': '3' } as React.CSSProperties}>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              已发布
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              全部状态
            </button>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {filteredArticles.map((article, index) => (
              <article
                key={article.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-emerald-400 transition-all duration-300"
                style={{ '--stagger-delay': `${4 + index}` } as React.CSSProperties}
              >
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-500/20 text-green-300'
                        : article.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {article.status === 'published' ? '已发布' : 
                       article.status === 'pending' ? '待审核' : '草稿'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 hover:text-emerald-400 transition-colors cursor-pointer">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-200">{article.author.username}</span>
                      <UserLevelBadge level={article.author.level} />
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : 
                         new Date(article.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">暂无文章</h3>
              <p className="text-gray-300 mb-6">还没有发布的文章，快来投稿吧！</p>
              <Link
                to="/articles/submit"
                className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                投稿文章
              </Link>
            </div>
          )}

          {/* Submission Guidelines */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8" style={{ '--stagger-delay': '6' } as React.CSSProperties}>
            <h2 className="text-xl font-semibold text-white mb-4">投稿指南</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold mb-2 text-white">内容要求</h3>
                <ul className="space-y-1">
                  <li>• 原创内容，禁止抄袭</li>
                  <li>• 与体育自媒体行业相关</li>
                  <li>• 字数不少于800字</li>
                  <li>• 内容积极向上，有建设性</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-white">审核流程</h3>
                <ul className="space-y-1">
                  <li>• 提交后进入待审核状态</li>
                  <li>• 管理员将在3个工作日内审核</li>
                  <li>• 审核通过后正式发布</li>
                  <li>• 发布成功获得50积分奖励</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ArticlesPage;