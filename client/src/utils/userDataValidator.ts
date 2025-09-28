// 用户数据验证工具 - 防止undefined错误
export const validateUserData = (user: any): boolean => {
  if (!user) return false;
  if (!user.id || !user.username) return false;
  if (user.username === 'undefined' || user.username === 'null' || user.username === '') return false;
  return true;
};

export const validateChatUser = (user: any): boolean => {
  if (!user) return false;
  if (!user.username) return false;
  if (user.username === 'undefined' || user.username === 'null' || user.username === '') return false;
  return true;
};

export const filterValidUsers = (users: any[]): any[] => {
  if (!Array.isArray(users)) return [];
  return users.filter(validateChatUser);
};

export const getSafeUser = (user: any): any | null => {
  if (!validateUserData(user)) return null;
  return user;
};

export const getSafeChatUser = (user: any): any | null => {
  if (!validateChatUser(user)) return null;
  return user;
};
