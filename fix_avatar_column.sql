-- 修复avatar字段长度问题
-- 将avatar字段从VARCHAR(255)改为TEXT，以支持更长的Base64数据

USE zeabur;

-- 修改avatar字段类型为TEXT
ALTER TABLE users MODIFY COLUMN avatar TEXT DEFAULT NULL;

-- 验证修改结果
DESCRIBE users;
