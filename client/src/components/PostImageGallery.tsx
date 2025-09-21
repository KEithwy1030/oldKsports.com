import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import '../styles/imageOptimization.css';
import '../styles/modal-fix.css';

interface PostImageGalleryProps {
  images: string[];
  className?: string;
  maxPreviewImages?: number;
}

const PostImageGallery: React.FC<PostImageGalleryProps> = ({
  images,
  className = '',
  maxPreviewImages = 3
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const displayImages = images.slice(0, maxPreviewImages);
  const remainingCount = images.length - maxPreviewImages;

  const openModal = (image: string) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const getGridLayout = (count: number) => {
    // 微博风格：3张图片使用1行3列布局
    return 'grid-cols-3';
  };

  const getImageSize = (count: number, index: number) => {
    // 保持图片原始比例，避免变形
    return 'h-24'; // 固定高度，宽度自适应
  };

  return (
    <>
      <div className={`h-full flex flex-col ${className}`}>
        {/* Image Grid - 微博风格单行显示 */}
        <div className={`image-grid ${getGridLayout(displayImages.length)} gap-1`} style={{ height: '96px' }}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer ${getImageSize(displayImages.length, index)}`}
              onClick={() => openModal(image)}
            >
              <div className="image-preview w-full h-full bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={image}
                  alt={`帖子图片 ${index + 1}`}
                  className="optimized-image w-full h-full object-contain transition-transform group-hover:scale-105"
                  style={{ 
                    imageRendering: 'auto' as any,
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* Show remaining count for last image - 微博风格 */}
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

        {/* Image Count Info - 固定高度 */}
        {images.length > 3 && (
          <p className="text-xs text-gray-400 text-center mt-1 flex-shrink-0">
            共 {images.length} 张图片
          </p>
        )}
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="放大查看"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostImageGallery;
