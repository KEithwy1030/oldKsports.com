// 导出本地数据库脚本
// 用于导出本地开发数据库的所有数据，确保包含您的管理员账号

import mysql from 'mysql2';
import fs from 'fs';

// 本地数据库连接配置
const localDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'k19941030',
    database: 'old_k_sports'
});

const exportDatabase = async () => {
    try {
        console.log('开始导出本地数据库...');
        
        // 导出用户数据
        console.log('导出用户数据...');
        const users = await new Promise((resolve, reject) => {
            localDb.query('SELECT * FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 导出论坛帖子数据
        console.log('导出论坛帖子数据...');
        const posts = await new Promise((resolve, reject) => {
            localDb.query('SELECT * FROM forum_posts', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 导出回复数据
        console.log('导出回复数据...');
        const replies = await new Promise((resolve, reject) => {
            localDb.query('SELECT * FROM forum_replies', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 导出通知数据
        console.log('导出通知数据...');
        const notifications = await new Promise((resolve, reject) => {
            localDb.query('SELECT * FROM notifications', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 导出消息数据
        console.log('导出消息数据...');
        const messages = await new Promise((resolve, reject) => {
            localDb.query('SELECT * FROM messages', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 保存到文件
        const exportData = {
            users,
            posts,
            replies,
            notifications,
            messages,
            exportTime: new Date().toISOString()
        };
        
        fs.writeFileSync('local-database-export.json', JSON.stringify(exportData, null, 2));
        
        console.log('✅ 数据库导出完成！');
        console.log(`用户数量: ${users.length}`);
        console.log(`帖子数量: ${posts.length}`);
        console.log(`回复数量: ${replies.length}`);
        console.log(`通知数量: ${notifications.length}`);
        console.log(`消息数量: ${messages.length}`);
        
        // 检查管理员账号
        const adminUsers = users.filter(user => user.is_admin);
        if (adminUsers.length > 0) {
            console.log('✅ 找到管理员账号:');
            adminUsers.forEach(admin => {
                console.log(`  - 用户名: ${admin.username}, 邮箱: ${admin.email}`);
            });
        } else {
            console.log('⚠️ 未找到管理员账号！');
        }
        
    } catch (error) {
        console.error('导出失败:', error);
    } finally {
        localDb.end();
    }
};

exportDatabase();
