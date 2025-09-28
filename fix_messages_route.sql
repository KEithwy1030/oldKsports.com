USE zeabur;

-- 检查消息表结构
DESCRIBE messages;

-- 检查消息表数据
SELECT * FROM messages LIMIT 5;

-- 检查表是否存在
SHOW TABLES LIKE 'messages';

-- 如果表不存在，创建消息表
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入测试消息数据
INSERT IGNORE INTO messages (sender_id, receiver_id, content, created_at) VALUES
(1, 1, '欢迎使用聊天功能！', NOW()),
(1, 1, '您可以在这里与其他用户交流。', NOW());

-- 验证消息数据
SELECT * FROM messages;
