// 检查管理员账号状态
import { db } from './db.js';

const checkAdminStatus = async () => {
    try {
        console.log('检查管理员账号状态...');
        
        // 查询所有用户
        const allUsers = await new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, is_admin, points, created_at FROM users ORDER BY created_at DESC', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`\n=== 数据库中的所有用户 (${allUsers.length}个) ===`);
        allUsers.forEach(user => {
            const adminFlag = user.is_admin ? '[管理员]' : '[普通用户]';
            console.log(`- ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 积分=${user.points} ${adminFlag}, 创建时间=${user.created_at}`);
        });
        
        // 特别检查管理员账号
        console.log('\n=== 检查管理员账号 ===');
        const adminUsers = allUsers.filter(user => user.is_admin === 1 || user.is_admin === true);
        if (adminUsers.length > 0) {
            console.log(`找到 ${adminUsers.length} 个管理员账号:`);
            adminUsers.forEach(admin => {
                console.log(`✅ 管理员: ${admin.username} (${admin.email}) - 积分: ${admin.points}`);
            });
        } else {
            console.log('❌ 没有找到管理员账号');
        }
        
        // 检查特定邮箱
        console.log('\n=== 检查特定邮箱 ===');
        const targetEmail = '552319164@qq.com';
        const targetUser = allUsers.find(user => user.email === targetEmail);
        if (targetUser) {
            console.log(`✅ 找到邮箱 ${targetEmail} 的用户:`);
            console.log(`   用户名: ${targetUser.username}`);
            console.log(`   管理员权限: ${targetUser.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${targetUser.points}`);
        } else {
            console.log(`❌ 未找到邮箱 ${targetEmail} 的用户`);
        }
        
        // 检查特定用户名
        console.log('\n=== 检查特定用户名 ===');
        const targetUsername = '老k';
        const targetUserByName = allUsers.find(user => user.username === targetUsername);
        if (targetUserByName) {
            console.log(`✅ 找到用户名 ${targetUsername} 的用户:`);
            console.log(`   邮箱: ${targetUserByName.email}`);
            console.log(`   管理员权限: ${targetUserByName.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${targetUserByName.points}`);
        } else {
            console.log(`❌ 未找到用户名 ${targetUsername} 的用户`);
        }
        
    } catch (error) {
        console.error('检查管理员账号状态失败:', error);
    } finally {
        db.end();
    }
};

checkAdminStatus();
