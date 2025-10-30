-- ============================================
-- 数据库迁移脚本：将 zeabur 数据库升级到 2.0 版本
-- ============================================
-- 说明：此脚本会检查并添加 2.0 版本需要的新字段
-- 执行方式：在 phpMyAdmin 中执行此 SQL 脚本
-- ============================================

USE zeabur;

-- ============================================
-- 1. 添加 last_login 字段到 users 表（如果不存在）
-- ============================================
-- 用于"在线用户"功能，记录用户最后登录时间
-- ============================================
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "last_login";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column last_login already exists.' AS result;",
  "ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL AFTER updated_at;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 2. 验证迁移结果
-- ============================================
SELECT 
    '迁移完成！' AS status,
    'users 表已添加 last_login 字段' AS message,
    COUNT(*) AS total_users
FROM users;

-- ============================================
-- 3. 检查表结构（可选，用于验证）
-- ============================================
-- SHOW COLUMNS FROM users;

