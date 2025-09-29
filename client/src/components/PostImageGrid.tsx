import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { buildImageUrl } from '../utils/imageUtils';
import '../styles/weiboImageGrid.css';

type Props = {
  images: string[];
  onImageClick?: (index: number) => void;
  className?: string;
};

const getLayout = (count: number) => {
  if (count <= 1) return { columns: 1, variant: 'single' as const };
  if (count === 2) return { columns: 2, variant: 'grid' as const };
  if (count === 4) return { columns: 2, variant: 'grid' as const };
  return { columns: 3, variant: 'grid' as const };
};

const PostImageGrid: React.FC<Props> = ({ images, onImageClick, className }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validList, setValidList] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('landscape');

  // 锁定页面滚动：预览时禁止背景滚动，关闭时恢复
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return;
  }, [showModal]);

  // 预加载图片，过滤失效或加载失败的 src，避免出现空格子
  React.useEffect(() => {
    const urls = (Array.isArray(images) ? images : [])
      .map(u => (typeof u === 'string' ? u : ''))
      .filter(Boolean);
    let cancelled = false;

    const load = async () => {
      const checks = await Promise.all(urls.map(src => new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
        img.src = src;
      })));
      if (!cancelled) {
        setValidList(checks.filter((v): v is string => !!v));
      }
    };
    load();
    return () => { cancelled = true; };
  }, [images]);

  const list = validList.slice(0, 9);
  const overflow = validList.length > 9 ? validList.length - 9 : 0;
  const { variant } = getLayout(list.length);

  const detectOrientation = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) return;
      if (Math.abs(w - h) < 2) {
        setOrientation('square');
      } else if (w > h) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };
    img.src = src;
  };

  const openModal = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    setShowModal(true);
    onImageClick?.(index);
    detectOrientation(image);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    const src = images[nextIndex];
    setSelectedImage(src);
    detectOrientation(src);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    const src = images[prevIndex];
    setSelectedImage(src);
    detectOrientation(src);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  if (list.length === 0) return null;

  // 单图也裁成 1:1 方形缩略图
  if (list.length === 1) {
    return (
      <>
        <div className={`weibo-grid ${className}`} data-variant="grid" data-count="1" onClick={(e) => e.stopPropagation()}>
          <div
            className="weibo-grid-item"
            onClick={() => openModal(list[0], 0)}
          >
            <img src={buildImageUrl(list[0])} alt="post" loading="lazy" decoding="async" />
          </div>
        </div>

        {/* 图片放大模态框 */}
        {showModal && selectedImage && createPortal(
          <div 
            className="weibo-image-modal"
            style={{
              position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
              zIndex: 2147483647
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="weibo-modal-frame relative" data-orientation={orientation} style={{ zIndex: 2147483648 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={buildImageUrl(selectedImage)}
                alt={`帖子图片 ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`weibo-grid ${className}`}
        data-variant={variant}
        data-count={list.length}
        role="list"
        onClick={(e) => e.stopPropagation()}
      >
        {list.map((src, idx) => {
          const isLastAndMore = overflow > 0 && idx === list.length - 1;
          return (
          <div
            key={idx}
            className={`weibo-grid-item ${isLastAndMore ? 'weibo-grid-more' : ''}`}
            {...(isLastAndMore ? { 'data-more': `+${overflow}` } : {})}
            role="listitem"
            onClick={(e) => { e.stopPropagation(); openModal(src, idx); }}
          >
              <img
                src={buildImageUrl(src)}
                alt={`img-${idx + 1}`}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 1 }}
                onError={(e) => {
                  // 兜底：若仍加载失败，尝试将任何旧域名替换为当前域名并重试一次
                  const img = e.currentTarget as HTMLImageElement & { __retry?: boolean };
                  if (img.__retry) return;
                  img.__retry = true;
                  try {
                    const url = new URL(img.src);
                    const path = url.pathname.startsWith('/uploads/') ? url.pathname : `/uploads${url.pathname}`.replace('//', '/');
                    img.src = `${window.location.origin}${path}`;
                  } catch {
                    // 若不是绝对URL，则直接统一走当前域名
                    const original = (src || '').replace(/^https?:\/\/[^/]+/, '');
                    const normalized = original.startsWith('/') ? original : `/${original}`;
                    img.src = `${window.location.origin}${normalized}`;
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 图片放大模态框 */}
      {showModal && selectedImage && createPortal(
        <div 
          className="weibo-image-modal"
          style={{
            position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            zIndex: 2147483647
          }}
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="weibo-modal-frame relative" data-orientation={orientation} style={{ zIndex: 2147483648 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative">
              <img
                src={buildImageUrl(selectedImage)}
                alt={`帖子图片 ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{ position: 'relative', zIndex: 2147483649 }}
                onClick={(e) => e.stopPropagation()}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>, document.body)}
    </>
  );
};

export default PostImageGrid;
