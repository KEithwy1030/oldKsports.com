// 图片处理工具函数
import { smartResize } from './advancedImageUtils';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  enhance?: boolean;
}

export interface ImageCompressionResult {
  dataUrl: string;
  sizeInMB: number;
  originalSize: number;
  compressionRatio: number;
  originalFileName?: string;
}

/**
 * 高质量图片压缩函数
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns Promise<ImageCompressionResult>
 */
export const compressImage = async (
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<ImageCompressionResult> => {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.98,
    format = 'jpeg',
    enhance = true
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        try {
          // 创建高质量Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: false,
            colorSpace: 'srgb'
          });
          
          if (!ctx) {
            reject(new Error('无法创建Canvas上下文'));
            return;
          }

          // 设置最高质量渲染参数
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // ctx.textRenderingOptimization = 'optimizeQuality'; // 移除不存在的属性
          
          let { width: originalWidth, height: originalHeight } = img;
          
          // 智能尺寸计算 - 确保最小质量基准
          const minDimension = 1500; // 进一步提高最小尺寸要求
          const maxDimension = Math.max(maxWidth, maxHeight);
          
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;
          
          // 第一步：如果图片太小，先放大到最小尺寸
          if (originalWidth < minDimension || originalHeight < minDimension) {
            const aspectRatio = originalWidth / originalHeight;
            if (originalWidth < originalHeight) {
              targetHeight = minDimension;
              targetWidth = minDimension * aspectRatio;
            } else {
              targetWidth = minDimension;
              targetHeight = minDimension / aspectRatio;
            }
          }
          
          // 第二步：如果图片太大，缩小到最大尺寸
          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const aspectRatio = targetWidth / targetHeight;
            if (targetWidth / maxWidth > targetHeight / maxHeight) {
              targetWidth = maxWidth;
              targetHeight = maxWidth / aspectRatio;
            } else {
              targetHeight = maxHeight;
              targetWidth = maxHeight * aspectRatio;
            }
          }
          
          // 确保尺寸为整数
          targetWidth = Math.round(targetWidth);
          targetHeight = Math.round(targetHeight);
          
          // 使用智能缩放和增强处理
          if (enhance) {
            const enhancedCanvas = smartResize(img, targetWidth, targetHeight);
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(enhancedCanvas, 0, 0);
          } else {
            // 设置Canvas尺寸
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // 高质量绘制 - 使用最佳实践
            ctx.clearRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          }
          
          // 生成高质量图片
          const mimeType = `image/${format}`;
          const compressedResult = canvas.toDataURL(mimeType, format === 'jpeg' ? quality : undefined);
          
          // 精确计算文件大小
          const base64 = compressedResult.split(',')[1];
          const sizeInBytes = Math.round((base64.length * 3) / 4);
          const sizeInMB = sizeInBytes / (1024 * 1024);
          
          resolve({
            dataUrl: compressedResult,
            sizeInMB,
            originalSize: file.size,
            compressionRatio: (file.size - sizeInBytes) / file.size,
            originalFileName: file.name
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      img.src = result;
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * 批量压缩图片
 * @param files 图片文件数组
 * @param options 压缩选项
 * @returns Promise<ImageCompressionResult[]>
 */
export const compressImages = async (
  files: File[], 
  options: ImageCompressionOptions = {}
): Promise<ImageCompressionResult[]> => {
  const results: ImageCompressionResult[] = [];
  
  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`压缩图片 ${file.name} 失败:`, error);
      throw error;
    }
  }
  
  return results;
};

/**
 * 验证图片文件
 * @param file 文件
 * @param maxSizeInMB 最大文件大小(MB)
 * @returns boolean
 */
export const validateImageFile = (file: File, maxSizeInMB: number = 10): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const sizeInMB = file.size / (1024 * 1024);
  
  return validTypes.includes(file.type) && sizeInMB <= maxSizeInMB;
};
