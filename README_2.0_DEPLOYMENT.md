# 🚀 2.0 版本上线说明

## 📋 概述

本文档说明如何将 2.0 版本安全地部署到生产环境，同时**保留所有现有的用户和帖子数据**。

## ✅ 已完成的准备工作

### 1. 安全加固
- ✅ 已禁用危险的清空帖子API (`/api/admin/posts/clear`)
- ✅ 已添加数据保护措施

### 2. 数据库兼容性
- ✅ 代码已配置为使用环境变量 `MYSQL_DATABASE`
- ✅ 自动数据库迁移脚本已更新（添加 `last_login` 字段）
- ✅ 迁移脚本不会影响现有数据

### 3. 配置优化
- ✅ `zeabur.json` 启动命令已修复
- ✅ 数据库连接配置已优化

## 🎯 关键发现

**1.0 版本实际使用的数据库：`zeabur`**

经过检查，1.0 版本在生产环境中实际使用的数据库是 `zeabur`，而不是代码中默认的 `old_k_sports`。

**数据库现状：**
- ✅ `zeabur` 数据库：包含所有生产数据
  - 58 个用户
  - 4 条帖子
  - 7 条回复
  - 2 条私信
  - 93 条通知
- ❌ `oldksports` 数据库：空数据库（无表）

## 📝 部署步骤

### 步骤 1：数据库迁移（推荐在部署前执行）

**选项 A：使用 phpMyAdmin（推荐）**

1. 访问：https://phpmyadmin-db9x.zeabur.app
2. 选择 `zeabur` 数据库
3. 点击 "SQL" 标签
4. 执行 `scripts/migrate-zeabur-to-2.0.sql` 中的 SQL

**选项 B：自动迁移（服务器启动时）**

2.0 版本服务器启动时会自动检查并添加 `last_login` 字段，无需手动操作。

### 步骤 2：Zeabur 环境变量配置

**⚠️ 最关键的一步：**

在 Zeabur 后端服务的环境变量中设置：

```
MYSQL_DATABASE=zeabur
```

**完整环境变量列表：**

```
# 数据库配置（Zeabur 会自动注入大部分，但数据库名需要手动设置）
MYSQL_DATABASE=zeabur              ⚠️ 必须手动设置为 zeabur
MYSQL_HOST=${MYSQL_HOST}           # Zeabur 自动注入
MYSQL_PORT=${MYSQL_PORT}           # Zeabur 自动注入
MYSQL_USERNAME=${MYSQL_USERNAME}   # Zeabur 自动注入
MYSQL_PASSWORD=${MYSQL_PASSWORD}   # Zeabur 自动注入

# 应用配置
JWT_SECRET=${JWT_SECRET}           # 从 1.0 版本复制
NODE_ENV=production
PORT=8080                          # 或 Zeabur 自动分配
CORS_ORIGIN=https://oldksports.com
```

### 步骤 3：推送代码到 GitHub

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 升级到 2.0 版本 - 兼容zeabur数据库，禁用危险API，自动数据库迁移"

# 推送到 GitHub（覆盖 1.0 版本）
git push origin main
```

### 步骤 4：Zeabur 自动部署

- Zeabur 会自动检测到 Git 推送
- 自动构建和部署 2.0 版本
- 服务器启动时会自动执行数据库迁移

## 🔒 数据安全保障

### 已采取的保护措施：

1. **禁用危险API**
   - `/api/admin/posts/clear` 已注释，无法调用
   - 防止误操作删除所有帖子

2. **数据库迁移安全**
   - 只添加新字段，不删除现有数据
   - 迁移失败不会阻止服务器启动
   - 所有操作都有错误处理

3. **环境变量验证**
   - 生产环境必须配置所有必需的环境变量
   - 缺少配置时服务器不会启动

## ✅ 部署后验证

部署完成后，请验证：

- [ ] 网站正常访问
- [ ] 用户数据完整（58 个用户）
- [ ] 帖子数据完整（4 条帖子）
- [ ] 回复数据完整（7 条回复）
- [ ] 用户可以正常登录
- [ ] 可以正常浏览和回复帖子
- [ ] "在线用户"功能正常
- [ ] 管理员功能正常

## ⚠️ 重要提醒

1. **数据库名称**：必须设置为 `zeabur`，否则会连接到错误的数据库
2. **数据备份**：虽然数据会保留，但建议先备份 `zeabur` 数据库
3. **测试环境**：如果有测试环境，建议先在测试环境验证
4. **监控日志**：部署后监控服务器日志，确认数据库连接成功

## 📞 故障排查

### 如果部署后数据不显示：

1. **检查环境变量**
   ```bash
   # 在 Zeabur 后端服务中检查
   MYSQL_DATABASE=zeabur  # 必须设置为 zeabur
   ```

2. **检查数据库连接日志**
   - 查看后端服务日志
   - 确认显示 "Using database name: zeabur"

3. **检查表结构**
   - 在 phpMyAdmin 中确认 `zeabur` 数据库存在
   - 确认表中有数据

## 🎉 总结

**最关键的一步：**
在 Zeabur 后端服务中设置 `MYSQL_DATABASE=zeabur`，这样 2.0 版本就会：
- ✅ 自动连接到现有的 `zeabur` 数据库
- ✅ 保留所有用户和帖子数据
- ✅ 自动添加新功能需要的字段
- ✅ 安全地升级到 2.0 版本

**数据保护：**
- ✅ 所有数据都会保留
- ✅ 只添加新字段，不删除数据
- ✅ 危险的API已禁用

准备好后，按照上述步骤执行即可！🚀

