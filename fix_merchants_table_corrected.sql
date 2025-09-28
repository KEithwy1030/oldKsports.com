USE zeabur;

-- 检查商家表是否存在必要字段，如果不存在则添加
-- 注意：MySQL不支持ADD COLUMN IF NOT EXISTS，需要先检查

-- 添加category字段（如果不存在）
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'zeabur' 
     AND TABLE_NAME = 'merchants' 
     AND COLUMN_NAME = 'category') = 0,
    'ALTER TABLE merchants ADD COLUMN category VARCHAR(50) DEFAULT "general"',
    'SELECT "category字段已存在"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加logo_url字段（如果不存在）
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'zeabur' 
     AND TABLE_NAME = 'merchants' 
     AND COLUMN_NAME = 'logo_url') = 0,
    'ALTER TABLE merchants ADD COLUMN logo_url VARCHAR(255)',
    'SELECT "logo_url字段已存在"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加rating字段（如果不存在）
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'zeabur' 
     AND TABLE_NAME = 'merchants' 
     AND COLUMN_NAME = 'rating') = 0,
    'ALTER TABLE merchants ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00',
    'SELECT "rating字段已存在"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 插入测试商家数据
INSERT IGNORE INTO merchants (id, name, description, contact_info, category, rating) VALUES
(1, '体育用品商城', '专业体育用品供应商', 'contact@sportsmall.com', '体育用品', 4.5),
(2, '健身器材专营', '高品质健身器材', 'info@fitnessequip.com', '健身器材', 4.2),
(3, '运动服装品牌', '时尚运动服装', 'sales@sportswear.com', '服装', 4.8);

-- 验证商家表数据
SELECT * FROM merchants;
