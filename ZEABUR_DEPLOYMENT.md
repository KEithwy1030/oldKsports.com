# Old K Sports - Zeabur 部署指南

## 🚀 快速部署

### 1. 环境变量配置

在Zeabur控制台中为后端服务设置以下环境变量：

```bash
# 数据库配置（从MySQL服务获取）
MYSQL_HOST=${MYSQL_HOST}
MYSQL_USERNAME=${MYSQL_USERNAME}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_PORT=3306

# JWT密钥（请设置强随机字符串）
JWT_SECRET=your_strong_jwt_secret_key_here

# CORS配置（前端域名）
CORS_ORIGIN=https://your-frontend-domain.zeabur.app

# 服务器配置
NODE_ENV=production
PORT=8080
```

### 2. 服务配置

#### 前端服务 (Frontend)
- **构建命令**: `npm ci && npm run build`
- **输出目录**: `dist`
- **环境变量**: 
  - `NODE_ENV=production`
  - `VITE_API_URL=https://your-backend-domain.zeabur.app/api`

#### 后端服务 (Backend)
- **构建命令**: `npm ci --production`
- **启动命令**: `npm start`
- **端口**: `8080`

### 3. 数据库初始化

部署完成后，在后端服务中执行：

```bash
npm run admin:fix
```

这将创建管理员账号：
- 邮箱: `552319164@qq.com`
- 密码: `Kk19941030`

## ✅ 部署验证

### 1. 健康检查
访问: `https://your-backend-domain.zeabur.app/api/health`
预期响应: `{"status":"OK","message":"Server is running"}`

### 2. 前端访问
访问: `https://your-frontend-domain.zeabur.app`
预期: 正常显示论坛首页

### 3. 管理员登录测试
- 使用上述管理员账号登录
- 验证管理功能是否正常

## 🔧 故障排除

### 数据库连接失败
1. 检查MySQL服务是否运行
2. 验证环境变量配置
3. 确认服务在同一项目中

### CORS错误
1. 检查`CORS_ORIGIN`环境变量
2. 确认前端域名配置正确

### 静态文件无法访问
1. 检查上传目录权限
2. 验证静态文件路径配置

## 📁 项目结构

```
OldKSports-Production/
├── client/                 # 前端代码
│   ├── src/               # 源代码
│   ├── dist/              # 构建输出
│   └── package.json       # 前端依赖
├── server/                # 后端代码
│   ├── routes/            # API路由
│   ├── controllers/       # 控制器
│   ├── services/          # 服务层
│   └── package.json       # 后端依赖
└── zeabur.json           # Zeabur部署配置
```

## 🎯 部署完成检查清单

- [ ] 前端服务部署成功
- [ ] 后端服务部署成功
- [ ] 数据库连接正常
- [ ] 环境变量配置正确
- [ ] CORS配置正确
- [ ] 管理员账号创建成功
- [ ] 健康检查通过
- [ ] 前端可正常访问
- [ ] 用户注册/登录功能正常
- [ ] 论坛发帖功能正常
- [ ] 图片上传功能正常

## 📞 技术支持

如遇到部署问题，请检查：
1. Zeabur Runtime Logs
2. 环境变量配置
3. 服务状态
4. 数据库连接状态
