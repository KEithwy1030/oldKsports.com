// 将管理员账号迁移到Zeabur数据库
import { db } from './db.js';
import bcrypt from 'bcryptjs';

const migrateAdminToZeabur = async () => {
    try {
        console.log('开始迁移管理员账号到Zeabur...');
        
        // 检查是否已存在该管理员账号
        const existingAdmin = await new Promise((resolve, reject) => {
            db.query('SELECT id FROM users WHERE email = ? OR username = ?', ['552319164@qq.com', '老k'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (existingAdmin.length > 0) {
            console.log('管理员账号已存在，更新为管理员权限...');
            
            // 更新现有账号为管理员
            await new Promise((resolve, reject) => {
                const updateAdmin = `
                    UPDATE users 
                    SET is_admin = 1, points = 210, username = '老k', email = '552319164@qq.com'
                    WHERE email = ? OR username = ?
                `;
                db.query(updateAdmin, ['552319164@qq.com', '老k'], (err, result) => {
                    if (err) {
                        console.error('更新管理员账号失败:', err);
                        reject(err);
                    } else {
                        console.log('✅ 管理员账号权限更新成功');
                        resolve(result);
                    }
                });
            });
        } else {
            console.log('创建新的管理员账号...');
            
            // 创建新的管理员账号
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('Kk19941030', salt);
            
            await new Promise((resolve, reject) => {
                const insertAdmin = `
                    INSERT INTO users (username, email, password, is_admin, points, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertAdmin, ['老k', '552319164@qq.com', hashedPassword, 1, 210], (err, result) => {
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
        
        // 验证管理员账号
        console.log('验证管理员账号...');
        const verifyAdmin = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE email = ?', ['552319164@qq.com'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (verifyAdmin.length > 0) {
            const admin = verifyAdmin[0];
            console.log('✅ 管理员账号验证成功:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   用户名: ${admin.username}`);
            console.log(`   邮箱: ${admin.email}`);
            console.log(`   管理员权限: ${admin.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${admin.points}`);
            console.log(`   创建时间: ${admin.created_at}`);
        } else {
            console.log('❌ 管理员账号验证失败');
        }
        
        // 显示所有管理员
        const allAdmins = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE is_admin = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('\n=== Zeabur数据库中的所有管理员 ===');
        if (allAdmins.length > 0) {
            allAdmins.forEach(admin => {
                console.log(`- ID=${admin.id}, 用户名=${admin.username}, 邮箱=${admin.email}, 积分=${admin.points}`);
            });
        } else {
            console.log('❌ 没有找到管理员账号');
        }
        
    } catch (error) {
        console.error('迁移管理员账号失败:', error);
    } finally {
        db.end();
    }
};

migrateAdminToZeabur();
