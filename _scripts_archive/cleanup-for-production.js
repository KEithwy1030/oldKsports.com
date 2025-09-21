// cleanup-for-production.js
// 生产环境发布前的数据清理脚本

import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// 使用普通的mysql2连接，与现有服务保持一致
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root", 
    password: process.env.DB_PASSWORD || "k19941030",
    database: process.env.DB_NAME || "old_k_sports",
    port: process.env.DB_PORT || 3306
});

async function cleanupForProduction() {
    console.log('🚀 开始生产环境发布前清理...\n');

    try {
        // 1. 清理测试帖子数据
        console.log('1️⃣ 清理测试帖子数据...');
        const posts = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM posts', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log(`   发现 ${posts[0].count} 个帖子`);
        
        // 删除所有测试帖子
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM posts', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log('   ✅ 已清理所有测试帖子');

        // 2. 清理测试用户数据（保留管理员账户）
        console.log('\n2️⃣ 清理测试用户数据...');
        const users = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log(`   发现 ${users[0].count} 个用户`);
        
        // 只保留管理员用户，删除其他测试用户
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM users WHERE is_admin = 0', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log('   ✅ 已清理测试用户（保留管理员账户）');

        // 3. 清理商家数据
        console.log('\n3️⃣ 清理测试商家数据...');
        const merchants = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM merchants', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log(`   发现 ${merchants[0].count} 个商家`);
        
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM merchants', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log('   ✅ 已清理所有测试商家数据');

        // 4. 清理黑名单数据
        console.log('\n4️⃣ 清理测试黑名单数据...');
        const blacklist = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM blacklist', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log(`   发现 ${blacklist[0].count} 个黑名单条目`);
        
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM blacklist', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log('   ✅ 已清理所有测试黑名单数据');

        // 5. 重置自增ID
        console.log('\n5️⃣ 重置数据表自增ID...');
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE posts AUTO_INCREMENT = 1', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE users AUTO_INCREMENT = 1', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE merchants AUTO_INCREMENT = 1', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE blacklist AUTO_INCREMENT = 1', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        console.log('   ✅ 已重置所有表的自增ID');

        // 6. 清理上传的图片文件
        console.log('\n6️⃣ 清理测试图片文件...');
        const uploadDirs = [
            path.join(process.cwd(), 'public', 'uploads', 'images'),
            path.join(process.cwd(), 'server', 'public', 'uploads', 'images'),
            path.join(process.cwd(), 'server', 'uploads', 'images'),
            path.join(process.cwd(), 'server', 'server', 'uploads', 'images')
        ];

        let totalFilesDeleted = 0;
        for (const dir of uploadDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        fs.unlinkSync(path.join(dir, file));
                        totalFilesDeleted++;
                    }
                }
            }
        }
        console.log(`   ✅ 已删除 ${totalFilesDeleted} 个测试图片文件`);

        // 7. 清理前端缓存数据
        console.log('\n7️⃣ 生成前端缓存清理提醒...');
        console.log('   📋 请手动清理以下前端缓存：');
        console.log('      - localStorage中的forum_posts数据');
        console.log('      - 浏览器缓存');
        console.log('      - 用户登录状态');

        console.log('\n🎉 生产环境清理完成！');
        console.log('\n📊 清理后的数据库状态：');
        
        // 显示清理后的状态
        const finalPosts = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM posts', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const finalUsers = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const finalMerchants = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM merchants', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const finalBlacklist = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM blacklist', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log(`   📝 帖子数量: ${finalPosts[0].count}`);
        console.log(`   👥 用户数量: ${finalUsers[0].count} (仅管理员)`);
        console.log(`   🏪 商家数量: ${finalMerchants[0].count}`);
        console.log(`   🚫 黑名单数量: ${finalBlacklist[0].count}`);

    } catch (error) {
        console.error('❌ 清理过程中发生错误:', error.message);
        throw error;
    } finally {
        db.end();
    }
}

// 执行清理
cleanupForProduction().catch(console.error);
