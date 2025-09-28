-- 修复avatar字段长度问题
-- 在phpMyAdmin中执行此SQL

USE zeabur;

-- 修改avatar字段类型为TEXT
ALTER TABLE users MODIFY COLUMN avatar TEXT DEFAULT NULL;

-- 验证修改结果
DESCRIBE users;

-- 检查现有数据
SELECT id, username, LENGTH(avatar) as avatar_length FROM users WHERE avatar IS NOT NULL;
