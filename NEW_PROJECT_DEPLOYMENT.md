# 🚀 2.0 版本作为新项目部署指南

## 📋 概述

本文档说明如何将 2.0 版本作为**全新的独立项目**部署到 Zeabur，**不依赖任何旧数据**。

## ✅ 优势

- ✅ 完全独立，不影响 1.0 版本
- ✅ 自动创建完整数据库结构
- ✅ 干净的数据库环境
- ✅ 可随时切换回旧库

## 🎯 部署步骤

### 第一步：在 Zeabur 创建新 MySQL 服务

1. 登录 Zeabur 控制台
2. 点击 "Add Service" → "Database" → "MySQL"
3. 记下数据库信息：
   - `MYSQL_HOST`
   - `MYSQL_PORT` (默认 3306)
   - `MYSQL_USERNAME`
   - `MYSQL_PASSWORD`

### 第二步：配置 zeabur.json

确保 `zeabur.json` 配置如下：

```json
{
  "name": "oldksports-2.0",
  "services": [
    {
      "name": "backend",
      "source": {
        "type": "git",
        "rootDir": "."
      },
      "deploy": {
        "type": "docker",
        "dockerfile": "Dockerfile.server"
      },
      "env": {
        "NODE_ENV": "production",
        "PORT": "8080",
        "CORS_ORIGIN": "https://your-domain.com",
        "JWT_SECRET": "your-secret-key-here",
        "MYSQL_HOST": "${MYSQL_HOST}",
        "MYSQL_PORT": "${MYSQL_PORT}",
        "MYSQL_USERNAME": "${MYSQL_USERNAME}",
        "MYSQL_PASSWORD": "${MYSQL_PASSWORD}",
        "MYSQL_DATABASE": "zeabur_v2"
      }
    }
  ]
}
```

**关键配置：**
- `MYSQL_DATABASE`: 设置为新数据库名称，如 `zeabur_v2` 或 `oldksports_v2`
- 所有 `${...}` 由 Zeabur 自动注入

### 第三步：推送代码

```bash
git add .
git commit -m "feat: 2.0版本作为新项目部署，支持自动初始化数据库"
git push origin main
```

### 第四步：自动化初始化

服务器启动时会自动检测：

1. **如果数据库为空** → 自动执行 `database_init_schema.sql` 创建所有表
2. **如果数据库有表** → 只添加 `last_login` 字段

无需手动操作！

## 📊 数据库表结构

初始化完成后将包含：

| 表名 | 说明 | 必填 |
|-----|------|-----|
| users | 用户表 | ✅ |
| forum_posts | 论坛帖子 | ✅ |
| forum_replies | 回复 | ✅ |
| notifications | 通知 | ✅ |
| messages | 私信 | ✅ |
| merchants | 商户 | ✅ |
| blacklist | 黑名单 | ✅ |
| merchant_reviews | 商户评价 | ✅ |

## 🔐 创建第一个管理员账号

### 方法一：直接在数据库创建（推荐）

在 Zeabur MySQL 服务中执行：

```sql
USE zeabur_v2;  -- 替换为你的数据库名

INSERT INTO users (username, email, password, is_admin, role) 
VALUES ('admin', 'admin@oldksports.com', '$2b$10$8tr8vrgRdHBJ42lKB92jl.GJd5Sl9xG8MYZFNBZW58hEqqodCIGC2', 1, '管理员');
```

**默认密码：** `admin123` (已在代码中配置为管理员)

### 方法二：使用前端注册

1. 访问部署地址
2. 注册新账号
3. 在数据库中手动设置 `is_admin = 1`

## ⚠️ 重要提示

### 数据隔离

- ✅ 新项目使用独立的 MySQL 服务
- ✅ 不影响 1.0 版本的任何数据
- ✅ 可以随时切换回旧数据库

### 环境变量

**必须**在新项目的环境变量中设置 `MYSQL_DATABASE`，例如：
- `MYSQL_DATABASE=zeabur_v2`
- `MYSQL_DATABASE=oldksports_v2`

**不能**使用 `zeabur`（会被 1.0 版本使用）

### JWT_SECRET

**必须**设置新的 `JWT_SECRET`，不能与 1.0 版本相同

## 🎉 部署后验证

- [ ] 网站正常访问
- [ ] 可以注册新用户
- [ ] 可以创建帖子
- [ ] 数据库表结构正确（8个表）
- [ ] 可以正常登录

## 📞 故障排查

### 问题：表未自动创建

**原因：** `database_init_schema.sql` 文件路径错误

**解决：** 检查文件是否在项目根目录

### 问题：连接数据库失败

**原因：** 环境变量未正确设置

**解决：** 检查 Zeabur 环境变量中是否包含所有必需变量

### 问题：500 错误

**原因：** 可能是商户/黑名单相关API缺少表

**解决：** 查看服务器日志，确认具体表是否存在

## 🔄 切换回旧数据库

如果想切换回 1.0 的数据库：

1. 在 Zeabur 中修改环境变量：
   ```
   MYSQL_DATABASE=zeabur
   ```

2. 重新部署

服务器会自动检测并只添加兼容性字段，不会影响现有数据。

## 📝 总结

**作为新项目部署的核心优势：**
- ✅ 数据完全隔离
- ✅ 自动初始化数据库
- ✅ 不影响 1.0 版本
- ✅ 可随时切换

准备好后，按照上述步骤执行即可！🚀

