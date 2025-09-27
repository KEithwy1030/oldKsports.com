# Zeabur 环境变量配置指南

## 问题描述
前端代码中硬编码了 `http://localhost:8080`，导致生产环境无法连接到后端服务。

## 更新说明
- 已修复所有硬编码的API地址
- 现在使用环境变量动态配置API地址
- 支持开发和生产环境的自动切换

## 解决方案

### 1. 前端服务环境变量配置

在Zeabur中为 `oldksports.com-client` 服务添加以下环境变量：

```
VITE_API_BASE_URL=https://oldksports-server.zeabur.app
VITE_API_URL=https://oldksports-server.zeabur.app/api
```

### 2. 后端服务环境变量配置

确保 `oldksports.com_server` 服务有以下环境变量：

```
MYSQL_HOST=(auto generated)
MYSQL_USERNAME=(auto generated)
MYSQL_PASSWORD=(auto generated)
MYSQL_DATABASE=(auto generated)
MYSQL_PORT=(auto generated)
PORT=8080
```

### 3. 启动命令配置

**后端服务启动命令**：
```
npm run production
```
或
```
node start-production.js
```

**前端服务启动命令**：
```
npm run build && npm run preview
```

## 代码修改说明

### 已修复的文件：

1. **client/src/utils/imageUtils.ts**
   - 将硬编码的 `http://localhost:8080` 替换为 `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`

2. **client/src/services/authService.js**
   - 将硬编码的 `http://localhost:8080` 替换为 `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`

3. **client/src/config/api.config.ts**
   - 已正确使用 `import.meta.env.VITE_API_URL || '/api'`

### 环境变量优先级：

1. **开发环境**：使用 `.env.local` 或默认值 `http://localhost:8080`
2. **生产环境**：使用Zeabur设置的环境变量 `https://oldksports-server.zeabur.app`

## 部署步骤

1. 在Zeabur中设置上述环境变量
2. 重新部署前端和后端服务
3. 验证前端能正确连接到后端API

## 验证方法

部署完成后：
1. 访问 `https://oldksports.zeabur.app`
2. 打开浏览器开发者工具的 Network 标签
3. 执行登录、发帖等操作
4. 确认API请求指向 `https://oldksports-server.zeabur.app`

## 注意事项

- 确保后端服务正常运行在 `https://oldksports-server.zeabur.app`
- 前端服务运行在 `https://oldksports.zeabur.app`
- 所有API请求现在都会根据环境自动选择正确的后端地址
