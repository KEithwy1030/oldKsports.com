# 图片显示功能指南

## 🖼️ 图片显示机制

### 本地开发环境
- **前端**: `http://localhost:5173`
- **后端**: `http://localhost:3001`
- **图片存储**: `http://localhost:3001/uploads/images/`
- **图片访问**: 通过后端服务提供静态文件服务

### 生产环境 (Zeabur)
- **前端**: `https://oldksports.zeabur.app`
- **后端**: `https://oldksports-backend.zeabur.app`
- **图片存储**: 后端容器内的 `public/uploads/images/`
- **图片访问**: 通过后端服务提供静态文件服务

## 🔧 技术实现

### 1. 图片URL构建工具 (`imageUtils.ts`)

```typescript
// 智能构建图片URL，自动适配环境
export const buildImageUrl = (imagePath: string): string => {
  // 本地开发: http://localhost:3001/uploads/images/filename.jpg
  // 生产环境: https://oldksports-backend.zeabur.app/uploads/images/filename.jpg
}
```

### 2. 图片上传流程

1. **前端上传**: 用户选择图片 → 压缩处理 → 上传到 `/api/upload/images`
2. **后端处理**: 保存到 `uploads/images/` 和 `public/uploads/images/`
3. **返回路径**: 返回 `/uploads/images/filename.jpg` 格式的路径
4. **前端显示**: 使用 `buildImageUrl()` 构建完整URL

### 3. 图片显示组件

- **PostImageGallery**: 帖子图片网格显示
- **图片预览**: 点击放大查看
- **响应式布局**: 自适应不同屏幕尺寸

## 🚀 部署验证

### 本地测试
```bash
# 1. 启动后端服务
cd server && npm run dev

# 2. 启动前端服务
cd client && npm run dev

# 3. 测试图片上传和显示
# - 访问 http://localhost:5173
# - 登录管理员账号
# - 发布带图片的帖子
# - 验证图片正常显示
```

### 生产环境验证
1. **部署到Zeabur**
2. **测试图片上传**: 发布带图片的帖子
3. **验证图片显示**: 检查图片URL是否正确
4. **跨域测试**: 确保前端能访问后端图片

## 🔍 故障排除

### 图片无法显示
1. **检查URL构建**: 确认 `buildImageUrl()` 返回正确URL
2. **检查文件存在**: 验证图片文件是否存在于服务器
3. **检查权限**: 确认静态文件服务配置正确
4. **检查CORS**: 确认跨域配置允许图片访问

### 常见问题
- **404错误**: 图片文件不存在或路径错误
- **CORS错误**: 跨域配置问题
- **权限错误**: 文件访问权限不足

## 📝 环境变量配置

### 前端环境变量
```env
# 本地开发
VITE_API_URL=/api

# 生产环境
VITE_API_URL=https://oldksports-backend.zeabur.app/api
```

### 后端环境变量
```env
# 静态文件服务路径
PUBLIC_UPLOADS_DIR=public/uploads/images
UPLOADS_DIR=uploads/images
```

## 🎯 最佳实践

1. **图片压缩**: 上传前自动压缩，减少存储空间
2. **格式支持**: 支持 JPG、PNG、GIF、WebP 格式
3. **大小限制**: 单张图片最大10MB
4. **数量限制**: 每个帖子最多9张图片
5. **懒加载**: 图片延迟加载，提升性能
6. **错误处理**: 图片加载失败时显示占位符

## 🔄 更新日志

- **v1.0.0**: 基础图片上传和显示功能
- **v1.1.0**: 添加图片压缩和优化
- **v1.2.0**: 支持多环境URL构建
- **v1.3.0**: 添加图片预览和放大功能
