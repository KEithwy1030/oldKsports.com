USE zeabur;

-- 确保商家表有正确的字段结构
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;

-- 插入测试商家数据
INSERT IGNORE INTO merchants (id, name, description, contact_info, category, rating) VALUES
(1, '体育用品商城', '专业体育用品供应商', 'contact@sportsmall.com', '体育用品', 4.5),
(2, '健身器材专营', '高品质健身器材', 'info@fitnessequip.com', '健身器材', 4.2),
(3, '运动服装品牌', '时尚运动服装', 'sales@sportswear.com', '服装', 4.8);

-- 验证商家表数据
SELECT * FROM merchants;
