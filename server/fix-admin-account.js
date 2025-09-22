// 修复管理员账号
import { db } from './db.js';
import bcrypt from 'bcryptjs';

const fixAdminAccount = async () => {
    try {
        console.log('开始修复管理员账号...');
        
        // 检查是否已存在该邮箱的用户
        const existingUser = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin FROM users WHERE email = ?', ['552319164@qq.com'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (existingUser.length > 0) {
            console.log('找到现有用户，更新为管理员...');
            const user = existingUser[0];
            console.log(`现有用户信息: ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 管理员=${user.is_admin}`);
            
            // 更新用户为管理员
            await new Promise((resolve, reject) => {
                const updateAdmin = `
                    UPDATE users 
                    SET is_admin = 1, username = '老k', points = 210
                    WHERE email = ?
                `;
                db.query(updateAdmin, ['552319164@qq.com'], (err, result) => {
                    if (err) {
                        console.error('更新管理员账号失败:', err);
                        reject(err);
                    } else {
                        console.log('✅ 管理员账号更新成功');
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
        
        // 验证修复结果
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
            
            console.log('\n🎯 现在可以使用以下信息登录:');
            console.log(`   邮箱: ${admin.email}`);
            console.log(`   密码: Kk19941030`);
        } else {
            console.log('❌ 管理员账号验证失败');
        }
        
    } catch (error) {
        console.error('修复管理员账号失败:', error);
    } finally {
        db.end();
    }
};

fixAdminAccount();
