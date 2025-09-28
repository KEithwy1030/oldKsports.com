-- Old K Sports 完美数据库导入文件
-- 确保一次性导入成功，无需额外操作

-- 使用zeabur数据库
USE zeabur;

-- ============================================
-- 第一步：彻底清理数据库
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- 删除所有可能存在的表
DROP TABLE IF EXISTS blacklist;
DROP TABLE IF EXISTS merchant_reviews;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS forum_replies;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS users;

-- 删除WordPress相关表（如果存在）
DROP TABLE IF EXISTS wp_commentmeta;
DROP TABLE IF EXISTS wp_comments;
DROP TABLE IF EXISTS wp_links;
DROP TABLE IF EXISTS wp_options;
DROP TABLE IF EXISTS wp_postmeta;
DROP TABLE IF EXISTS wp_posts;
DROP TABLE IF EXISTS wp_term_relationships;
DROP TABLE IF EXISTS wp_term_taxonomy;
DROP TABLE IF EXISTS wp_terms;
DROP TABLE IF EXISTS wp_usermeta;
DROP TABLE IF EXISTS wp_users;
DROP TABLE IF EXISTS wp_messages;
DROP TABLE IF EXISTS wp_admin_log;
DROP TABLE IF EXISTS wp_admin_menu;
DROP TABLE IF EXISTS wp_admin_user;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 第二步：创建表结构（按依赖顺序）
-- ============================================

-- 1. 用户表（最基础）
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    points INT DEFAULT 0,
    level VARCHAR(20) DEFAULT 'bronze',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255) DEFAULT NULL,
    has_uploaded_avatar BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT '用户',
    roles JSON DEFAULT NULL,
    total_posts INT DEFAULT 0,
    total_replies INT DEFAULT 0,
    consecutive_checkins INT DEFAULT 0,
    last_checkin_date DATE DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 商家表（独立表）
CREATE TABLE merchants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_info VARCHAR(255),
    website VARCHAR(255),
    category VARCHAR(50) DEFAULT 'general',
    logo_url VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. 论坛帖子表（依赖users）
CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 论坛回复表（依赖forum_posts和users）
CREATE TABLE forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. 通知表（依赖users）
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. 消息表（依赖users）
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. 商家评价表（依赖merchants和users）
CREATE TABLE merchant_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. 黑名单表（依赖users）
CREATE TABLE blacklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. 用户统计表（依赖users）
CREATE TABLE user_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_posts INT DEFAULT 0,
    total_replies INT DEFAULT 0,
    total_likes_received INT DEFAULT 0,
    total_views_received INT DEFAULT 0,
    consecutive_checkins INT DEFAULT 0,
    last_checkin_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 第三步：创建索引（提高性能）
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- ============================================
-- 第四步：插入默认数据（使用INSERT IGNORE避免重复）
-- ============================================

-- 插入管理员账号
INSERT IGNORE INTO users (id, username, email, password, is_admin, points, role, created_at) 
VALUES (1, '老k', '552319164@qq.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 210, '管理员', NOW());

-- 插入测试商家数据
INSERT IGNORE INTO merchants (id, name, description, contact_info, category, rating) VALUES
(1, '体育用品商城', '专业体育用品供应商', 'contact@sportsmall.com', '体育用品', 4.5),
(2, '健身器材专营', '高品质健身器材', 'info@fitnessequip.com', '健身器材', 4.2),
(3, '运动服装品牌', '时尚运动服装', 'sales@sportswear.com', '服装', 4.8);

-- ============================================
-- 完成提示
-- ============================================
SELECT 'Old K Sports 数据库完美导入完成！' as message;
