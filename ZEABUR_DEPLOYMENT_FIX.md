# 🚀 Zeabur部署修复指南

## ❌ 问题诊断

**错误信息**：
```
服务器启动失败: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/src/minimal-migrate.js'
```

**问题原因**：
- Zeabur部署时找不到 `minimal-migrate.js` 文件
- 数据库迁移脚本在生产环境中执行失败

## ✅ 解决方案

### 1. 代码修复（已完成）

**修改了 `server/index.js`**：
- 添加了数据库迁移错误处理
- 如果迁移失败，服务器仍会继续启动
- 避免因迁移问题导致服务崩溃

**创建了 `server/start-production.js`**：
- 专门的生产环境启动脚本
- 不依赖数据库迁移文件
- 更稳定的生产环境启动方式

### 2. Zeabur部署配置

#### 后端服务配置：
1. **启动命令**：`npm run production`
2. **构建目录**：`server`
3. **环境变量**：
   ```
   MYSQL_HOST=your-mysql-host
   MYSQL_USERNAME=your-mysql-username
   MYSQL_PASSWORD=your-mysql-password
   MYSQL_DATABASE=your-mysql-database
   MYSQL_PORT=3306
   NODE_ENV=production
   ```

#### 前端服务配置：
1. **构建目录**：`client`
2. **环境变量**：
   ```
   VITE_API_URL=https://your-backend-url.zeabur.app/api
   ```

### 3. 部署步骤

1. **重新部署后端服务**：
   - 在Zeabur中重新部署后端服务
   - 使用 `npm run production` 作为启动命令
   - 确保所有环境变量已设置

2. **验证部署**：
   - 检查服务状态是否为 "RUNNING"
   - 访问健康检查端点：`https://your-backend-url.zeabur.app/api/health`
   - 应该返回：`{"status":"OK","message":"Server is running"}`

3. **数据库设置**：
   - 确保MySQL服务正常运行
   - 导入数据库结构和数据
   - 使用 `oldksports_clean_export.sql` 文件

### 4. 故障排除

如果仍然遇到问题：

1. **检查构建日志**：
   - 确保所有依赖正确安装
   - 检查Node.js版本兼容性

2. **检查运行时日志**：
   - 查看服务启动过程
   - 确认数据库连接正常

3. **环境变量验证**：
   - 确保所有必需的环境变量已设置
   - 检查数据库连接信息是否正确

## 🎯 预期结果

修复后，您应该看到：
- ✅ 后端服务状态：RUNNING
- ✅ 健康检查端点正常响应
- ✅ 数据库连接成功
- ✅ 所有API端点正常工作

## 📞 下一步

1. 在Zeabur中重新部署后端服务
2. 使用 `npm run production` 启动命令
3. 验证服务是否正常运行
4. 测试API端点功能

如果问题仍然存在，请检查Zeabur的构建和运行时日志获取更多详细信息。
