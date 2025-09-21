// Custom hook for reactive auth state management
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check if auth state is initialized
    setIsInitialized(true);
  }, []);
  
  return {
    ...context,
    isInitialized,
    // Reactive state helpers
    hasUser: !!context.user,
    isAdmin: context.user?.isAdmin || false,
    hasAvatar: !!context.user?.avatar,
    hasPoints: context.user?.points !== undefined,
    hasLevel: !!context.user?.level,
    username: context.user?.username || '',
    email: context.user?.email || '',
    points: context.user?.points || 0,
    level: context.user?.level || null,
    avatar: context.user?.avatar || null,
    joinDate: context.user?.joinDate || null,
    lastLogin: context.user?.lastLogin || null
  };
};

// Custom hook for real-time user data updates
export const useUserData = (userId) => {
  const { user, getProfile } = useAuthState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshUserData = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      await getProfile();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return {
    user,
    isRefreshing,
    refreshUserData,
    // Auto-refresh when dependencies change
    needsRefresh: !user || user.id !== userId
  };
};

// Custom hook for reactive points updates
export const usePoints = () => {
  const { user, updateUserPoints } = useAuthState();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updatePoints = async (newPoints) => {
    if (!user) return null;
    
    setIsUpdating(true);
    try {
      const result = await updateUserPoints(newPoints);
      return result;
    } catch (error) {
      console.error('Failed to update points:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    user,
    currentPoints: user?.points || 0,
    isUpdating,
    updatePoints
  };
};

// Custom hook for reactive profile updates
export const useProfile = () => {
  const { user, updateUser } = useAuthState();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateProfile = async (profileData) => {
    if (!user) return null;
    
    setIsUpdating(true);
    try {
      const result = await updateUser(profileData);
      return result;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    user,
    isUpdating,
    updateProfile
  };
};