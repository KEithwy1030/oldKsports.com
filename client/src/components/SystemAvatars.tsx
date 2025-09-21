import React from 'react';

// 老板头像 - 诚信甲方
export const BossAvatar: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30`}>
    <svg viewBox="0 0 64 64" className="w-12 h-12 text-blue-400">
      {/* 头部 - 更方正，体现威严 */}
      <rect x="22" y="16" width="20" height="16" rx="8" fill="currentColor" opacity="0.8"/>
      
      {/* 身体 - 宽肩西装 */}
      <path d="M16 36 L48 36 L48 54 L16 54 Z" fill="currentColor" opacity="0.6"/>
      
      {/* 宽肩膀 */}
      <rect x="14" y="32" width="36" height="8" fill="currentColor" opacity="0.7"/>
      
      {/* 领带 - 更宽大 */}
      <path d="M28 36 L36 36 L32 50 L28 50 Z" fill="currentColor" opacity="0.9"/>
      
      {/* 眼镜 - 方形商务眼镜 */}
      <rect x="26" y="18" width="6" height="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
      <rect x="32" y="18" width="6" height="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
      <line x1="32" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
      
      {/* 小胡子 */}
      <path d="M28 26 Q32 28 36 26" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
      
      {/* 西装口袋 */}
      <rect x="20" y="42" width="6" height="4" fill="currentColor" opacity="0.4"/>
      <rect x="38" y="42" width="6" height="4" fill="currentColor" opacity="0.4"/>
    </svg>
  </div>
);

// 优秀员工头像 - 靠谱主播
export const EmployeeAvatar: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30`}>
    <svg viewBox="0 0 64 64" className="w-12 h-12 text-purple-400">
      {/* 头部 - 更圆润，年轻 */}
      <circle cx="32" cy="20" r="10" fill="currentColor" opacity="0.8"/>
      
      {/* 身体 - 休闲衬衫 */}
      <path d="M26 34 L38 34 L38 54 L26 54 Z" fill="currentColor" opacity="0.6"/>
      
      {/* 卷起的袖子 */}
      <rect x="22" y="36" width="6" height="12" fill="currentColor" opacity="0.7"/>
      <rect x="36" y="36" width="6" height="12" fill="currentColor" opacity="0.7"/>
      
      {/* 领口 - V领 */}
      <path d="M28 34 L36 34 L32 38 L28 34 Z" fill="currentColor" opacity="0.9"/>
      
      {/* 大徽章 */}
      <circle cx="32" cy="46" r="4" fill="currentColor" opacity="0.9"/>
      <text x="32" y="49" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">★</text>
      
      {/* 大麦克风 */}
      <rect x="42" y="38" width="3" height="10" fill="currentColor" opacity="0.8"/>
      <circle cx="43.5" cy="48" r="3" fill="currentColor" opacity="0.8"/>
      
      {/* 大耳机 */}
      <path d="M18 22 Q12 16 18 10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
      <path d="M46 22 Q52 16 46 10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
      
      {/* 时尚发型 */}
      <path d="M22 14 Q32 8 42 14" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
    </svg>
  </div>
);

// 包工头头像 - 金牌商家
export const ContractorAvatar: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} bg-orange-600/20 rounded-full flex items-center justify-center border border-orange-500/30`}>
    <svg viewBox="0 0 64 64" className="w-12 h-12 text-orange-400">
      {/* 大安全帽 */}
      <path d="M18 16 Q32 8 46 16 L46 30 Q32 26 18 30 Z" fill="currentColor" opacity="0.9"/>
      
      {/* 头部 - 更粗犷 */}
      <circle cx="32" cy="26" r="9" fill="currentColor" opacity="0.8"/>
      
      {/* 身体 - 宽厚工作服 */}
      <path d="M20 38 L44 38 L44 54 L20 54 Z" fill="currentColor" opacity="0.6"/>
      
      {/* 宽厚肩膀 */}
      <rect x="18" y="34" width="28" height="8" fill="currentColor" opacity="0.7"/>
      
      {/* 大工具袋 */}
      <rect x="36" y="40" width="8" height="10" fill="currentColor" opacity="0.8"/>
      
      {/* 大锤子 */}
      <rect x="40" y="42" width="3" height="8" fill="currentColor" opacity="0.9"/>
      <rect x="38" y="44" width="8" height="3" fill="currentColor" opacity="0.9"/>
      
      {/* 扳手 */}
      <rect x="22" y="42" width="8" height="2" fill="currentColor" opacity="0.8"/>
      <circle cx="26" cy="42" r="2" fill="currentColor" opacity="0.8"/>
      
      {/* 安全帽带子 - 更粗 */}
      <path d="M24 30 Q32 32 40 30" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
      
      {/* 工作服口袋 - 更大 */}
      <rect x="22" y="44" width="8" height="6" fill="currentColor" opacity="0.4"/>
      <rect x="32" y="44" width="8" height="6" fill="currentColor" opacity="0.4"/>
      
      {/* 胡茬 */}
      <circle cx="28" cy="28" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="32" cy="29" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="36" cy="28" r="1" fill="currentColor" opacity="0.6"/>
    </svg>
  </div>
);

// 根据分类获取对应的系统头像
export const getSystemAvatar = (category: string, className?: string) => {
  switch (category) {
    case 'advertiser': // 诚信甲方
      return <BossAvatar className={className} />;
    case 'streamer': // 靠谱主播
      return <EmployeeAvatar className={className} />;
    case 'gold': // 金牌商家
      return <ContractorAvatar className={className} />;
    default:
      return <BossAvatar className={className} />;
  }
};
