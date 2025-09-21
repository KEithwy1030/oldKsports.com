import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import '../styles/modal-fix.css';

interface PostImageGridProps {
  images: string[];
  className?: string;
}

const PostImageGrid: React.FC<PostImageGridProps> = ({ images, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  // 微博风格：最多显示9张图片
  const displayImages = images.slice(0, 9);
  const remainingCount = images.length - 9;

  // 根据图片数量确定网格布局
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3'; // 7-9张图片使用3x3布局
  };

  // 根据图片数量确定容器大小
  const getContainerSize = (count: number) => {
    if (count === 1) return 'max-w-xs'; // 单张图片较小
    if (count <= 4) return 'max-w-md'; // 2-4张图片中等
    return 'max-w-2xl'; // 5-9张图片较大
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className={`weibo-image-grid ${getContainerSize(displayImages.length)} ${className}`}>
        <div className={`grid ${getGridLayout(displayImages.length)} gap-1`}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer aspect-square bg-gray-800 rounded-sm overflow-hidden"
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                openModal(image, index);
              }}
            >
              <img
                src={image}
                alt={`帖子图片 ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                style={{ 
                  imageRendering: 'auto' as any,
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
                loading="lazy"
                decoding="async"
              />
              
              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* 显示剩余数量 - 微博风格 */}
              {index === displayImages.length - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 图片放大模态框 */}
      {showModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            closeModal();
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* 关闭按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                closeModal();
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* 图片容器 */}
            <div className="relative">
              <img
                src={selectedImage}
                alt={`帖子图片 ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
                style={{ 
                  imageRendering: 'auto' as any,
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* 导航按钮 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
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
                      e.stopPropagation(); // 阻止事件冒泡
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

            {/* 图片计数器 */}
            {images.length > 1 && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PostImageGrid;
