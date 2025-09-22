// 管理和创建管理员账号脚本
import { db } from './db.js';
import bcrypt from 'bcryptjs';

const manageAdminAccount = async () => {
    try {
        console.log('=== 管理管理员账号 ===');
        
        // 管理员账号信息
        const adminInfo = {
            username: '老k',
            email: '552319164@qq.com',
            password: 'Kk19941030',
            points: 210
        };
        
        console.log('目标管理员账号信息:');
        console.log(`用户名: ${adminInfo.username}`);
        console.log(`邮箱: ${adminInfo.email}`);
        console.log(`密码: ${adminInfo.password}`);
        console.log(`积分: ${adminInfo.points}`);
        
        // 1. 查看现有用户
        console.log('\n📊 查看现有用户...');
        const existingUsers = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, username, email, is_admin, points, created_at 
                FROM users 
                ORDER BY created_at DESC
            `, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`当前用户总数: ${existingUsers.length}`);
        existingUsers.forEach((user, index) => {
            const adminFlag = user.is_admin ? '[管理员]' : '[普通用户]';
            console.log(`${index + 1}. ${user.username} (${user.email}) ${adminFlag} - 积分:${user.points}`);
        });
        
        // 2. 检查目标管理员账号是否存在
        console.log('\n🔍 检查目标管理员账号...');
        const existingAdmin = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, username, email, password, is_admin, points 
                FROM users 
                WHERE email = ? OR username = ?
            `, [adminInfo.email, adminInfo.username], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (existingAdmin.length > 0) {
            const admin = existingAdmin[0];
            console.log('✅ 找到现有管理员账号:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   用户名: ${admin.username}`);
            console.log(`   邮箱: ${admin.email}`);
            console.log(`   管理员权限: ${admin.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${admin.points}`);
            
            // 验证密码
            const isPasswordCorrect = bcrypt.compareSync(adminInfo.password, admin.password);
            console.log(`   密码验证: ${isPasswordCorrect ? '正确' : '不正确'}`);
            
            if (!isPasswordCorrect) {
                console.log('\n🔄 密码不匹配，正在更新密码...');
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(adminInfo.password, salt);
                
                await new Promise((resolve, reject) => {
                    db.query(`
                        UPDATE users 
                        SET password = ?, is_admin = TRUE, points = ? 
                        WHERE id = ?
                    `, [hashedPassword, adminInfo.points, admin.id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('✅ 密码和管理员权限已更新');
            }
            
        } else {
            console.log('❌ 未找到目标管理员账号，正在创建...');
            
            // 创建新的管理员账号
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(adminInfo.password, salt);
            
            const insertResult = await new Promise((resolve, reject) => {
                db.query(`
                    INSERT INTO users (username, email, password, is_admin, points, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [adminInfo.username, adminInfo.email, hashedPassword, true, adminInfo.points], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            
            console.log('✅ 管理员账号创建成功!');
            console.log(`   新账号ID: ${insertResult.insertId}`);
        }
        
        // 3. 最终验证
        console.log('\n✅ 最终验证管理员账号...');
        const finalCheck = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, username, email, is_admin, points 
                FROM users 
                WHERE email = ?
            `, [adminInfo.email], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        if (finalCheck.length > 0) {
            const admin = finalCheck[0];
            console.log('🎉 管理员账号验证成功:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   用户名: ${admin.username}`);
            console.log(`   邮箱: ${admin.email}`);
            console.log(`   管理员权限: ${admin.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${admin.points}`);
            console.log('\n现在可以使用以下信息登录:');
            console.log(`邮箱: ${adminInfo.email}`);
            console.log(`密码: ${adminInfo.password}`);
        } else {
            console.log('❌ 管理员账号验证失败');
        }
        
    } catch (error) {
        console.error('管理管理员账号失败:', error);
    } finally {
        db.end();
    }
};

manageAdminAccount();
