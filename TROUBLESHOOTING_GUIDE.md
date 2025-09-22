# 🔧 Old K Sports - Zeabur 部署故障排除指南

## 🚨 当前问题诊断

### 错误信息分析
```
FATAL: Error getting database connection: Error: Access denied for user 'root'@'172.31.30.50' (using password: YES)
MYSQL_DATABASE: ${MYSQL_DATABASE}  // 环境变量未解析
```

### 根本原因
1. **环境变量未正确解析** - Zeabur服务引用语法问题
2. **数据库连接权限问题** - MySQL用户权限配置
3. **服务绑定问题** - 后端服务与MySQL服务未正确绑定

## 🛠️ 解决方案

### 方案1：修复环境变量配置（推荐）

#### 1.1 更新 zeabur.json 配置
```json
{
  "env": {
    "MYSQL_HOST": "service-68d15b2c030e2df4a569eaa5.zeabur.internal",
    "MYSQL_USERNAME": "root",
    "MYSQL_PASSWORD": "${MYSQL_ROOT_PASSWORD}",
    "MYSQL_DATABASE": "${MYSQL_DATABASE}",
    "JWT_SECRET": "OldKSports_Production_JWT_Secret_2024_Zeabur_Deployment"
  }
}
```

#### 1.2 在Zeabur控制台手动设置环境变量
**后端服务** → **Environment/Secrets**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MYSQL_HOST` | `service-68d15b2c030e2df4a569eaa5.zeabur.internal` | MySQL服务内部地址 |
| `MYSQL_USERNAME` | `root` | MySQL用户名 |
| `MYSQL_PASSWORD` | `从MySQL服务获取` | MySQL密码 |
| `MYSQL_DATABASE` | `old_k_sports` | 数据库名称 |
| `JWT_SECRET` | `OldKSports_Production_JWT_Secret_2024_Zeabur_Deployment` | JWT密钥 |

### 方案2：验证服务绑定

#### 2.1 检查服务绑定状态
1. 进入Zeabur项目控制台
2. 确认MySQL服务状态为"Running"
3. 确认后端服务与MySQL服务在同一项目中
4. 检查服务间的网络连接

#### 2.2 验证MySQL服务配置
1. 进入MySQL服务控制台
2. 检查数据库是否已创建：`old_k_sports`
3. 验证用户权限配置
4. 确认密码设置

### 方案3：数据库连接测试

#### 3.1 使用临时测试脚本
创建 `test-db-connection.js`：
```javascript
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT || 3306
    });

    connection.connect((err) => {
        if (err) {
            console.error('❌ 连接失败:', err);
        } else {
            console.log('✅ 连接成功');
        }
        connection.end();
    });
};

testConnection();
```

#### 3.2 在Zeabur控制台执行测试
```bash
node test-db-connection.js
```

## 🔍 调试步骤

### 步骤1：检查环境变量
在Runtime Logs中查找：
```
=== Database Connection Debug ===
MYSQL_HOST: service-68d15b2c030e2df4a569eaa5.zeabur.internal
MYSQL_USERNAME: root
MYSQL_PASSWORD: ***
MYSQL_DATABASE: old_k_sports
```

### 步骤2：验证数据库连接
查找日志中的连接状态：
```
✅ Successfully connected to the database
📊 Connection pool created successfully
```

### 步骤3：检查数据库迁移
查找迁移日志：
```
🔄 开始最小化数据库迁移...
✅ 用户表创建成功
✅ 论坛帖子表创建成功
✅ 数据库迁移完成！
```

## 🚀 部署验证清单

### 基础验证
- [ ] 后端服务状态：RUNNING
- [ ] 数据库连接：成功
- [ ] 环境变量：正确解析
- [ ] 数据库迁移：完成

### API验证
- [ ] GET `/api/health` → `{"status":"OK"}`
- [ ] GET `/api/admin/check` → 需要认证
- [ ] POST `/api/auth/login` → 登录功能

### 功能验证
- [ ] 用户注册/登录
- [ ] 论坛发帖
- [ ] 图片上传
- [ ] 管理员功能

## 🔧 常见问题解决

### Q1: 环境变量显示 `${MYSQL_DATABASE}` 未解析
**解决方案：**
1. 检查zeabur.json中的语法
2. 在Zeabur控制台手动设置环境变量
3. 确保使用正确的服务引用语法

### Q2: Access denied for user 'root'
**解决方案：**
1. 验证MySQL密码是否正确
2. 检查用户权限配置
3. 确认数据库名称正确

### Q3: 服务无法启动
**解决方案：**
1. 检查所有必需的环境变量
2. 验证数据库连接配置
3. 查看详细的错误日志

## 📞 技术支持

如问题持续存在，请提供：
1. **完整的Runtime Logs**
2. **环境变量配置截图**
3. **服务状态信息**
4. **MySQL服务配置截图**

## 🎯 预期结果

修复完成后，您应该看到：
```
✅ Successfully connected to the database
📊 Connection pool created successfully
🔄 开始最小化数据库迁移...
✅ 用户表创建成功
✅ 论坛帖子表创建成功
🎉 数据库迁移完成！
Backend server is running on port 8080!
```
