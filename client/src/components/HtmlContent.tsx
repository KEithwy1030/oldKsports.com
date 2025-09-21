import React, { useMemo } from 'react';
import PostImageGrid from './PostImageGrid';
import '../styles/weiboImageGrid.css';

interface HtmlContentProps {
  content: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className = '' }) => {
  // 解析内容，提取图片网格
  const { textContent, imageGrids } = useMemo(() => {
    // 使用正则表达式匹配图片网格
    const gridRegex = /<div class="post-images-grid"[^>]*>([\s\S]*?)<\/div>/g;
    const grids: Array<{ images: string[]; placeholder: string }> = [];
    let match;
    let processedContent = content;
    let gridIndex = 0;

    while ((match = gridRegex.exec(content)) !== null) {
      const gridHtml = match[0];
      const gridContent = match[1];
      
      // 提取图片URLs
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const images: string[] = [];
      let imgMatch;
      
      while ((imgMatch = imgRegex.exec(gridContent)) !== null) {
        images.push(imgMatch[1]);
      }
      
      if (images.length > 0) {
        const placeholder = `__IMAGE_GRID_${gridIndex}__`;
        grids.push({ images, placeholder });
        processedContent = processedContent.replace(gridHtml, placeholder);
        gridIndex++;
      }
    }

    return {
      textContent: processedContent,
      imageGrids: grids
    };
  }, [content]);

  // 渲染内容
  const renderContent = () => {
    let result = textContent;
    
    // 替换图片网格占位符
    imageGrids.forEach(({ images, placeholder }) => {
      const gridComponent = `<div class="post-image-grid-container" data-images='${JSON.stringify(images)}'></div>`;
      result = result.replace(placeholder, gridComponent);
    });
    
    return result;
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: renderContent() }} />
      {imageGrids.map(({ images }, index) => (
        <PostImageGrid key={index} images={images} />
      ))}
    </div>
  );
};

export default HtmlContent;
