# 🚀 2.0 版本上线最终检查清单

## ✅ 已完成的关键修复

### 1. 安全修复
- ✅ **已禁用危险的清空帖子API** (`/api/admin/posts/clear`)
  - 位置：`server/index.js` 第344-373行
  - 已注释，防止误操作删除所有帖子

### 2. 数据库配置
- ✅ **数据库连接使用环境变量** `MYSQL_DATABASE`
  - 代码已配置为从环境变量读取数据库名
  - 确保在 Zeabur 中设置 `MYSQL_DATABASE=zeabur`

### 3. 数据库迁移
- ✅ **自动添加 last_login 字段**
  - `server/minimal-migrate.js` 已更新
  - 启动时自动检查并添加缺失字段
  - 不会影响现有数据

### 4. 启动命令
- ✅ **zeabur.json 启动命令已修复**
  - 从 `node start-production.js` 改为 `npm start`
  - 与 `package.json` 中的脚本一致

## 📋 部署前必须执行的步骤

### 第一步：数据库迁移（在 phpMyAdmin 中执行）

1. 访问：https://phpmyadmin-db9x.zeabur.app
2. 选择 `zeabur` 数据库
3. 点击 "SQL" 标签
4. 执行以下 SQL（或使用 `scripts/migrate-zeabur-to-2.0.sql`）：

```sql
USE zeabur;

-- 检查并添加 last_login 字段
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "last_login";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column last_login already exists.' AS result;",
  "ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL AFTER updated_at;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
```

### 第二步：Zeabur 环境变量配置

**在 Zeabur 后端服务中设置以下环境变量：**

```
MYSQL_DATABASE=zeabur          ⚠️ 关键：必须设置为 zeabur
MYSQL_HOST=${MYSQL_HOST}      # Zeabur 自动注入
MYSQL_PORT=${MYSQL_PORT}       # Zeabur 自动注入（或设为 3306）
MYSQL_USERNAME=${MYSQL_USERNAME}  # Zeabur 自动注入
MYSQL_PASSWORD=${MYSQL_PASSWORD}  # Zeabur 自动注入
JWT_SECRET=${JWT_SECRET}       # 从 1.0 版本复制
NODE_ENV=production
PORT=8080                      # 或使用 Zeabur 自动分配的端口
CORS_ORIGIN=https://oldksports.com
```

**⚠️ 最关键的一步：**
确保 `MYSQL_DATABASE=zeabur` 已设置，这样 2.0 版本会：
- ✅ 自动连接到现有的 `zeabur` 数据库
- ✅ 保留所有用户数据（58 个用户）
- ✅ 保留所有帖子数据（4 条帖子）
- ✅ 保留所有回复数据（7 条回复）
- ✅ 保留所有私信和通知数据

### 第三步：推送代码到 GitHub

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 升级到 2.0 版本 - 禁用危险API，添加数据库迁移，兼容zeabur数据库"

# 推送到 GitHub（覆盖 1.0 版本）
git push origin main
```

### 第四步：Zeabur 自动部署

- Zeabur 会自动检测 Git 推送
- 自动构建和部署 2.0 版本
- 确保环境变量已正确配置

## ✅ 部署后验证清单

部署完成后，请验证：

- [ ] 网站正常访问
- [ ] 用户数据完整（58 个用户）
- [ ] 帖子数据完整（4 条帖子）
- [ ] 回复数据完整（7 条回复）
- [ ] 用户可以正常登录
- [ ] 可以正常浏览帖子
- [ ] 可以正常回复帖子
- [ ] "在线用户"功能正常（显示过去24小时登录的用户）
- [ ] 管理员功能正常
- [ ] 清空帖子API已禁用（无法调用）

## 🎯 关键要点总结

1. **数据库名称**：确保 `MYSQL_DATABASE=zeabur`（不是 `oldksports` 或 `old_k_sports`）
2. **数据安全**：已禁用危险的清空帖子API
3. **自动迁移**：服务器启动时会自动添加 `last_login` 字段
4. **数据保留**：所有现有数据都会保留，无需导出/导入

## ⚠️ 重要提醒

- **不要手动执行数据库清空操作**
- **确保备份数据库**（虽然数据会保留，但建议备份）
- **测试环境变量**配置是否正确
- **监控部署日志**，确认数据库连接成功

## 📞 问题排查

如果部署后出现问题：

1. **检查环境变量**：确认 `MYSQL_DATABASE=zeabur` 已设置
2. **检查数据库连接**：查看后端服务日志，确认连接成功
3. **检查表结构**：确认 `users` 表有 `last_login` 字段
4. **检查启动命令**：确认使用的是 `npm start`

---

**准备好了吗？按照上述步骤执行，2.0 版本就会安全地上线，同时保留所有用户和帖子数据！** 🚀

