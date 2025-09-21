import { User, ForumPost, Article, Merchant } from '../types';
import { getUserLevel } from '../utils/userUtils';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'oldk',
    email: '552319164@qq.com',
    points: 9999,
    level: getUserLevel(9999),
    joinDate: new Date('2024-01-01'),
    lastLogin: new Date(),
    isAdmin: true,
    roles: ['client', 'service_provider', 'streamer'],
    avatar: 'https://ui-avatars.com/api/?name=oldk&background=0d9488&color=fff&size=200',
    hasUploadedAvatar: false,
  },
  {
    id: 2,
    username: '体育老王',
    email: 'wang@example.com',
    points: 1200,
    level: getUserLevel(1200),
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date(),
    isAdmin: true,
    roles: ['client', 'service_provider'],
    avatar: 'https://ui-avatars.com/api/?name=体育老王&background=3b82f6&color=fff&size=200',
    hasUploadedAvatar: false,
  },
  {
    id: 2,
    username: '足球解说李',
    email: 'li@example.com',
    points: 350,
    level: getUserLevel(350),
    joinDate: new Date('2024-02-20'),
    lastLogin: new Date(),
    isAdmin: false,
    roles: ['streamer'],
    avatar: 'https://ui-avatars.com/api/?name=足球解说李&background=ef4444&color=fff&size=200',
    hasUploadedAvatar: false,
  },
];

export const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: '新手主播如何快速起号？分享一些实用经验',
    content: '最近有很多新入行的朋友问起如何快速起号，结合我自己的经验，给大家分享几点：首先内容定位要清晰，其次要保持稳定的更新频率，最后是要积极与粉丝互动...',
    author: mockUsers[2], // 足球解说李
    category: 'general',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replies: [],
    views: 156,
    lastReplyAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 15,
    likedBy: []
  },
  {
    id: '2',
    title: '寻找靠谱的体育内容制作团队，长期合作',
    content: '我们是MCN机构，正在寻找有经验的体育内容制作团队合作。要求：熟悉体育赛事，有短视频制作经验，能提供稳定的优质内容。有意者请联系。',
    author: mockUsers[1], // 体育老王
    category: 'business',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    replies: [],
    views: 89,
    lastReplyAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 8,
    likedBy: []
  },
  {
    id: '3',
    title: '曝光：某公司拖欠主播薪资，大家注意避坑',
    content: '这家公司表面看起来很正规，但实际合作后会以各种理由拖欠薪资。我已经被拖欠了3个月工资，联系客服也总是推脱。希望其他同行注意避免上当受骗。',
    author: mockUsers[0], // oldk
    category: 'news', // 黑榜曝光
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    replies: [],
    views: 312,
    lastReplyAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: 45,
    likedBy: [],
    isPinned: true
  }
];

export const mockArticles: Article[] = [
  // 文章已清空
];

export const mockMerchants: Merchant[] = [
  // 商家信息已清空，等待管理员添加
];