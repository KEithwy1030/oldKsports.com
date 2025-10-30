# Zeabur 2.0 版本部署指南

## 📋 部署前准备

### 1. 数据库迁移

在部署 2.0 版本之前，需要先执行数据库迁移脚本，添加 2.0 版本需要的新字段。

#### 执行步骤：

1. **访问 phpMyAdmin**
   - 打开：https://phpmyadmin-db9x.zeabur.app
   - 选择 `zeabur` 数据库

2. **执行迁移脚本**
   - 点击 SQL 标签页
   - 复制 `scripts/migrate-zeabur-to-2.0.sql` 文件中的所有内容
   - 粘贴到 SQL 输入框
   - 点击"执行"

3. **验证迁移结果**
   - 检查是否成功添加 `last_login` 字段
   - 确认所有表结构正确

### 2. Zeabur 环境变量配置

在 Zeabur 后端服务的环境变量中，**必须**设置 `MYSQL_DATABASE=zeabur`，这样 2.0 版本才能连接到正确的数据库。

#### 必需的环境变量：

```
MYSQL_HOST=${MYSQL_HOST}          # Zeabur 自动注入
MYSQL_PORT=${MYSQL_PORT}          # Zeabur 自动注入（或设置为 3306）
MYSQL_USERNAME=${MYSQL_USERNAME}  # Zeabur 自动注入
MYSQL_PASSWORD=${MYSQL_PASSWORD} # Zeabur 自动注入
MYSQL_DATABASE=zeabur             # ⚠️ 重要：必须设置为 zeabur
JWT_SECRET=${JWT_SECRET}          # 从 1.0 版本复制
NODE_ENV=production
PORT=8080                         # 或 Zeabur 自动分配的端口
```

#### 关键配置：

**在 Zeabur 后台设置 `MYSQL_DATABASE=zeabur`**，这样 2.0 版本就会：
- ✅ 直接使用现有的 `zeabur` 数据库
- ✅ 保留所有用户数据（58 个用户）
- ✅ 保留所有帖子数据（4 条帖子）
- ✅ 保留所有回复数据（7 条回复）
- ✅ 保留所有私信和通知数据

## 🚀 部署步骤

### 方案一：直接部署（推荐）

1. **执行数据库迁移**
   - 按照上述步骤执行 `migrate-zeabur-to-2.0.sql`

2. **设置环境变量**
   - 在 Zeabur 后端服务中设置 `MYSQL_DATABASE=zeabur`

3. **部署代码**
   - 将 2.0 版本代码推送到 Git
   - Zeabur 会自动构建和部署

4. **验证部署**
   - 访问网站，检查数据是否正常显示
   - 登录现有用户账号，确认功能正常

### 方案二：数据库备份（可选）

如果需要备份当前数据，可以在 phpMyAdmin 中导出：

1. **导出数据库**
   - 选择 `zeabur` 数据库
   - 点击"导出"标签
   - 选择"快速"或"自定义"导出方式
   - 点击"执行"下载 SQL 文件

2. **后续如需恢复**
   - 使用 phpMyAdmin 的"导入"功能
   - 上传之前导出的 SQL 文件

## ✅ 验证清单

部署完成后，请验证以下内容：

- [ ] 用户数据完整（58 个用户）
- [ ] 帖子数据完整（4 条帖子）
- [ ] 回复数据完整（7 条回复）
- [ ] 用户可以正常登录
- [ ] 可以正常浏览帖子
- [ ] 可以正常回复帖子
- [ ] "在线用户"功能正常（显示过去24小时登录的用户）
- [ ] 管理员功能正常

## ⚠️ 注意事项

1. **数据库名称必须正确**
   - 确保 `MYSQL_DATABASE=zeabur`（不是 `oldksports` 或 `old_k_sports`）

2. **不要清空数据**
   - 2.0 版本会直接使用现有数据库，不会清空数据
   - 只有在执行 `DELETE` 或 `TRUNCATE` 命令时才会删除数据

3. **备份建议**
   - 在部署前建议先备份 `zeabur` 数据库
   - 可以通过 phpMyAdmin 导出 SQL 文件

4. **回滚准备**
   - 如果 2.0 版本有问题，可以通过 Git 回滚到 1.0 版本
   - 数据库数据不会受影响

## 📞 问题排查

如果部署后出现问题：

1. **检查环境变量**
   - 确认 `MYSQL_DATABASE=zeabur` 已设置
   - 检查其他 MySQL 连接信息是否正确

2. **检查数据库连接**
   - 查看后端服务日志
   - 确认数据库连接成功

3. **检查表结构**
   - 确认 `users` 表有 `last_login` 字段
   - 确认所有必需的表都存在

## 🎯 总结

**最关键的一步：**

在 Zeabur 后端服务的环境变量中设置 `MYSQL_DATABASE=zeabur`，这样 2.0 版本就会自动使用现有的所有数据，无需任何数据迁移操作！

