USE zeabur;

-- 修复管理员账号密码为原密码 "Kk19941030"
UPDATE users 
SET password = '$2a$10$RIDUOe6wr3vr2uJ/UpUMBueL5zagsKtSlX7ARyhk51gdLb8mUWqhi' 
WHERE username = '老k' AND email = '552319164@qq.com';

-- 验证密码更新结果
SELECT id, username, email, is_admin, points, created_at FROM users WHERE username = '老k';
