// 简化的数据库迁移脚本
// 直接在代码中创建表结构，避免任何文件操作

import { db } from './db.js';

const simpleMigrate = async () => {
    try {
        console.log('开始简化数据库迁移...');
        
        // 创建用户表
        console.log('创建用户表...');
        await new Promise((resolve, reject) => {
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
        
        // 创建论坛帖子表
        console.log('创建论坛帖子表...');
        await new Promise((resolve, reject) => {
            const createPostsTable = `
                CREATE TABLE IF NOT EXISTS forum_posts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    author_id INT NOT NULL,
                    category VARCHAR(50) DEFAULT 'general',
                    views INT DEFAULT 0,
                    likes INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            db.query(createPostsTable, (err, result) => {
                if (err) {
                    console.error('创建论坛帖子表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 论坛帖子表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 创建论坛回复表
        console.log('创建论坛回复表...');
        await new Promise((resolve, reject) => {
            const createRepliesTable = `
                CREATE TABLE IF NOT EXISTS forum_replies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    post_id INT NOT NULL,
                    author_id INT NOT NULL,
                    content TEXT NOT NULL,
                    likes INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            db.query(createRepliesTable, (err, result) => {
                if (err) {
                    console.error('创建论坛回复表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 论坛回复表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 创建通知表
        console.log('创建通知表...');
        await new Promise((resolve, reject) => {
            const createNotificationsTable = `
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) DEFAULT 'info',
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            db.query(createNotificationsTable, (err, result) => {
                if (err) {
                    console.error('创建通知表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 通知表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 创建消息表
        console.log('创建消息表...');
        await new Promise((resolve, reject) => {
            const createMessagesTable = `
                CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sender_id INT NOT NULL,
                    receiver_id INT NOT NULL,
                    content TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            db.query(createMessagesTable, (err, result) => {
                if (err) {
                    console.error('创建消息表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 消息表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 检查用户数量
        console.log('检查现有用户...');
        const userCount = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            });
        });
        
        console.log(`当前用户数量: ${userCount}`);
        
        // 如果没有用户，创建管理员账号
        if (userCount === 0) {
            console.log('创建默认管理员账号...');
            const bcrypt = await import('bcryptjs');
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
                        resolve(result);
                    }
                });
            });
        }
        
        console.log('✅ 简化数据库迁移完成！');
        
    } catch (error) {
        console.error('简化数据库迁移失败:', error);
        throw error;
    }
};

export default simpleMigrate;
