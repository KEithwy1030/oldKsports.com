USE zeabur;

-- 添加status字段到商家表
ALTER TABLE merchants ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- 更新所有现有商家为active状态
UPDATE merchants SET status = 'active' WHERE status IS NULL;

-- 验证商家表结构
DESCRIBE merchants;

-- 验证商家数据
SELECT * FROM merchants;
