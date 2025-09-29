-- 修复用户表，添加缺失的roles和role字段
USE old_k_sports;

-- 添加role字段（单身份）
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT '用户' COMMENT '身份：主播、甲方、服务商、用户等';

-- 添加roles字段（多身份标签）
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles JSON DEFAULT NULL COMMENT '多身份标签：["主播", "甲方", "服务商"]';

-- 验证字段是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'old_k_sports' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME IN ('role', 'roles');
