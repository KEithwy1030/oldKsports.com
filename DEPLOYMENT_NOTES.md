# 部署注意事项

## 文件持久化问题

### 当前状态
- 上传文件保存在容器文件系统 (`server/uploads/images` 和 `server/public/uploads/images`)
- 容器重启/扩容会导致文件丢失

### 解决方案

#### 方案A：使用Zeabur持久卷（推荐）
1. 在Zeabur控制台中为后端服务添加持久卷
2. 映射以下路径到持久卷：
   - `/app/uploads` -> 持久卷
   - `/app/public/uploads` -> 持久卷

#### 方案B：使用对象存储（最佳实践）
1. 配置Zeabur Object Storage或外部S3兼容存储
2. 修改上传逻辑，直接上传到对象存储
3. 返回CDN/公网可访问的URL

### 当前临时解决方案
- 文件会保存在容器中，重启会丢失
- 建议在生产环境中尽快实施持久化方案

## 环境变量配置

### 必须在Zeabur控制台中设置的环境变量：
- `MYSQL_PASSWORD`: MySQL数据库密码
- `JWT_SECRET`: JWT签名密钥

### 可选环境变量：
- `MYSQL_HOST`: 数据库主机（默认：mysql.zeabur.internal）
- `MYSQL_PORT`: 数据库端口（默认：3306）
- `MYSQL_USERNAME`: 数据库用户名（默认：root）
- `MYSQL_DATABASE`: 数据库名称（默认：old_k_sports）
- `PORT`: 服务端口（默认：8080）
- `CORS_ORIGIN`: 前端域名（默认：https://oldksports.zeabur.app）
- `VITE_API_URL`: 前端API地址（默认：https://oldksports-backend.zeabur.app/api）

## 部署验证清单

### 后端验证：
- [ ] 服务启动成功，监听8080端口
- [ ] 数据库连接成功
- [ ] `/api/health` 返回200状态
- [ ] `/api/merchants` 返回商家数据
- [ ] 用户注册/登录功能正常

### 前端验证：
- [ ] 静态文件构建成功
- [ ] 页面正常加载
- [ ] API调用无CORS错误
- [ ] 登录/注册功能正常
- [ ] 帖子发布功能正常
- [ ] 图片上传功能正常

### 持久化验证：
- [ ] 上传图片后重启服务，图片仍可访问（需要持久化方案）
- [ ] 用户数据在重启后保持
- [ ] 帖子数据在重启后保持
