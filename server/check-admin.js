// 检查数据库中的管理员账号
import { db } from './db.js';

const checkAdmin = async () => {
    try {
        console.log('检查数据库中的用户...');
        
        // 查询所有用户
        const users = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`找到 ${users.length} 个用户:`);
        users.forEach(user => {
            console.log(`- ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 管理员: ${user.is_admin}, 积分: ${user.points}`);
        });
        
        // 检查是否有管理员
        const admins = users.filter(user => user.is_admin === 1 || user.is_admin === true);
        if (admins.length > 0) {
            console.log(`\n找到 ${admins.length} 个管理员:`);
            admins.forEach(admin => {
                console.log(`- ${admin.username} (${admin.email})`);
            });
        } else {
            console.log('\n❌ 没有找到管理员账号！');
            
            // 创建管理员账号
            console.log('创建管理员账号...');
            const bcrypt = await import('bcryptjs');
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('k19941030', salt);
            
            await new Promise((resolve, reject) => {
                const insertAdmin = `
                    INSERT INTO users (username, email, password, is_admin, points, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertAdmin, ['老k', 'KEithwy1030@2925.com', hashedPassword, 1, 1000], (err, result) => {
                    if (err) {
                        console.error('创建管理员账号失败:', err);
                        reject(err);
                    } else {
                        console.log('✅ 管理员账号创建成功');
                        resolve(result);
                    }
                });
            });
        }
        
    } catch (error) {
        console.error('检查管理员账号失败:', error);
    } finally {
        db.end();
    }
};

checkAdmin();
