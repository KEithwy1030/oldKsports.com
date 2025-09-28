import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { showUserCard, hideUserCard, softHideUserCard } from './UserHoverCard';

interface UserAvatarProps {
  username: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  username, 
  className = '', 
  fallbackClassName = '',
  size = 'md'
}) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      console.log('🖼️ UserAvatar fetchAvatar被调用:', {
        username,
        usernameType: typeof username,
        usernameLength: username ? username.length : 0
      });
      
      // 检查username是否有效
      if (!username || username === 'undefined' || username === 'null' || username === '' || username === 'unknown') {
        console.warn('🖼️ UserAvatar: 无效的用户名:', username);
        setError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(false);
        
        console.log('UserAvatar: 获取头像:', username);
        const response = await userAPI.getAvatar(username);
        if (response.success) {
          setAvatar(response.avatar);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch avatar for', username, err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, [username]);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-600/20 rounded-full flex items-center justify-center border border-gray-500/30 ${className}`}>
        <div className="animate-pulse bg-gray-400 rounded-full w-3/4 h-3/4"></div>
      </div>
    );
  }

  if (avatar && !error) {
    return (
      <div
        className={`relative inline-block ${className}`}
        style={{ lineHeight: 0 }}
        data-username={username}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          showUserCard(username, rect);
        }}
        role="button"
        tabIndex={0}
        className="focus:outline-none outline-none ring-0 focus:ring-0"
      >
        <img
          src={avatar}
          alt={username}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/20`}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Fallback to initial letter
  return (
    <div
      className={`relative inline-flex items-center justify-center ${fallbackClassName}`}
      style={{ lineHeight: 0 }}
      data-username={username}
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        showUserCard(username, rect);
      }}
    >
      <div className={`${sizeClasses[size]} bg-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/30`}>
        <span className="text-emerald-400 font-bold">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default UserAvatar;
