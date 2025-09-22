// 超简单的数据库迁移脚本 - 只创建管理员账号
import { db } from './db.js';
import bcrypt from 'bcryptjs';

const ultraSimpleMigrate = async () => {
    try {
        console.log('开始超简单数据库迁移...');
        
        // 1. 创建用户表（如果不存在）
        console.log('创建用户表...');
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                points INT DEFAULT 0,
                is_admin BOOLEAN DEFAULT FALSE,
                avatar VARCHAR(255) DEFAULT NULL,
                has_uploaded_avatar BOOLEAN DEFAULT FALSE,
                total_posts INT DEFAULT 0,
                total_replies INT DEFAULT 0,
                consecutive_checkins INT DEFAULT 0,
                last_checkin_date DATE DEFAULT NULL,
                reset_token VARCHAR(255) DEFAULT NULL,
                reset_token_expires DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await new Promise((resolve, reject) => {
            db.query(createUsersTable, (err, result) => {
                if (err) {
                    console.error('创建用户表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 用户表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 2. 检查管理员账号是否存在
        console.log('检查管理员账号...');
        const existingAdmin = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin FROM users WHERE email = ? OR username = ?', ['552319164@qq.com', '老k'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (existingAdmin.length === 0) {
            console.log('创建管理员账号...');
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('Kk19941030', salt);
            
            await new Promise((resolve, reject) => {
                const insertAdmin = `
                    INSERT INTO users (username, email, password, is_admin, points, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertAdmin, ['老k', '552319164@qq.com', hashedPassword, true, 210], (err, result) => {
                    if (err) {
                        console.error('创建管理员账号失败:', err);
                        reject(err);
                    } else {
                        console.log('✅ 管理员账号创建成功');
                        console.log('   用户名: 老k');
                        console.log('   邮箱: 552319164@qq.com');
                        console.log('   密码: Kk19941030');
                        resolve(result);
                    }
                });
            });
        } else {
            const admin = existingAdmin[0];
            console.log('✅ 管理员账号已存在');
            console.log(`   ID: ${admin.id}`);
            console.log(`   用户名: ${admin.username}`);
            console.log(`   邮箱: ${admin.email}`);
            console.log(`   管理员权限: ${admin.is_admin ? '是' : '否'}`);
            
            // 确保管理员权限正确
            if (!admin.is_admin) {
                console.log('更新管理员权限...');
                await new Promise((resolve, reject) => {
                    db.query('UPDATE users SET is_admin = TRUE, points = ? WHERE id = ?', [210, admin.id], (err, result) => {
                        if (err) {
                            console.error('更新管理员权限失败:', err);
                            reject(err);
                        } else {
                            console.log('✅ 管理员权限已更新');
                            resolve(result);
                        }
                    });
                });
            }
        }
        
        console.log('✅ 超简单数据库迁移完成！');
        
    } catch (error) {
        console.error('超简单数据库迁移失败:', error);
        throw error;
    }
};

export default ultraSimpleMigrate;
