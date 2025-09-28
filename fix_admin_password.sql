USE zeabur;

-- 更新管理员密码为简单密码 "123456"
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE username = '老k' AND email = '552319164@qq.com';

-- 验证更新结果
SELECT id, username, email, is_admin, points FROM users WHERE username = '老k';
