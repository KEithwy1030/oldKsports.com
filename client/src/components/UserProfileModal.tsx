import React from 'react';
import { X } from 'lucide-react';
import { User } from '../types';
import SimpleUserProfileCard from './SimpleUserProfileCard';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">用户资料</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <SimpleUserProfileCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;