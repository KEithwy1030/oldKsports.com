// 图片URL构建工具
// 支持本地开发和生产环境

/**
 * 构建图片URL
 * @param imagePath 图片路径，如 "/uploads/images/filename.jpg"
 * @returns 完整的图片URL
 */
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  console.log('🖼️ buildImageUrl 输入:', imagePath);
  console.log('🖼️ 当前环境:', {
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
  });
  
  // 环境变量验证
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.error('❌ 生产环境缺少 VITE_API_URL，使用兜底方案');
    return window.location.origin + (imagePath.startsWith('/') ? imagePath : `/${imagePath}`);
  }
  
  // 放行 data:/blob: 这类内联或临时URL（用于刚发表的回复）
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    console.log('🖼️ 内联URL，直接返回:', imagePath);
    return imagePath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrl = apiUrl.startsWith('http') ? apiUrl.replace('/api', '') : (import.meta.env.VITE_API_BASE_URL || window.location.origin);

  // 如果已经是完整URL，做兼容性规范化
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      const url = new URL(imagePath);
      // 统一 localhost:3001 → 8080（历史本地）
      if (url.hostname === 'localhost' && url.port === '3001') {
        url.port = '';
        url.host = new URL(baseUrl).host; // 用当前后端域
        url.protocol = new URL(baseUrl).protocol;
        return url.toString();
      }
      // 统一旧的zeabur域名到自定义域名
      if (url.hostname === 'oldksports-app.zeabur.app' || url.hostname === 'oldksports-server.zeabur.app') {
        const target = new URL(baseUrl);
        url.protocol = target.protocol;
        url.host = target.host;
        return url.toString();
      }
    } catch {}
    return imagePath;
  }
  
  // 确保路径以 / 开头
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  console.log('🖼️ API URL:', apiUrl);
  
  // 本地开发环境：API URL是 /api，需要替换为后端地址
  if (apiUrl === '/api') {
    // 本地开发时，使用环境变量或默认后端地址
    const backendUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
    const result = `${backendUrl}${normalizedPath}`;
    console.log('🖼️ 本地开发URL:', result);
    return result;
  }
  
  // 生产环境：API URL是完整URL，替换 /api 为根路径
  if (apiUrl.startsWith('http')) {
    const result = baseUrl + normalizedPath;
    console.log('🖼️ 生产环境URL:', result);
    return result;
  }
  
  // 兜底方案：使用当前域名
  const result = window.location.origin + normalizedPath;
  console.log('🖼️ 兜底URL:', result);
  return result;
};

/**
 * 构建图片上传URL
 * @returns 图片上传的完整URL
 */
export const buildUploadUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  return `${apiUrl}/upload/images`;
};

/**
 * 检查图片URL是否有效
 * @param imagePath 图片路径
 * @returns 是否有效
 */
export const isValidImagePath = (imagePath: string): boolean => {
  if (!imagePath) return false;
  
  // 检查是否是图片文件
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = imageExtensions.some(ext => 
    imagePath.toLowerCase().includes(ext)
  );
  
  return hasValidExtension;
};

/**
 * 从HTML内容中提取图片URL并修复
 * @param content HTML内容
 * @returns 修复后的HTML内容
 */
export const fixImageUrlsInContent = (content: string): string => {
  if (!content) return content;
  
  // 先处理历史数据中的绝对URL，将3001端口统一替换为当前后端地址
  const backendUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://oldksports.com' : 'http://localhost:3000');
  let fixedContent = content.replace(
    /http:\/\/localhost:3001(\/uploads\/images\/[^"']*)/g,
    `${backendUrl}$1`
  );

  // 将旧的Zeabur域名统一替换为自定义域名
  fixedContent = fixedContent
    .replace(/https?:\/\/oldksports-app\.zeabur\.app(\/uploads\/images\/[^"']*)/g, `${backendUrl}$1`)
    .replace(/https?:\/\/oldksports-server\.zeabur\.app(\/uploads\/images\/[^"']*)/g, `${backendUrl}$1`);

  // 统一将 /public/uploads/images 前缀改为 /uploads/images
  fixedContent = fixedContent.replace(
    /(["'])(?:\/public)?\/uploads\/images\/([^"']+)(["'])/g,
    (_m, p1, p2, p3) => `${p1}/uploads/images/${p2}${p3}`
  );

  // 处理没有前导斜杠的相对路径：uploads/images/xxx → /uploads/images/xxx
  fixedContent = fixedContent.replace(
    /(["'])uploads\/images\/([^"']+)(["'])/g,
    (_m, p1, p2, p3) => `${p1}/uploads/images/${p2}${p3}`
  );

  // 然后匹配所有img标签的src属性，使用buildImageUrl统一处理
  return fixedContent.replace(
    /<img([^>]+)src=["']([^"']+)["']([^>]*)>/g,
    (match, before, src, after) => {
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        return `<img${before}src="${src}"${after}>`;
      }
      const fixedSrc = buildImageUrl(src);
      return `<img${before}src="${fixedSrc}"${after}>`;
    }
  );
};