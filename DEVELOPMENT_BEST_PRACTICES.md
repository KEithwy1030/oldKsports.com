# 🚀 通用开发最佳实践指南

## 📋 核心原则

### **1. 环境隔离**
- **开发环境**: 本地开发，使用本地数据库
- **测试环境**: 容器化测试，模拟生产环境
- **生产环境**: 云平台部署，使用生产数据库

### **2. 配置管理**
```bash
# 环境变量模板
cp env.example .env
# 编辑 .env 文件，配置开发环境变量
```

### **3. 数据库管理**
- 使用迁移脚本管理数据库结构
- 生产环境数据通过SQL导出/导入
- 开发环境使用容器化数据库

## 🔧 开发阶段避免上线问题的通用方法

### **方法1：容器化开发环境**
```bash
# 使用Docker Compose创建与生产环境一致的开发环境
docker-compose -f docker-compose.dev.yml up -d
```

### **方法2：环境变量标准化**
```javascript
// 统一的配置管理
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    // ... 其他配置
  }
};
```

### **方法3：自动化测试**
```bash
# 部署前自动测试
npm run test:deployment
```

### **方法4：健康检查端点**
```javascript
// 应用健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 数据库健康检查
app.get('/api/health/db', async (req, res) => {
  const healthy = await healthCheck();
  res.json({ healthy, timestamp: new Date().toISOString() });
});
```

## 🏗️ 跨平台部署配置

### **Zeabur (香港)**
```json
// zeabur.json
{
  "services": [
    {
      "name": "backend",
      "rootDir": "server",
      "startCommand": "npm start",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3001"
      }
    }
  ]
}
```

### **Vercel**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ]
}
```

### **Railway**
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### **阿里云ECS**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
```

## 🛠️ 开发工具链

### **1. 代码质量检查**
```bash
# ESLint检查
npm run lint

# TypeScript类型检查
npm run type-check

# 代码格式化
npm run format
```

### **2. 自动化部署脚本**
```bash
#!/bin/bash
# deploy.sh

# 1. 代码检查
npm run lint
npm run test

# 2. 构建项目
npm run build

# 3. 数据库迁移
npm run migrate

# 4. 部署测试
npm run test:deployment

# 5. 部署到生产环境
npm run deploy
```

### **3. 监控和日志**
```javascript
// 统一日志格式
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data)
};
```

## 📊 部署前检查清单

### ✅ 代码质量
- [ ] 通过ESLint检查
- [ ] 通过TypeScript类型检查
- [ ] 单元测试通过
- [ ] 集成测试通过

### ✅ 环境配置
- [ ] 环境变量配置正确
- [ ] 数据库连接正常
- [ ] 文件上传路径正确
- [ ] CORS配置正确

### ✅ 数据库
- [ ] 表结构完整
- [ ] 索引创建
- [ ] 初始数据导入
- [ ] 备份策略

### ✅ 安全配置
- [ ] JWT密钥设置
- [ ] 密码加密
- [ ] HTTPS配置
- [ ] 防火墙规则

## 🔍 故障排除指南

### **常见问题1：数据库连接失败**
```bash
# 检查网络连接
ping your-db-host

# 检查端口开放
telnet your-db-host 3306

# 检查凭据
mysql -h your-db-host -u username -p
```

### **常见问题2：API返回HTML而非JSON**
- 检查路由配置
- 检查中间件顺序
- 检查静态文件服务配置

### **常见问题3：文件上传失败**
- 检查目录权限
- 检查文件大小限制
- 检查文件类型限制

## 🎯 最佳实践总结

1. **开发阶段**: 使用容器化环境，模拟生产环境
2. **测试阶段**: 自动化测试，覆盖核心功能
3. **部署阶段**: 使用健康检查，监控应用状态
4. **运维阶段**: 日志监控，性能优化

## 📞 技术支持

如遇到问题，请按以下顺序检查：
1. 服务器日志
2. 应用日志
3. 数据库日志
4. 网络连接状态
5. 环境变量配置
