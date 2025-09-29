import React, { useEffect, useRef } from 'react';
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

  // 运行时兜底：渲染后遍历容器中的<img>，把旧域名与相对路径强制改写为自定义域名
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || '/api';
      const baseUrl = apiUrl.startsWith('http') ? apiUrl.replace('/api', '') : window.location.origin;
      const container = containerRef.current;
      if (!container) return;
      const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
      imgs.forEach(img => {
        const original = img.getAttribute('src') || '';
        // 已是 data/blob 则跳过
        if (original.startsWith('data:') || original.startsWith('blob:')) return;
        let nextSrc = original;
        // 相对路径统一补全
        if (/^(uploads\/images\/|\/public\/uploads\/images\/)/.test(original)) {
          nextSrc = original.replace(/^\/public/, '');
          if (!nextSrc.startsWith('/')) nextSrc = '/' + nextSrc;
          nextSrc = baseUrl + nextSrc;
        }
        // 旧域名统一替换
        nextSrc = nextSrc
          .replace(/^https?:\/\/oldksports-app\.zeabur\.app/, baseUrl)
          .replace/^https?:\/\/oldksports-server\.zeabur\.app/, baseUrl);
        // 如果仍非完整URL，再走一次构造函数
        if (!/^https?:\/\//.test(nextSrc)) {
          nextSrc = buildImageUrl(nextSrc);
        }
        if (nextSrc !== original) {
          img.src = nextSrc;
        }
        // 失败兜底：如果加载错误，再尝试把旧域名替换为新域名
        img.onerror = () => {
          try {
            const cur = img.src;
            const fallback = cur
              .replace('oldksports-app.zeabur.app', new URL(baseUrl).host)
              .replace('oldksports-server.zeabur.app', new URL(baseUrl).host);
            if (fallback !== cur) img.src = fallback;
          } catch {}
        };
      });
    } catch {}
  }, [sanitizedContent]);

  return (
    <div 
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HtmlContent;
