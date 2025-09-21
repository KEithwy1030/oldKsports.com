import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  category: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

interface UserContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'replies'>) => void;
  likePost: (postId: string) => void;
  deletePost: (postId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: '欢迎来到老K体育论坛！',
      content: '这里是体育爱好者的聚集地，大家可以在这里讨论各种体育话题，分享观赛心得。',
      author: 'Admin',
      authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: '公告',
      timestamp: '2024-01-15T10:00:00Z',
      likes: 25,
      replies: 8
    },
    {
      id: '2',
      title: '今晚NBA湖人vs勇士，大家怎么看？',
      content: '两支强队的对决，詹姆斯对阵库里，应该会很精彩！',
      author: 'SportsFan',
      authorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: 'NBA',
      timestamp: '2024-01-15T14:30:00Z',
      likes: 12,
      replies: 15
    },
    {
      id: '3',
      title: '足球世界杯回顾：最难忘的瞬间',
      content: '分享一下大家心中最难忘的世界杯瞬间，我先来：2018年法国夺冠！',
      author: 'FootballLover',
      authorAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      category: '足球',
      timestamp: '2024-01-14T20:15:00Z',
      likes: 18,
      replies: 22
    }
  ]);

  const addPost = (newPost: Omit<Post, 'id' | 'timestamp' | 'likes' | 'replies'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: 0
    };
    setPosts(prev => [post, ...prev]);
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const value: UserContextType = {
    posts,
    addPost,
    likePost,
    deletePost
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};