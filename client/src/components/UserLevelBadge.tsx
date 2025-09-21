import React from 'react';
import { UserLevel } from '../types';

interface UserLevelBadgeProps {
  level: UserLevel;
  className?: string;
}

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({ level, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ 
        backgroundColor: `${level.color}20`, 
        color: level.color,
        border: `1px solid ${level.color}40`
      }}
    >
      {level.name}
    </span>
  );
};

export default UserLevelBadge;