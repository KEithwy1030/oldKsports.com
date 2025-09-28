USE zeabur;

-- 检查消息表当前结构
DESCRIBE messages;

-- 删除现有的消息表（如果存在）
DROP TABLE IF EXISTS messages;

-- 重新创建消息表，包含所有必要字段
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

-- 插入测试消息数据
INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
(1, 1, '欢迎使用聊天功能！', NOW()),
(1, 1, '您可以在这里与其他用户交流。', NOW());

-- 验证消息表结构
DESCRIBE messages;

-- 验证消息数据
SELECT * FROM messages;
