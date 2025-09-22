// 最小化迁移脚本 - 只创建必要的表，不处理用户数据
import { getDb } from './db.js';

const minimalMigrate = async () => {
    try {
        console.log('🔄 开始最小化数据库迁移...');
        
        // 获取数据库连接
        const db = getDb();
        
        // 等待数据库连接就绪
        await new Promise((resolve, reject) => {
            const checkConnection = () => {
                db.getConnection((error, connection) => {
                    if (error) {
                        console.log('⏳ 等待数据库连接就绪...');
                        setTimeout(checkConnection, 1000);
                    } else {
                        console.log('✅ 数据库连接已就绪');
                        connection.release();
                        resolve();
                    }
                });
            };
            checkConnection();
        });
        
        // 创建用户表
        console.log('📋 创建用户表...');
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
        
        await new Promise((resolve, reject) => {
            db.query(createUsersTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建用户表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 用户表创建成功');
                    resolve(result);
                }
            });
        });

        // 创建论坛帖子表
        console.log('📋 创建论坛帖子表...');
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
        
        await new Promise((resolve, reject) => {
            db.query(createPostsTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建论坛帖子表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 论坛帖子表创建成功');
                    resolve(result);
                }
            });
        });

        // 创建论坛回复表
        console.log('📋 创建论坛回复表...');
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
        
        await new Promise((resolve, reject) => {
            db.query(createRepliesTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建论坛回复表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 论坛回复表创建成功');
                    resolve(result);
                }
            });
        });

        // 创建商家表
        console.log('📋 创建商家表...');
        const createMerchantsTable = `
            CREATE TABLE IF NOT EXISTS merchants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                contact_info VARCHAR(255),
                website VARCHAR(255),
                logo_url VARCHAR(255),
                rating DECIMAL(3,2) DEFAULT 0.00,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await new Promise((resolve, reject) => {
            db.query(createMerchantsTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建商家表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 商家表创建成功');
                    resolve(result);
                }
            });
        });

        // 创建通知表
        console.log('📋 创建通知表...');
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
        
        await new Promise((resolve, reject) => {
            db.query(createNotificationsTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建通知表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 通知表创建成功');
                    resolve(result);
                }
            });
        });

        // 创建消息表
        console.log('📋 创建消息表...');
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
        
        await new Promise((resolve, reject) => {
            db.query(createMessagesTable, (err, result) => {
                if (err) {
                    console.error('❌ 创建消息表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 消息表创建成功');
                    resolve(result);
                }
            });
        });
        
        // 检查现有用户数量
        const userCount = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            });
        });
        
        console.log('🎉 数据库迁移完成！');
        console.log(`📊 当前用户数量: ${userCount}`);
        console.log('✅ 所有必要的表已创建');
        
    } catch (error) {
        console.error('💥 最小化数据库迁移失败:', error);
        throw error;
    }
};

export default minimalMigrate;