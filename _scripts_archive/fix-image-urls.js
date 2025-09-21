// fix-image-urls.js - 修复数据库中的图片URL端口
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root", 
    password: process.env.DB_PASSWORD || "k19941030",
    database: process.env.DB_NAME || "old_k_sports",
    port: process.env.DB_PORT || 3306
});

async function fixImageUrls() {
    try {
        console.log('🔧 开始修复数据库中的图片URL...\n');
        
        // 查询包含旧端口的帖子
        const posts = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, title, content FROM forum_posts WHERE content LIKE "%localhost:3001%"',
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
        
        console.log(`发现 ${posts.length} 个包含旧端口的帖子`);
        
        if (posts.length === 0) {
            console.log('✅ 没有需要修复的帖子');
            return;
        }
        
        // 修复每个帖子的URL
        for (const post of posts) {
            const oldContent = post.content;
            const newContent = oldContent.replace(/localhost:3001/g, 'localhost:5174');
            
            console.log(`修复帖子 ${post.id}: ${post.title}`);
            console.log(`  旧URL数量: ${(oldContent.match(/localhost:3001/g) || []).length}`);
            console.log(`  新URL数量: ${(newContent.match(/localhost:5174/g) || []).length}`);
            
            await new Promise((resolve, reject) => {
                db.query(
                    'UPDATE forum_posts SET content = ? WHERE id = ?',
                    [newContent, post.id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });
        }
        
        console.log(`\n✅ 已修复 ${posts.length} 个帖子的图片URL`);
        console.log('🎉 所有图片URL已更新为5174端口');
        
    } catch (error) {
        console.error('❌ 修复过程中发生错误:', error.message);
    } finally {
        db.end();
    }
}

fixImageUrls();
