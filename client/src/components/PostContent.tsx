import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import PostImageGrid from './PostImageGrid';
import { buildImageUrl, fixImageUrlsInContent } from '../utils/imageUtils';
import '../styles/weiboImageGrid.css';
import { showUserCard, hideUserCard } from './UserHoverCard';

interface PostContentProps {
  content: string;
  className?: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, className = '' }) => {
  // 解析整篇内容，抽取全部图片，移除原位置，仅在文末统一渲染一个网格
  const { cleanedHtml, allImages } = useMemo(() => {
    // 1) 先移除历史的 post-images-grid 容器，抽取其中图片
    const gridRegex = /<div class="post-images-grid"[^>]*>([\s\S]*?)<\/div>/g;
    let working = content || '';
    const collected: string[] = [];

    working = working.replace(gridRegex, (_m, inner: string) => {
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      let im: RegExpExecArray | null;
      while ((im = imgRegex.exec(inner)) !== null) {
        collected.push(buildImageUrl(im[1]));
      }
      // 删除整块 grid
      return '';
    });

    // 2) 抽取剩余内容中的所有 <img> 并移除
    const imgRegexGlobal = /<img[^>]+src="([^"]+)"[^>]*>/g;
    working = working.replace(imgRegexGlobal, (_m, src: string) => {
      collected.push(buildImageUrl(src));
      return '';
    });

    // 3) 进一步清理：移除空的段落/容器与多余换行，避免出现“空白块”
    const removeEmptyBlocks = (html: string) => {
      // 去掉只包含空白或 &nbsp;/<br> 的 p/div/span
      let out = html
        .replace(/<(p|div|span)[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/\1>/gi, '')
        .replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')
        .replace(/\s+$/g, '')
        .replace(/^\s+/g, '');
      // 折叠连续空白为单个空格
      out = out.replace(/\s{2,}/g, ' ');
      return out;
    };

    const finalHtml = removeEmptyBlocks(working);

    // 3) 返回清理后的 HTML 与统一图片数组
    return { cleanedHtml: finalHtml, allImages: collected };
  }, [content]);

  // 统一渲染：文本 + 文末一个九宫格
  const fixedHtml = fixImageUrlsInContent(cleanedHtml);
  
  // 处理@用户名，添加绿色样式
  const processedHtml = fixedHtml.replace(/@([a-zA-Z0-9\u4e00-\u9fa5_]+)/g, '<span class="mention-user">@$1</span>');
  
  const sanitizedHtml = DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {/* 先显示正文文本 */}
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        className="text-gray-300"
        style={{ whiteSpace: 'normal' as any }}
        onMouseOver={(e) => {
          const target = e.target as HTMLElement;
          // 仅在 mention-user 上触发（0.5s后显示）
          if (target && target.classList?.contains('mention-user')) {
            const username = target.textContent?.replace(/^@/, '') || '';
            const rect = target.getBoundingClientRect();
            // 延时0.5秒显示
            (target as any).__hoverTimer = setTimeout(() => {
              showUserCard(username, rect);
            }, 500);
          }
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLElement;
          if ((target as any)?.__hoverTimer) {
            clearTimeout((target as any).__hoverTimer);
            (target as any).__hoverTimer = null;
          }
          hideUserCard(120);
        }}
      />
      {/* 再显示统一九宫格（将内容中的图片抽出到这里） */}
      {allImages.length > 0 && (
        <PostImageGrid images={allImages} />
      )}
    </div>
  );
};

export default PostContent;
