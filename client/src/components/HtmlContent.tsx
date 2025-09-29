import React from 'react';
import DOMPurify from 'dompurify';
import { buildImageUrl, fixImageUrlsInContent } from '../utils/imageUtils';
import { fixHistoricalImageUrls, needsImageUrlFix } from '../utils/imageUrlFixer';

interface HtmlContentProps {
  content: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className }) => {
  // 检查是否需要修复历史图片URL
  const needsFix = needsImageUrlFix(content);
  console.log('🔧 HtmlContent 是否需要修复:', needsFix);
  
  // 先修复历史图片URL，再修复图片URL，确保图片能正确显示
  const historicalFixed = needsFix ? fixHistoricalImageUrls(content) : content;
  const fixedContent = fixImageUrlsInContent(historicalFixed);
  
  // 使用DOMPurify清理HTML内容，防止XSS攻击
  const sanitizedContent = DOMPurify.sanitize(fixedContent, {
    ALLOWED_TAGS: ['p', 'br', 'img', 'div', 'span', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['src', 'alt', 'class', 'style', 'width', 'height'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HtmlContent;
