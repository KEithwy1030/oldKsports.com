// server/fix-admin-account.js
// 生产环境管理员账号修复脚本
import { getDb } from './db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const fixAdminAccount = async () => {
    try {
        console.log('=== 开始修复生产环境管理员账号 ===');
        
        const adminEmail = '552319164@qq.com';
        const adminUsername = '老k';
        const adminPassword = 'Kk19941030';
        const adminPoints = 210;

        console.log('管理员账号信息:');
        console.log(`  邮箱: ${adminEmail}`);
        console.log(`  用户名: ${adminUsername}`);
        console.log(`  密码: ${adminPassword}`);
        console.log(`  积分: ${adminPoints}`);

        // 获取数据库连接
        const db = getDb();
        
        // 检查是否存在该管理员账号
        console.log('检查现有管理员账号...');
        const [existingUsers] = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, password, is_admin, points FROM users WHERE email = ? OR username = ?', 
                [adminEmail, adminUsername], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (existingUsers.length > 0) {
            const existingAdmin = existingUsers[0];
            console.log(`✅ 找到现有管理员账号 (ID: ${existingAdmin.id})`);
            console.log(`   用户名: ${existingAdmin.username}`);
            console.log(`   邮箱: ${existingAdmin.email}`);
            console.log(`   当前管理员权限: ${existingAdmin.is_admin ? '是' : '否'}`);
            console.log(`   当前积分: ${existingAdmin.points}`);

            // 检查密码是否匹配
            const isPasswordCorrect = bcrypt.compareSync(adminPassword, existingAdmin.password);
            if (!isPasswordCorrect) {
                console.log('🔄 密码不匹配，正在更新密码...');
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(adminPassword, salt);
                
                await new Promise((resolve, reject) => {
                    db.query('UPDATE users SET password = ?, is_admin = TRUE, points = ? WHERE id = ?', 
                        [hashedPassword, adminPoints, existingAdmin.id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('✅ 管理员账号密码和权限已更新');
            } else {
                console.log('✅ 管理员账号密码已匹配');
            }

            // 确保管理员权限和积分正确
            await new Promise((resolve, reject) => {
                db.query('UPDATE users SET is_admin = TRUE, points = ? WHERE id = ?', 
                    [adminPoints, existingAdmin.id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log('✅ 管理员账号权限已确保');

        } else {
            console.log('🔄 管理员账号不存在，正在创建...');
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(adminPassword, salt);

            const insertQuery = `
                INSERT INTO users (username, email, password, is_admin, points, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            
            const [result] = await new Promise((resolve, reject) => {
                db.query(insertQuery, [adminUsername, adminEmail, hashedPassword, true, adminPoints], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            
            console.log('✅ 管理员账号创建成功');
            console.log(`   新用户ID: ${result.insertId}`);
        }

        console.log('=== 管理员账号修复完成 ===');
        console.log('🎯 可用登录信息:');
        console.log(`   邮箱: ${adminEmail}`);
        console.log(`   密码: ${adminPassword}`);
        console.log('   请在前端使用此信息登录管理界面');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ 修复管理员账号失败:', error);
        process.exit(1);
    }
};

// 执行修复
fixAdminAccount();