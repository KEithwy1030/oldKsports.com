// 查看Zeabur数据库中的用户信息
import { db } from './db.js';

const viewZeaburUsers = async () => {
    try {
        console.log('=== 查看Zeabur数据库用户信息 ===');
        
        // 查询所有用户
        const allUsers = await new Promise((resolve, reject) => {
            db.query(`
                SELECT 
                    id, 
                    username, 
                    email, 
                    is_admin, 
                    points, 
                    total_posts,
                    total_replies,
                    created_at,
                    updated_at
                FROM users 
                ORDER BY created_at DESC
            `, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`\n📊 数据库统计:`);
        console.log(`总用户数: ${allUsers.length}`);
        
        const adminUsers = allUsers.filter(user => user.is_admin === 1 || user.is_admin === true);
        const regularUsers = allUsers.filter(user => user.is_admin === 0 || user.is_admin === false);
        
        console.log(`管理员数量: ${adminUsers.length}`);
        console.log(`普通用户数量: ${regularUsers.length}`);
        
        console.log(`\n👑 管理员账号:`);
        if (adminUsers.length > 0) {
            adminUsers.forEach(admin => {
                console.log(`├─ ID: ${admin.id}`);
                console.log(`├─ 用户名: ${admin.username}`);
                console.log(`├─ 邮箱: ${admin.email}`);
                console.log(`├─ 积分: ${admin.points}`);
                console.log(`├─ 帖子数: ${admin.total_posts}`);
                console.log(`├─ 回复数: ${admin.total_replies}`);
                console.log(`├─ 创建时间: ${admin.created_at}`);
                console.log(`└─ 更新时间: ${admin.updated_at}`);
                console.log('');
            });
        } else {
            console.log('❌ 没有找到管理员账号');
        }
        
        console.log(`\n👥 普通用户账号:`);
        if (regularUsers.length > 0) {
            regularUsers.forEach(user => {
                console.log(`├─ ID: ${user.id}`);
                console.log(`├─ 用户名: ${user.username}`);
                console.log(`├─ 邮箱: ${user.email}`);
                console.log(`├─ 积分: ${user.points}`);
                console.log(`├─ 帖子数: ${user.total_posts}`);
                console.log(`├─ 回复数: ${user.total_replies}`);
                console.log(`├─ 创建时间: ${user.created_at}`);
                console.log(`└─ 更新时间: ${user.updated_at}`);
                console.log('');
            });
        } else {
            console.log('❌ 没有找到普通用户账号');
        }
        
        // 检查特定管理员账号
        console.log(`\n🔍 检查特定管理员账号:`);
        const targetAdmin = allUsers.find(user => 
            user.email === '552319164@qq.com' || user.username === '老k'
        );
        
        if (targetAdmin) {
            console.log('✅ 找到目标管理员账号:');
            console.log(`   用户名: ${targetAdmin.username}`);
            console.log(`   邮箱: ${targetAdmin.email}`);
            console.log(`   管理员权限: ${targetAdmin.is_admin ? '是' : '否'}`);
            console.log(`   积分: ${targetAdmin.points}`);
            console.log(`   创建时间: ${targetAdmin.created_at}`);
        } else {
            console.log('❌ 未找到目标管理员账号 (552319164@qq.com / 老k)');
        }
        
        // 显示最近注册的用户
        console.log(`\n🕒 最近注册的用户 (最新5个):`);
        const recentUsers = allUsers.slice(0, 5);
        recentUsers.forEach((user, index) => {
            const adminFlag = user.is_admin ? '[管理员]' : '[普通用户]';
            console.log(`${index + 1}. ${user.username} (${user.email}) ${adminFlag} - ${user.created_at}`);
        });
        
    } catch (error) {
        console.error('查看用户信息失败:', error);
    } finally {
        db.end();
    }
};

viewZeaburUsers();
