# 自定义域名配置指南

## 🎯 **配置目标**
将网站从 `oldksports.zeabur.app` 迁移到自定义域名 `oldksports.com`

## 📋 **已完成的代码修改**

### **1. zeabur.json 配置更新**
```json
{
  "services": [
    {
      "name": "frontend",
      "env": {
        "VITE_API_URL": "https://oldksports.com/api"  // ✅ 已更新
      }
    },
    {
      "name": "backend", 
      "env": {
        "CORS_ORIGIN": "https://oldksports.com"  // ✅ 已更新
      }
    }
  ]
}
```

### **2. nginx.conf 代理配置更新**
```nginx
location /api/ {
    proxy_pass https://oldksports.com;  // ✅ 已更新
    # ... 其他配置保持不变
}
```

### **3. CORS 配置已支持**
```javascript
// server/index.js 中已包含
const corsOrigins = [
  "https://oldksports.com",  // ✅ 已包含
  // ... 其他域名
];
```

## 🚀 **Zeabur 管理后台配置步骤**

### **步骤 1: 添加自定义域名**
1. 登录 Zeabur 管理后台
2. 进入项目 `oldksports-production`
3. 选择前端服务 `frontend`
4. 点击 "Domains" 或 "域名" 选项
5. 添加自定义域名：`oldksports.com`
6. 添加 www 子域名：`www.oldksports.com`（可选）

### **步骤 2: 配置后端服务域名**
1. 选择后端服务 `backend`
2. 点击 "Domains" 或 "域名" 选项  
3. 添加自定义域名：`oldksports.com`
4. 或者使用子域名：`api.oldksports.com`（推荐）

### **步骤 3: 更新环境变量**
如果使用子域名方案，需要更新环境变量：

**前端服务环境变量：**
```
VITE_API_URL=https://api.oldksports.com/api
```

**后端服务环境变量：**
```
CORS_ORIGIN=https://oldksports.com
```

## 🔧 **DNS 配置**

### **域名解析设置**
在域名注册商（如阿里云、腾讯云等）添加以下 DNS 记录：

```
类型: CNAME
名称: @
值: oldksports-frontend.zeabur.app

类型: CNAME  
名称: www
值: oldksports-frontend.zeabur.app

类型: CNAME
名称: api
值: oldksports-backend.zeabur.app
```

## ✅ **验证配置**

### **1. 检查域名解析**
```bash
# 检查主域名
nslookup oldksports.com

# 检查 www 子域名
nslookup www.oldksports.com

# 检查 API 子域名（如果使用）
nslookup api.oldksports.com
```

### **2. 测试网站功能**
1. 访问 `https://oldksports.com`
2. 测试用户注册/登录
3. 测试发帖功能
4. 测试图片上传
5. 检查控制台是否有 CORS 错误

### **3. 检查 API 连接**
打开浏览器开发者工具，查看 Network 标签：
- 确认 API 请求指向正确的域名
- 检查是否有 404 或 CORS 错误

## 🚨 **注意事项**

### **SSL 证书**
- Zeabur 会自动为自定义域名配置 SSL 证书
- 等待 5-10 分钟让证书生效

### **缓存清理**
- 清除浏览器缓存
- 清除 DNS 缓存：`ipconfig /flushdns`（Windows）

### **回退方案**
如果自定义域名配置失败，可以：
1. 在 Zeabur 中移除自定义域名
2. 恢复使用 `oldksports.zeabur.app`
3. 检查 DNS 配置是否正确

## 📞 **技术支持**

如果遇到问题，请检查：
1. DNS 解析是否正确
2. Zeabur 服务是否正常运行
3. 环境变量是否正确设置
4. 浏览器控制台是否有错误信息

---

**配置完成后，网站将完全使用自定义域名 `oldksports.com` 运行！** 🎉
