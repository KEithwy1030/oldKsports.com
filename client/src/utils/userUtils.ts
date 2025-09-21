import { USER_LEVELS } from '../data/constants';
import { UserLevel } from '../types';

export const getUserLevel = (points: number): UserLevel => {
  const level = USER_LEVELS
    .slice()
    .reverse()
    .find(level => points >= level.minPoints);
  return level || USER_LEVELS[0];
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getPointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = getUserLevel(currentPoints);
  const nextLevelIndex = USER_LEVELS.findIndex(level => level.id === currentLevel.id) + 1;
  
  if (nextLevelIndex >= USER_LEVELS.length) {
    return 0; // Already at max level
  }
  
  return USER_LEVELS[nextLevelIndex].minPoints - currentPoints;
};

// 格式化时间为相对时间（如"7分钟前"）
export const formatTimeAgo = (timestamp: Date | string): string => {
  // 检查输入是否有效
  if (!timestamp) return '未知时间';
  
  const now = new Date();
  const postTime = new Date(timestamp);
  
  // 检查日期是否有效
  if (isNaN(postTime.getTime())) {
    console.warn('Invalid timestamp received:', timestamp);
    return '时间格式错误';
  }
  
  const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '刚刚';
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小时前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}天前`;
  return postTime.toLocaleDateString('zh-CN');
};