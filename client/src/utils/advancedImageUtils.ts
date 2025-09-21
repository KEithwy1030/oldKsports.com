// 高级图片处理工具
export interface ImageEnhancementOptions {
  sharpen?: boolean;
  contrast?: number;
  brightness?: number;
  saturation?: number;
}

/**
 * 图片增强处理
 * @param canvas Canvas元素
 * @param options 增强选项
 */
export const enhanceImage = (canvas: HTMLCanvasElement, options: ImageEnhancementOptions = {}) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const {
    sharpen = true,
    contrast = 1.15,
    brightness = 1.08,
    saturation = 1.12
  } = options;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 应用对比度和亮度调整
  for (let i = 0; i < data.length; i += 4) {
    // 对比度调整
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));

    // 亮度调整
    data[i] = Math.min(255, Math.max(0, data[i] * brightness));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightness));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightness));
  }

  ctx.putImageData(imageData, 0, 0);

  // 锐化处理
  if (sharpen) {
    const sharpenFilter = [
      0, -0.5, 0,
      -0.5, 3, -0.5,
      0, -0.5, 0
    ];
    applyConvolutionFilter(canvas, sharpenFilter);
  }
};

/**
 * 应用卷积滤镜
 * @param canvas Canvas元素
 * @param filter 滤镜矩阵
 */
const applyConvolutionFilter = (canvas: HTMLCanvasElement, filter: number[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const newData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            const filterIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[pixelIndex] * filter[filterIndex];
          }
        }
        const newIndex = (y * width + x) * 4 + c;
        newData[newIndex] = Math.min(255, Math.max(0, sum));
      }
    }
  }

  const newImageData = new ImageData(newData, width, height);
  ctx.putImageData(newImageData, 0, 0);
};

/**
 * 智能图片缩放
 * @param img 原始图片
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @returns 处理后的Canvas
 */
export const smartResize = (img: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { 
    alpha: false,
    desynchronized: false,
    colorSpace: 'srgb'
  });

  if (!ctx) throw new Error('无法创建Canvas上下文');

  // 设置最高质量渲染
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // ctx.textRenderingOptimization = 'optimizeQuality'; // 移除不存在的属性

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 高质量绘制
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 应用图片增强
  enhanceImage(canvas, {
    sharpen: true,
    contrast: 1.15,
    brightness: 1.08,
    saturation: 1.12
  });

  return canvas;
};
