// 最小化迁移脚本 - 只创建必要的表，不处理用户数据
import { db } from './db.js';

const minimalMigrate = async () => {
    try {
        console.log('开始最小化数据库迁移...');
        
        // 只创建用户表，不做任何数据操作
        console.log('创建用户表...');
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
                    console.error('创建用户表失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 用户表创建成功');
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
        
        console.log(`✅ 数据库迁移完成！当前用户数量: ${userCount}`);
        
    } catch (error) {
        console.error('最小化数据库迁移失败:', error);
        throw error;
    }
};

export default minimalMigrate;
