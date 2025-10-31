// 初始化新数据库脚本
// 用于在 Zeabur 创建新项目时初始化数据库表结构
import { getDb } from './server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDatabase() {
    console.log('开始初始化数据库...');
    
    try {
        const db = getDb();
        
        // 读取 SQL 文件
        const sqlPath = path.join(__dirname, 'database_init_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // 分割 SQL 语句
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`准备执行 ${statements.length} 条 SQL 语句...`);
        
        // 执行每个 SQL 语句
        for (const statement of statements) {
            if (statement.toUpperCase().startsWith('CREATE TABLE')) {
                console.log(`创建表: ${statement.match(/`?(\w+)`?/)?.[1] || 'unknown'}`);
                
                await new Promise((resolve, reject) => {
                    db.query(statement, (err, result) => {
                        if (err) {
                            console.error('SQL 执行错误:', err.message);
                            // 如果是表已存在，只记录警告
                            if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                                console.warn('⚠️  表已存在，跳过');
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log('✅ 成功');
                            resolve(result);
                        }
                    });
                });
            }
        }
        
        console.log('✅ 数据库初始化完成！');
        
        // 验证表是否创建成功
        const tables = ['users', 'forum_posts', 'forum_replies', 'notifications', 'messages', 'merchants', 'blacklist', 'merchant_reviews'];
        console.log('\n验证表结构...');
        for (const table of tables) {
            await new Promise((resolve) => {
                db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
                    if (err) {
                        console.error(`检查表 ${table} 失败:`, err.message);
                        resolve();
                    } else if (results.length > 0) {
                        console.log(`✅ ${table} 表已创建`);
                        resolve();
                    } else {
                        console.warn(`⚠️  ${table} 表未创建`);
                        resolve();
                    }
                });
            });
        }
        
        console.log('\n初始化完成！');
        process.exit(0);
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();

