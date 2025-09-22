import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import PostImageGrid from './PostImageGrid';
import '../styles/weiboImageGrid.css';

interface PostContentProps {
  content: string;
  className?: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, className = '' }) => {
  // 解析内容，分离文本和图片网格
  const { textParts, imageGrids } = useMemo(() => {
    // 使用正则表达式匹配图片网格
    const gridRegex = /<div class="post-images-grid"[^>]*>([\s\S]*?)<\/div>/g;
    const parts: string[] = [];
    const grids: string[][] = [];
    let lastIndex = 0;
    let match;

    while ((match = gridRegex.exec(content)) !== null) {
      // 添加网格前的文本
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      // 提取图片URLs
      const gridContent = match[1];
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const images: string[] = [];
      let imgMatch;
      
      while ((imgMatch = imgRegex.exec(gridContent)) !== null) {
        images.push(imgMatch[1]);
      }
      
      if (images.length > 0) {
        grids.push(images);
        parts.push(`__IMAGE_GRID_${grids.length - 1}__`);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后一部分文本
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    // 如果没有找到网格，整个内容就是文本
    if (parts.length === 0) {
      parts.push(content);
    }

    return { textParts: parts, imageGrids: grids };
  }, [content]);

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {textParts.map((part, index) => {
        // 检查是否是图片网格占位符
        const gridMatch = part.match(/^__IMAGE_GRID_(\d+)__$/);
        if (gridMatch) {
          const gridIndex = parseInt(gridMatch[1]);
          const images = imageGrids[gridIndex];
          return <PostImageGrid key={index} images={images} />;
        }
        
        // 渲染文本内容 - 使用DOMPurify清洗HTML防止XSS
        const sanitizedHtml = DOMPurify.sanitize(part, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
          ALLOW_DATA_ATTR: false
        });
        
        return (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            className="whitespace-pre-wrap"
          />
        );
      })}
    </div>
  );
};

export default PostContent;
