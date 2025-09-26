# OldKSports - 体育社区论坛

一个现代化的体育社区论坛应用，支持用户注册、发帖、回复、私信等功能。

## 🚀 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Axios** - HTTP客户端

### 后端
- **Node.js** + **Express**
- **MySQL** - 数据库
- **JWT** - 身份认证
- **Multer** - 文件上传
- **bcryptjs** - 密码加密

### 部署
- **Zeabur** - 云平台部署
- **Docker** - 容器化

## 📁 项目结构

```
OldKSports-Production/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript类型
│   ├── public/            # 静态资源
│   └── dist/              # 构建输出
├── server/                # 后端应用
│   ├── controllers/       # 控制器
│   ├── services/         # 业务逻辑
│   ├── routes/           # 路由定义
│   ├── middleware/       # 中间件
│   ├── public/          # 静态文件
│   └── uploads/          # 上传文件
├── zeabur.json           # Zeabur部署配置
└── README.md             # 项目说明
```

## 🛠️ 开发环境设置

### 前端开发
```bash
cd client
npm install
npm run dev
```

### 后端开发
```bash
cd server
npm install
npm start
```

## 🚀 部署说明

### Zeabur部署
1. 连接GitHub仓库
2. 配置环境变量
3. 自动构建和部署

### 环境变量
```env
# 数据库配置
MYSQL_HOST=your-mysql-host
MYSQL_USERNAME=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=your-database

# JWT配置
JWT_SECRET=your-jwt-secret

# CORS配置
CORS_ORIGIN=your-frontend-url
```

## 📋 功能特性

### 用户功能
- ✅ 用户注册/登录
- ✅ 用户资料管理
- ✅ 头像上传
- ✅ 积分等级系统

### 论坛功能
- ✅ 发布帖子
- ✅ 回复帖子
- ✅ 图片上传
- ✅ 分类管理
- ✅ 搜索功能

### 管理功能
- ✅ 管理员权限
- ✅ 帖子管理
- ✅ 用户管理
- ✅ 黑名单管理

### 社交功能
- ✅ 私信系统
- ✅ 通知系统
- ✅ @提及功能
- ✅ 用户等级

## 🔧 开发指南

### 添加新功能
1. 在`client/src/pages/`添加页面组件
2. 在`server/controllers/`添加控制器
3. 在`server/routes/`添加路由
4. 更新数据库schema

### 数据库迁移
项目包含完整的数据库迁移脚本，支持：
- 自动创建表结构
- 数据迁移
- 索引优化

## 📞 支持

如有问题，请查看：
- [部署指南](DEPLOYMENT_GUIDE.md)
- [故障排除](TROUBLESHOOTING_GUIDE.md)
- [测试清单](test_checklist.md)

## 📄 许可证

MIT License