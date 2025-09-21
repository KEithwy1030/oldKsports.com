import React, { useState, useRef } from 'react';
import { Image, X, Plus, Upload } from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 9,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      alert(`最多只能上传${maxImages}张图片`);
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    filesToProcess.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        alert(`文件 ${file.name} 不是有效的图片格式`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`图片 ${file.name} 大小超过5MB限制`);
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({ ...prev, [index]: progress }));
        }
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        
        if (newImages.length === filesToProcess.length) {
          onImagesChange([...images, ...newImages]);
          setIsUploading(false);
          setUploadProgress({});
        }
      };

      reader.onerror = () => {
        alert(`上传图片 ${file.name} 失败`);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white mb-2">
          图片上传 ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={openFileDialog}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isUploading ? '上传中...' : '添加图片'}
          </button>
        )}
      </div>
      

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-white/20">
                <img
                  src={image}
                  alt={`上传的图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              {/* Upload Progress */}
              {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">
                    {uploadProgress[index]}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• 支持 JPG、PNG、GIF 格式</p>
        <p>• 单张图片大小不超过 5MB</p>
        <p>• 最多可上传 {maxImages} 张图片</p>
        <p>• 图片将自动压缩优化显示</p>
      </div>
    </div>
  );
};

export default MultiImageUpload;
