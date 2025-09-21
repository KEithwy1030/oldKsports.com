import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { INDUSTRY_ROLES } from '../data/constants';

interface RoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  className?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRoles, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleRole = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    onChange(newRoles);
  };

  const getDisplayText = () => {
    if (selectedRoles.length === 0) {
      return '请选择您的行业身份（可多选）';
    }
    const roleNames = selectedRoles.map(id => 
      INDUSTRY_ROLES.find(role => role.id === id)?.label
    ).filter(Boolean);
    return roleNames.join('、');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-left flex items-center justify-between"
      >
        <span className={selectedRoles.length === 0 ? 'text-gray-400' : 'text-white'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-white/30 rounded-md shadow-lg z-10">
          <div className="py-2">
            {INDUSTRY_ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <div className="text-white font-medium">{role.label}</div>
                {selectedRoles.includes(role.id) && (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;