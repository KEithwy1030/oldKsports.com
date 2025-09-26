// 数据库迁移脚本
// 用于将本地开发数据库完整迁移到 Zeabur 生产环境

import { db } from './db.js';
import fs from 'fs';
import path from 'path';

const migrateDatabase = async () => {
    try {
        console.log('开始数据库迁移...');
        
        // 1. 创建表结构
        console.log('1. 创建数据库表结构...');
        
        // 直接在代码中定义 SQL 语句
        const sqlStatements = [
            `CREATE TABLE IF NOT EXISTS users (
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
            )`,
            `CREATE TABLE IF NOT EXISTS forum_posts (
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
            )`,
            `CREATE TABLE IF NOT EXISTS forum_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                author_id INT NOT NULL,
                content TEXT NOT NULL,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            // 创建索引 - 使用兼容性更好的语法
            `CREATE INDEX idx_users_username ON users(username)`,
            `CREATE INDEX idx_users_email ON users(email)`,
            `CREATE INDEX idx_forum_posts_author ON forum_posts(author_id)`,
            `CREATE INDEX idx_forum_posts_category ON forum_posts(category)`,
            `CREATE INDEX idx_forum_replies_post ON forum_replies(post_id)`,
            `CREATE INDEX idx_forum_replies_author ON forum_replies(author_id)`,
            `CREATE INDEX idx_notifications_user ON notifications(user_id)`,
            `CREATE INDEX idx_messages_sender ON messages(sender_id)`,
            `CREATE INDEX idx_messages_receiver ON messages(receiver_id)`
        ];
        
        for (const statement of sqlStatements) {
            console.log(`执行 SQL: ${statement.substring(0, 50)}...`);
            
            await new Promise((resolve, reject) => {
                db.query(statement, (err, result) => {
                    if (err) {
                        // 如果是索引已存在的错误，则忽略
                        if (err.code === 'ER_DUP_KEYNAME' || err.errno === 1061) {
                            console.log('索引已存在，跳过创建');
                            resolve(result);
                        } else {
                            console.error('SQL 执行错误:', err);
                            reject(err);
                        }
                    } else {
                        console.log('SQL 执行成功');
                        resolve(result);
                    }
                });
            });
        }
        
        // 2. 检查是否需要插入默认数据
        console.log('2. 检查现有数据...');
        const userCount = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            });
        });
        
        console.log(`当前用户数量: ${userCount}`);
        
        if (userCount === 0) {
            console.log('3. 插入本地数据库数据...');
            
            // 尝试导入本地数据
            try {
                const exportPath = path.join(process.cwd(), 'local-database-export.json');
                if (fs.existsSync(exportPath)) {
                    console.log('找到本地数据导出文件，开始导入...');
                    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
                    
                    // 导入用户数据
                    if (exportData.users && exportData.users.length > 0) {
                        console.log(`导入 ${exportData.users.length} 个用户...`);
                        for (const user of exportData.users) {
                            await new Promise((resolve, reject) => {
                                const insertUser = `
                                    INSERT INTO users (username, email, password, is_admin, points, avatar, 
                                                      has_uploaded_avatar, total_posts, total_replies, 
                                                      consecutive_checkins, last_checkin_date, created_at) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;
                                db.query(insertUser, [
                                    user.username, user.email, user.password, user.is_admin, user.points,
                                    user.avatar, user.has_uploaded_avatar, user.total_posts, user.total_replies,
                                    user.consecutive_checkins, user.last_checkin_date, user.created_at
                                ], (err, result) => {
                                    if (err) reject(err);
                                    else resolve(result);
                                });
                            });
                        }
                        console.log('✅ 用户数据导入完成');
                    }
                    
                    // 导入其他数据...
                    // (可以继续添加帖子、回复等数据的导入)
                    
                } else {
                    console.log('未找到本地数据导出文件，插入默认管理员账号...');
                    
                    // 插入默认管理员账号（使用您的信息）
                    const adminPassword = 'k19941030'; // 您的密码
                    const bcrypt = await import('bcryptjs');
                    const salt = bcrypt.genSaltSync(10);
                    const hashedPassword = bcrypt.hashSync(adminPassword, salt);
                    
                    await new Promise((resolve, reject) => {
                        const insertAdmin = `
                            INSERT INTO users (username, email, password, is_admin, points, created_at) 
                            VALUES (?, ?, ?, ?, ?, NOW())
                        `;
                        db.query(insertAdmin, ['老k', 'KEithwy1030@2925.com', hashedPassword, true, 1000], (err, result) => {
                            if (err) {
                                console.error('插入管理员账号失败:', err);
                                reject(err);
                            } else {
                                console.log('✅ 管理员账号创建成功');
                                resolve(result);
                            }
                        });
                    });
                }
            } catch (importError) {
                console.error('导入本地数据失败:', importError);
                console.log('回退到创建默认管理员账号...');
                
                // 回退方案：创建默认管理员账号
                const adminPassword = 'k19941030';
                const bcrypt = await import('bcryptjs');
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(adminPassword, salt);
                
                await new Promise((resolve, reject) => {
                    const insertAdmin = `
                        INSERT INTO users (username, email, password, is_admin, points, created_at) 
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `;
                    db.query(insertAdmin, ['老k', 'KEithwy1030@2925.com', hashedPassword, true, 1000], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
        } else {
            console.log('3. 数据库已有数据，跳过数据插入');
        }
        
        // 3. 验证迁移结果
        console.log('4. 验证迁移结果...');
        const tables = ['users', 'forum_posts', 'forum_replies', 'notifications', 'messages'];
        for (const table of tables) {
            const count = await new Promise((resolve, reject) => {
                db.query(`SELECT COUNT(*) as count FROM ${table}`, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].count);
                });
            });
            console.log(`✅ 表 ${table}: ${count} 条记录`);
        }
        
        console.log(' 数据库迁移完成！');
        
    } catch (error) {
        console.error('数据库迁移失败:', error);
        throw error;
    }
};

export default migrateDatabase;
