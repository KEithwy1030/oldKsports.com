# MySQL兼容性修复说明

## 问题描述
部署到Zeabur时出现MySQL语法错误：
- 错误代码：`ER_PARSE_ERROR` (errno: 1064)
- 错误原因：`CREATE INDEX IF NOT EXISTS` 语法不被当前MySQL版本支持
- 影响：数据库迁移失败，服务器无法启动，容器不断重启

## 修复内容

### 1. 修改的文件
- `server/migrate-database.js`

### 2. 具体修改
- **移除 `IF NOT EXISTS` 子句**：将 `CREATE INDEX IF NOT EXISTS` 改为 `CREATE INDEX`
- **添加错误处理**：当索引已存在时（错误代码 1061），忽略错误继续执行

### 3. 修改前后对比

**修改前（有问题的代码）：**
```sql
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
```

**修改后（兼容的代码）：**
```sql
CREATE INDEX idx_users_username ON users(username)
```

**错误处理逻辑：**
```javascript
if (err.code === 'ER_DUP_KEYNAME' || err.errno === 1061) {
    console.log('索引已存在，跳过创建');
    resolve(result);
}
```

## 部署步骤

### 1. 重新部署到Zeabur
由于代码已修复，需要重新部署：

1. 提交代码更改到Git仓库
2. 在Zeabur控制台触发重新部署
3. 或者推送代码到关联的Git仓库自动触发部署

### 2. 验证修复
部署完成后，检查：
- 容器是否正常启动（不再出现BackOff状态）
- 数据库迁移是否成功完成
- 应用是否正常运行

## 技术说明

### MySQL版本兼容性
- `IF NOT EXISTS` 子句在MySQL 5.7+版本中才被支持
- Zeabur可能使用较老版本的MySQL
- 移除该子句后，通过错误处理机制避免重复创建索引

### 错误处理机制
- 捕获 `ER_DUP_KEYNAME` (错误代码 1061) 错误
- 当索引已存在时，记录日志并继续执行
- 其他错误仍然会中断执行并报告

## 预期结果
- ✅ 数据库迁移成功完成
- ✅ 服务器正常启动
- ✅ 容器稳定运行，不再重启
- ✅ 应用功能正常

## 注意事项
- 此修复向后兼容，不会影响现有数据
- 如果索引已存在，会跳过创建，不会报错
- 建议在部署前备份数据库（如果有重要数据）
