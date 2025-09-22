// 修复数据库表结构脚本
import { db } from './db.js';

const fixDatabaseStructure = async () => {
    try {
        console.log('🔧 修复数据库表结构...');
        
        // 1. 修复通知表结构
        console.log('修复通知表结构...');
        await new Promise((resolve, reject) => {
            // 先删除旧表（如果存在）
            db.query('DROP TABLE IF EXISTS notifications_old', (err) => {
                if (err) {
                    console.log('删除旧通知表时出错（可能不存在）:', err.message);
                }
                
                // 重命名当前表
                db.query('ALTER TABLE notifications RENAME TO notifications_old', (err) => {
                    if (err) {
                        console.log('重命名通知表时出错（可能不存在）:', err.message);
                    }
                    
                    // 创建新的通知表
                    const createNotificationsTable = `
                        CREATE TABLE notifications (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            recipient_id INT NOT NULL,
                            sender_id INT DEFAULT NULL,
                            type VARCHAR(50) DEFAULT 'system',
                            title VARCHAR(255) NOT NULL,
                            content TEXT NOT NULL,
                            is_read BOOLEAN DEFAULT FALSE,
                            related_post_id INT DEFAULT NULL,
                            related_reply_id INT DEFAULT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
                            FOREIGN KEY (related_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                            FOREIGN KEY (related_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
                        )
                    `;
                    
                    db.query(createNotificationsTable, (err, result) => {
                        if (err) {
                            console.error('创建新通知表失败:', err);
                            reject(err);
                        } else {
                            console.log('✅ 通知表结构修复成功');
                            resolve(result);
                        }
                    });
                });
            });
        });
        
        // 2. 修复消息表结构
        console.log('修复消息表结构...');
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
                    console.log('✅ 消息表结构修复成功');
                    resolve(result);
                }
            });
        });
        
        // 3. 创建必要的索引
        console.log('创建数据库索引...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)',
            'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)',
            'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id)',
            'CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id)'
        ];
        
        for (const indexQuery of indexes) {
            await new Promise((resolve, reject) => {
                db.query(indexQuery, (err, result) => {
                    if (err) {
                        console.error('创建索引失败:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        
        console.log('✅ 数据库索引创建成功');
        
        // 4. 验证表结构
        console.log('\n🔍 验证表结构...');
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
        
        console.log('\n🎉 数据库表结构修复完成！');
        
    } catch (error) {
        console.error('修复数据库表结构失败:', error);
    } finally {
        db.end();
    }
};

fixDatabaseStructure();
