// server/db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
    user: process.env.MYSQL_USERNAME || process.env.DB_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "k19941030",
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "old_k_sports",
    port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306
});

// 添加错误处理
db.on('error', (err) => {
    console.error('数据库连接错误:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('数据库连接丢失，尝试重连...');
    } else {
        console.log('数据库连接失败，但服务器将继续运行');
    }
});

// 测试连接
db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
        console.log('服务器将在无数据库模式下运行');
    } else {
        console.log('数据库连接成功');
    }
});