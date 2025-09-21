import React from 'react';
import { mockMerchants } from '../data/mockData';

const BlacklistTicker: React.FC = () => {
  const blacklistedMerchants = mockMerchants.filter(m => m.status === 'blacklisted');
  
  if (blacklistedMerchants.length === 0) {
    return null;
  }

  const tickerItems = blacklistedMerchants.map(merchant => 
    `${merchant.name}: ${merchant.reason}`
  );

  return (
    <div className="bg-red-500/20 border-b border-red-400/30 py-2 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4">
          <span className="text-red-300 font-medium text-sm">⚠️ 行业黑榜</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-red-300 text-sm">
              {tickerItems.join(' • ')} • {tickerItems.join(' • ')}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 px-4">
          <a 
            href="/blacklist" 
            className="text-red-300 hover:text-red-200 text-sm font-medium"
          >
            查看详情 →
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlacklistTicker;