-- 修复头像字段长度限制问题
-- 将avatar字段从VARCHAR(255)改为TEXT类型，支持更长的Base64数据

USE zeabur;

-- 修改avatar字段类型为TEXT，支持更长的数据
ALTER TABLE users MODIFY COLUMN avatar TEXT DEFAULT NULL;

-- 验证修改结果
DESCRIBE users;

-- 检查现有数据
SELECT id, username, LENGTH(avatar) as avatar_length FROM users WHERE avatar IS NOT NULL LIMIT 5;
