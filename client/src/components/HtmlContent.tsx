import React from 'react';
import DOMPurify from 'dompurify';
import { buildImageUrl, fixImageUrlsInContent } from '../utils/imageUtils';

interface HtmlContentProps {
  content: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className }) => {
  // 先修复图片URL，确保图片能正确显示
  const fixedContent = fixImageUrlsInContent(content);
  
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
