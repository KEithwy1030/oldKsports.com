/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间为相对时间（如：2小时前、3天前）
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化的相对时间字符串
 */
export const formatTimeAgo = (timestamp: string | number | Date): string => {
  if (!timestamp) return '未知时间';
  
  let date: Date;
  
  // 处理不同的时间格式
  if (typeof timestamp === 'string') {
    // 如果是字符串，尝试解析
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    // 如果是数字，判断是秒还是毫秒
    date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
  } else {
    // 如果已经是Date对象
    date = timestamp;
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效时间';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // 如果时间在未来，显示"刚刚"
  if (diffInSeconds < 0) {
    return '刚刚';
  }
  
  // 小于1分钟
  if (diffInSeconds < 60) {
    return '刚刚';
  }
  
  // 小于1小时
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }
  
  // 小于1天
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }
  
  // 小于1个月
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }
  
  // 小于1年
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }
  
  // 超过1年
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
};

/**
 * 格式化时间为标准格式（如：2024-01-15 14:30:25）
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化的标准时间字符串
 */
export const formatDateTime = (timestamp: string | number | Date): string => {
  if (!timestamp) return '未知时间';
  
  let date: Date;
  
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
  } else {
    date = timestamp;
  }
  
  if (isNaN(date.getTime())) {
    return '无效时间';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 格式化时间为简短格式（如：01-15 14:30）
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化的简短时间字符串
 */
export const formatShortTime = (timestamp: string | number | Date): string => {
  if (!timestamp) return '未知时间';
  
  let date: Date;
  
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
  } else {
    date = timestamp;
  }
  
  if (isNaN(date.getTime())) {
    return '无效时间';
  }
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}-${day} ${hours}:${minutes}`;
};

/**
 * 获取时间戳（毫秒）
 * @param timestamp 时间戳或日期字符串
 * @returns 毫秒时间戳
 */
export const getTimestamp = (timestamp: string | number | Date): number => {
  if (!timestamp) return 0;
  
  let date: Date;
  
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
  } else {
    date = timestamp;
  }
  
  if (isNaN(date.getTime())) {
    return 0;
  }
  
  return date.getTime();
};
