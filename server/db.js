// server/db.js (ROBUST ZEABUR-READY VERSION)
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// 调试：打印环境变量
console.log('Database connection environment variables:');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USERNAME:', process.env.MYSQL_USERNAME);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***' : 'undefined');
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);

// 强制使用指定的数据库名称
const DATABASE_NAME = 'old_k_sports';
console.log('Forcing database name to:', DATABASE_NAME);

// 这段代码会优先使用 Zeabur 自动注入的环境变量。
// 如果在本地，它会使用你 .env 文件里的配置。
const connectionConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD,
  database: DATABASE_NAME,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  // 使用MySQL2支持的配置选项
  connectTimeout: 30000, // 30秒连接超时
  // 连接池配置
  connectionLimit: 10,
  queueLimit: 0,
  // 重连配置
  acquireTimeout: 30000,
  // 其他有用的配置
  multipleStatements: false,
  charset: 'utf8mb4'
};

// 使用连接池而不是单个连接
export const db = mysql.createPool(connectionConfig);

// 测试连接
const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection test failed:', err);
        reject(err);
      } else {
        console.log('✅ Database connection test successful');
        connection.release();
        resolve();
      }
    });
  });
};

// 导出测试连接的函数
export { testConnection };