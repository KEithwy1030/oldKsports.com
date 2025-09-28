USE zeabur;

-- 检查通知表当前结构
DESCRIBE notifications;

-- 删除现有的通知表（如果存在）
DROP TABLE IF EXISTS notifications;

-- 重新创建通知表，包含所有必要字段
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    sender_id INT DEFAULT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_post_id INT DEFAULT NULL,
    related_reply_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入测试通知数据
INSERT INTO notifications (recipient_id, type, title, content, created_at) VALUES
(1, 'system', '欢迎使用Old K Sports', '欢迎来到体育自媒体专业社区！', NOW()),
(1, 'system', '系统通知', '您的账户已激活，可以开始使用所有功能。', NOW());

-- 验证通知表结构
DESCRIBE notifications;

-- 验证通知数据
SELECT * FROM notifications;
