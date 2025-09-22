// 修复管理员账号脚本
import { db } from './db.js';
import bcrypt from 'bcryptjs';

const fixAdminAccount = async () => {
    try {
        console.log('🔍 检查并修复管理员账号...');
        
        // 1. 检查现有用户
        const allUsers = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users ORDER BY created_at DESC', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('\n=== 当前数据库中的所有用户 ===');
        allUsers.forEach(user => {
            const adminFlag = user.is_admin ? '[管理员]' : '[普通用户]';
            console.log(`- ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 积分=${user.points} ${adminFlag}`);
        });
        
        // 2. 检查指定邮箱的管理员账号
        const targetEmail = '552319164@qq.com';
        const existingAdmin = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points FROM users WHERE email = ?', [targetEmail], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (existingAdmin.length > 0) {
            console.log(`\n✅ 找到邮箱 ${targetEmail} 的用户:`);
            const user = existingAdmin[0];
            console.log(`   ID: ${user.id}`);
            console.log(`   用户名: ${user.username}`);
            console.log(`   邮箱: ${user.email}`);
            console.log(`   管理员权限: ${user.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${user.points}`);
            
            // 如果不是管理员，提升为管理员
            if (!user.is_admin) {
                console.log('\n🔧 提升用户为管理员...');
                await new Promise((resolve, reject) => {
                    db.query('UPDATE users SET is_admin = 1 WHERE email = ?', [targetEmail], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('✅ 用户已提升为管理员');
            }
        } else {
            console.log(`\n❌ 未找到邮箱 ${targetEmail} 的用户，创建新的管理员账号...`);
            
            // 创建新的管理员账号
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync('Kk19941030', salt);
            
            await new Promise((resolve, reject) => {
                const insertAdmin = `
                    INSERT INTO users (username, email, password, is_admin, points, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                db.query(insertAdmin, ['老k', targetEmail, hashedPassword, 1, 210], (err, result) => {
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
        
        // 3. 验证修复结果
        console.log('\n🔍 验证管理员账号...');
        const verifyAdmin = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE email = ?', [targetEmail], (err, result) => {
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
        
        // 4. 显示所有管理员
        const allAdmins = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE is_admin = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('\n=== 数据库中的所有管理员 ===');
        if (allAdmins.length > 0) {
            allAdmins.forEach(admin => {
                console.log(`- ID=${admin.id}, 用户名=${admin.username}, 邮箱=${admin.email}, 积分=${admin.points}`);
            });
        } else {
            console.log('❌ 没有找到管理员账号');
        }
        
    } catch (error) {
        console.error('修复管理员账号失败:', error);
    } finally {
        db.end();
    }
};

fixAdminAccount();
