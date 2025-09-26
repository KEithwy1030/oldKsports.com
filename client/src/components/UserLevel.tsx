import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { getUserLevel } from '../utils/userUtils';
import { UserLevel } from '../types';

interface UserLevelProps {
  username: string;
  className?: string;
}

const UserLevelComponent: React.FC<UserLevelProps> = ({ username, className = '' }) => {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserLevel = async () => {
      setIsLoading(true);
      setError(false);
      try {
        console.log(`Fetching user info for: ${username}`);
        const response = await userAPI.getUserInfo(username);
        console.log(`User info response for ${username}:`, response);
        if (response.success) {
          const level = getUserLevel(response.user.points);
          console.log(`Calculated level for ${username} (${response.user.points} points):`, level);
          setUserLevel(level);
        } else {
          console.error(`Failed to get user info for ${username}:`, response);
          setError(true);
        }
      } catch (err) {
        console.error(`Failed to fetch user level for ${username}:`, err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLevel();
  }, [username]);

  if (isLoading) {
    return (
      <span className={`inline-flex items-center whitespace-nowrap leading-none px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-gray-600/20 text-gray-400 border border-gray-500/20 ${className}`}>
        加载中...
      </span>
    );
  }

  if (error || !userLevel) {
    return (
      <span className={`inline-flex items-center whitespace-nowrap leading-none px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-gray-600/20 text-gray-400 border border-gray-500/20 ${className}`}>
        未知等级
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center whitespace-nowrap leading-none px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium border shadow-sm ${className}`}
      style={{ 
        backgroundColor: `${userLevel.color}20`,
        borderColor: `${userLevel.color}40`,
        color: userLevel.color
      }}
    >
      {userLevel.name}
    </span>
  );
};

export default UserLevelComponent;
