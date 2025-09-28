USE zeabur;

-- 插入测试用户
INSERT INTO users (username, email, password, is_admin, points, role, created_at) 
VALUES (
    'testuser', 
    'test@example.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    0, 
    100, 
    '用户', 
    NOW()
) 
ON DUPLICATE KEY UPDATE 
    password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_admin = 0,
    points = 100;

-- 验证用户创建
SELECT id, username, email, is_admin, points FROM users WHERE username = 'testuser';
