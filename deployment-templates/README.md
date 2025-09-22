# 通用部署配置模板

本目录包含适用于不同云服务商的部署配置模板。

## 🚀 支持的部署平台

### 1. Zeabur (香港)
- `zeabur.json` - Zeabur平台配置
- 环境变量: `ZEABUR_*`

### 2. Vercel
- `vercel.json` - Vercel平台配置
- 环境变量: `VERCEL_*`

### 3. Railway
- `railway.json` - Railway平台配置
- 环境变量: `RAILWAY_*`

### 4. Heroku
- `Procfile` - Heroku平台配置
- 环境变量: `HEROKU_*`

### 5. 阿里云
- `docker-compose.prod.yml` - 阿里云ECS配置
- 环境变量: `ALIYUN_*`

### 6. 腾讯云
- `docker-compose.prod.yml` - 腾讯云CVM配置
- 环境变量: `TENCENT_*`

## 📋 部署前检查清单

### ✅ 环境变量配置
- [ ] 复制 `env.example` 为 `.env`
- [ ] 配置数据库连接信息
- [ ] 设置JWT密钥
- [ ] 配置CORS源
- [ ] 设置文件上传路径

### ✅ 数据库准备
- [ ] 创建数据库
- [ ] 导入表结构
- [ ] 创建管理员账号
- [ ] 测试数据库连接

### ✅ 代码检查
- [ ] 运行 `npm run lint`
- [ ] 运行 `npm run test`
- [ ] 运行 `npm run build`
- [ ] 检查TypeScript类型错误

### ✅ 安全配置
- [ ] 更改默认密码
- [ ] 设置强JWT密钥
- [ ] 配置HTTPS
- [ ] 设置防火墙规则

## 🔧 快速部署命令

```bash
# 1. 环境准备
cp env.example .env
# 编辑 .env 文件

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 数据库迁移
npm run migrate

# 5. 启动服务
npm start
```

## 📊 监控和日志

### 健康检查端点
- `GET /api/health` - 应用健康状态
- `GET /api/health/db` - 数据库连接状态
- `GET /api/health/disk` - 磁盘空间状态

### 日志配置
- 开发环境: 控制台输出
- 生产环境: 文件日志 + 系统日志
- 错误日志: 单独文件记录

## 🛠️ 故障排除

### 常见问题
1. **数据库连接失败**
   - 检查网络连接
   - 验证数据库凭据
   - 确认防火墙设置

2. **端口冲突**
   - 检查端口占用
   - 修改PORT环境变量

3. **文件权限问题**
   - 检查上传目录权限
   - 确认用户权限设置

4. **内存不足**
   - 增加服务器内存
   - 优化代码性能
   - 使用连接池

## 📞 技术支持

如遇到部署问题，请检查：
1. 服务器日志
2. 应用日志
3. 数据库日志
4. 网络连接状态
