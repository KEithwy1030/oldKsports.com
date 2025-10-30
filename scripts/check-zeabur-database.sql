-- ============================================
-- 检查 zeabur 数据库结构和数据
-- ============================================
-- 用于验证数据库是否准备好部署 2.0 版本
-- ============================================

USE zeabur;

-- ============================================
-- 1. 检查表是否存在
-- ============================================
SELECT 
    TABLE_NAME AS '表名',
    TABLE_ROWS AS '记录数',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '大小(MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'zeabur'
ORDER BY TABLE_NAME;

-- ============================================
-- 2. 检查 users 表结构（重点检查 last_login 字段）
-- ============================================
SELECT 
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '类型',
    IS_NULLABLE AS '允许NULL',
    COLUMN_DEFAULT AS '默认值',
    COLUMN_COMMENT AS '说明'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'zeabur' 
  AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- 3. 统计各表数据量
-- ============================================
SELECT 
    'users' AS '表名',
    COUNT(*) AS '记录数'
FROM users
UNION ALL
SELECT 
    'forum_posts',
    COUNT(*)
FROM forum_posts
UNION ALL
SELECT 
    'forum_replies',
    COUNT(*)
FROM forum_replies
UNION ALL
SELECT 
    'messages',
    COUNT(*)
FROM messages
UNION ALL
SELECT 
    'notifications',
    COUNT(*)
FROM notifications;

-- ============================================
-- 4. 检查 last_login 字段状态
-- ============================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ last_login 字段已存在'
        ELSE '❌ last_login 字段不存在，需要执行迁移脚本'
    END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'zeabur'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'last_login';

