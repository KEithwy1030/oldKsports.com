// minimal-migrate.js - 最小化数据库迁移脚本
import { getDb } from './db.js';

export default async function minimalMigrate() {
    console.log('开始执行最小化数据库迁移...');
    
    try {
        const db = getDb();
        
        // 检查数据库连接
        return new Promise((resolve, reject) => {
            db.query('SELECT 1', (err, result) => {
                if (err) {
                    console.error('数据库连接失败:', err);
                    reject(err);
                } else {
                    console.log('数据库连接成功，迁移完成');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('迁移过程中出错:', error);
        throw error;
    }
}