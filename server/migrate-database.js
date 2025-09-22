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
        const sqlPath = path.join(process.cwd(), 'database_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
            if (statement.toLowerCase().includes('create table') || 
                statement.toLowerCase().includes('create index')) {
                
                console.log(`执行: ${statement.substring(0, 50)}...`);
                
                await new Promise((resolve, reject) => {
                    db.query(statement, (err, result) => {
                        if (err) {
                            console.error('SQL 执行错误:', err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }
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
