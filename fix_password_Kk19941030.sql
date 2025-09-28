USE zeabur;

-- 修复管理员账号密码为原密码 "Kk19941030"
-- 注意：这个哈希值需要重新生成，当前是示例值
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE username = '老k' AND email = '552319164@qq.com';

-- 验证密码更新结果
SELECT id, username, email, is_admin, points, created_at FROM users WHERE username = '老k';
