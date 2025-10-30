// minimal-migrate.js - 最小化数据库迁移脚本（2.0版本）
import { getDb } from './db.js';

export default async function minimalMigrate() {
    console.log('开始执行最小化数据库迁移（2.0版本）...');
    
    try {
        const db = getDb();
        
        // 检查数据库连接
        await new Promise((resolve, reject) => {
            db.query('SELECT 1', (err, result) => {
                if (err) {
                    console.error('数据库连接失败:', err);
                    reject(err);
                } else {
                    console.log('✅ 数据库连接成功');
                    resolve();
                }
            });
        });

        // 检查并添加 last_login 字段（2.0版本需要）
        await new Promise((resolve, reject) => {
            // 检查字段是否存在
            db.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'last_login'
            `, (err, results) => {
                if (err) {
                    console.error('检查 last_login 字段失败:', err);
                    reject(err);
                    return;
                }

                const columnExists = results[0]?.count > 0;

                if (columnExists) {
                    console.log('✅ last_login 字段已存在，跳过添加');
                    resolve();
                } else {
                    console.log('🔧 添加 last_login 字段到 users 表...');
                    db.query(`
                        ALTER TABLE users 
                        ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL 
                        AFTER updated_at
                    `, (alterErr) => {
                        if (alterErr) {
                            console.error('添加 last_login 字段失败:', alterErr);
                            // 不阻止启动，只记录错误
                            console.warn('⚠️ 警告：last_login 字段添加失败，但服务器将继续启动');
                            resolve(); // 继续执行，不阻止启动
                        } else {
                            console.log('✅ last_login 字段添加成功');
                            resolve();
                        }
                    });
                }
            });
        });

        console.log('✅ 数据库迁移完成');
    } catch (error) {
        console.error('❌ 迁移过程中出错:', error);
        // 不抛出错误，允许服务器继续启动
        // 这样即使迁移失败，服务器也能正常运行
        console.warn('⚠️ 警告：数据库迁移失败，但服务器将继续启动');
    }
}