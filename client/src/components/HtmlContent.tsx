import React from 'react';
import DOMPurify from 'dompurify';
import { buildImageUrl } from '../utils/imageUtils';

interface HtmlContentProps {
  content: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className }) => {
  // 使用DOMPurify清理HTML内容，防止XSS攻击
  const sanitizedContent = DOMPurify.sanitize(content, {
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
