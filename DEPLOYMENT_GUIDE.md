# 🚀 Old K Sports - Zeabur 部署指南

## 📋 环境变量配置

### 前端服务 (Frontend)
| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `VITE_API_URL` | 后端API地址 | `https://oldksports-backend.zeabur.app/api` |

### 后端服务 (Backend)
| 变量名 | 说明 | 示例值 | 配置方式 |
|--------|------|--------|----------|
| `NODE_ENV` | 运行环境 | `production` | 自动设置 |
| `PORT` | 服务端口 | `8080` | 自动设置 |
| `CORS_ORIGIN` | 允许的前端域名 | `https://oldksports.zeabur.app` | 自动设置 |
| `MYSQL_HOST` | 数据库主机 | `mysql.zeabur.internal` | **手动设置** |
| `MYSQL_PORT` | 数据库端口 | `3306` | 自动设置 |
| `MYSQL_USERNAME` | 数据库用户名 | `root` | **手动设置** |
| `MYSQL_PASSWORD` | 数据库密码 | `你的密码` | **手动设置** |
| `MYSQL_DATABASE` | 数据库名称 | `old_k_sports` | 自动设置 |
| `JWT_SECRET` | JWT密钥 | `强随机字符串` | **手动设置** |

## 🔧 Zeabur 部署步骤

### 1. 数据库绑定与配置

#### 1.1 确认服务绑定
- ✅ 确保**后端服务**和**MySQL实例**在同一项目中
- ✅ 确认MySQL实例状态为"Running"
- ✅ 在MySQL服务中创建数据库：`old_k_sports`

#### 1.2 设置环境变量
在Zeabur控制台 → 后端服务 → Environment/Secrets：

**必需手动设置的变量：**
```
MYSQL_HOST=mysql.zeabur.internal
MYSQL_USERNAME=root
MYSQL_PASSWORD=你的MySQL密码
JWT_SECRET=强随机字符串(建议32位以上)
```

### 2. 创建生产管理员账号

#### 2.1 执行管理员账号修复脚本
在Zeabur控制台 → 后端服务 → Run Command：
```bash
npm run admin:fix
```

#### 2.2 预期输出
```
=== 开始修复生产环境管理员账号 ===
管理员账号信息:
  邮箱: 552319164@qq.com
  用户名: 老k
  密码: Kk19941030
  积分: 210
✅ 管理员账号创建成功
=== 管理员账号修复完成 ===
🎯 可用登录信息:
   邮箱: 552319164@qq.com
   密码: Kk19941030
```

### 3. 重新部署服务
- 保存环境变量设置
- 触发后端服务重新部署
- 等待部署完成（通常2-3分钟）

## ✅ 验证清单

### 基础连通性验证
- [ ] **GET /api/health** 返回 `200` 且 `{"status":"OK"}`
- [ ] 后端服务状态为"Running"
- [ ] 数据库连接成功（Runtime Logs显示"✅ Successfully connected to the database."）

### 管理员功能验证
- [ ] **管理员登录测试**
  - 账号：`552319164@qq.com`
  - 密码：`Kk19941030`
  - 预期：成功获取token，可进入管理界面

- [ ] **管理员权限验证**
  - 请求：`GET /api/admin/check`
  - 头部：`Authorization: Bearer <token>`
  - 预期：返回 `{"isAdmin": true}`

### 核心功能验证
- [ ] **用户注册/登录**：新用户可正常注册和登录
- [ ] **论坛发帖**：可正常创建和查看帖子
- [ ] **图片上传**：可正常上传和显示图片
- [ ] **服务重启测试**：重启后服务仍可正常连接数据库

## 🔍 故障排除

### 数据库连接超时 (ETIMEDOUT)
**可能原因：**
1. MySQL服务未启动或绑定错误
2. 环境变量配置错误
3. 网络连接问题

**解决步骤：**
1. 检查MySQL服务状态
2. 验证环境变量设置
3. 确认服务在同一项目中
4. 检查Internal Hostname是否正确

### 管理员账号无法登录
**可能原因：**
1. 管理员账号未创建
2. 密码不匹配
3. JWT_SECRET未设置

**解决步骤：**
1. 重新执行 `npm run admin:fix`
2. 检查Runtime Logs确认账号创建成功
3. 验证JWT_SECRET环境变量

### 前端无法连接后端
**可能原因：**
1. CORS配置错误
2. API URL配置错误
3. 后端服务未启动

**解决步骤：**
1. 检查 `VITE_API_URL` 配置
2. 验证 `CORS_ORIGIN` 设置
3. 确认后端服务状态

## 📁 文件持久化说明

**当前状态：** 用户上传的图片保存在容器文件系统中，服务重启会丢失。

**推荐解决方案：**
1. **对象存储**（推荐）：使用Zeabur Object Storage或AWS S3
2. **持久卷**：使用Zeabur Volume挂载到容器

**临时解决方案：** 当前可正常使用，但需注意数据备份。

## 🔐 安全注意事项

- ✅ 敏感信息已从代码仓库中移除
- ✅ 环境变量通过Zeabur控制台安全注入
- ✅ JWT密钥使用强随机字符串
- ✅ 数据库密码通过安全方式配置

## 📞 技术支持

如遇到部署问题，请提供：
1. Zeabur Runtime Logs
2. 环境变量配置截图
3. 错误信息详情
4. 服务状态信息
