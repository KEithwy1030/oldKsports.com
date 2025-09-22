// 数据库初始化脚本
// 用于在 Zeabur 部署后自动创建数据库表结构

import { db } from './db.js';
import fs from 'fs';
import path from 'path';

const initDatabase = async () => {
    try {
        console.log('开始初始化数据库表结构...');
        
        // 读取 SQL 文件
        const sqlPath = path.join(process.cwd(), 'database_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // 分割 SQL 语句
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        // 执行每个 SQL 语句
        for (const statement of statements) {
            if (statement.toLowerCase().includes('create table') || 
                statement.toLowerCase().includes('create index')) {
                
                console.log(`执行 SQL: ${statement.substring(0, 50)}...`);
                
                await new Promise((resolve, reject) => {
                    db.query(statement, (err, result) => {
                        if (err) {
                            console.error('SQL 执行错误:', err);
                            reject(err);
                        } else {
                            console.log('SQL 执行成功');
                            resolve(result);
                        }
                    });
                });
            }
        }
        
        console.log('数据库表结构初始化完成！');
        
        // 验证表是否创建成功
        const tables = ['users', 'forum_posts', 'forum_replies', 'notifications', 'messages'];
        for (const table of tables) {
            await new Promise((resolve, reject) => {
                db.query(`SHOW TABLES LIKE '${table}'`, (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result.length > 0) {
                        console.log(`✅ 表 ${table} 创建成功`);
                        resolve();
                    } else {
                        console.log(`❌ 表 ${table} 创建失败`);
                        reject(new Error(`Table ${table} not found`));
                    }
                });
            });
        }
        
        console.log('所有数据库表验证完成！');
        
    } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
    }
};

export default initDatabase;
