// 数据库连接测试脚本
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const testDatabaseConnection = async () => {
    console.log('=== 数据库连接诊断 ===');
    
    // 打印环境变量
    console.log('\n📋 环境变量:');
    console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
    console.log('MYSQL_USERNAME:', process.env.MYSQL_USERNAME);
    console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***' : 'undefined');
    console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
    
    // 测试不同的连接配置
    const configs = [
        {
            name: 'Zeabur配置',
            config: {
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USERNAME,
                password: process.env.MYSQL_PASSWORD,
                database: 'old_k_sports',
                port: parseInt(process.env.MYSQL_PORT || '3306', 10),
                connectTimeout: 10000
            }
        },
        {
            name: '不带数据库名的配置',
            config: {
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USERNAME,
                password: process.env.MYSQL_PASSWORD,
                port: parseInt(process.env.MYSQL_PORT || '3306', 10),
                connectTimeout: 10000
            }
        }
    ];
    
    for (const test of configs) {
        console.log(`\n🔍 测试配置: ${test.name}`);
        console.log('配置详情:', JSON.stringify(test.config, null, 2));
        
        try {
            const connection = mysql.createConnection(test.config);
            
            await new Promise((resolve, reject) => {
                connection.connect((err) => {
                    if (err) {
                        console.log(`❌ 连接失败:`, err.message);
                        console.log(`   错误代码: ${err.code}`);
                        console.log(`   错误号: ${err.errno}`);
                        reject(err);
                    } else {
                        console.log(`✅ 连接成功!`);
                        resolve();
                    }
                });
            });
            
            // 测试查询
            if (test.config.database) {
                await new Promise((resolve, reject) => {
                    connection.query('SHOW TABLES', (err, results) => {
                        if (err) {
                            console.log(`❌ 查询失败:`, err.message);
                            reject(err);
                        } else {
                            console.log(`✅ 查询成功! 表数量: ${results.length}`);
                            if (results.length > 0) {
                                console.log(`   表列表: ${results.map(r => Object.values(r)[0]).join(', ')}`);
                            }
                            resolve();
                        }
                    });
                });
            }
            
            connection.end();
            console.log(`✅ ${test.name} 测试完成`);
            
        } catch (error) {
            console.log(`❌ ${test.name} 测试失败:`, error.message);
        }
    }
    
    console.log('\n=== 诊断完成 ===');
};

testDatabaseConnection().catch(console.error);
