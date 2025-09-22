// server/db.js - ZEABUR PRODUCTION VERSION
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// 调试：打印环境变量
console.log('=== Database Connection Debug ===');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USERNAME:', process.env.MYSQL_USERNAME);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***' : 'undefined');
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 使用Zeabur自动生成的数据库名称，而不是强制覆盖
const DATABASE_NAME = process.env.MYSQL_DATABASE || 'old_k_sports';
console.log('Using database name:', DATABASE_NAME);

// 数据库连接配置 - 使用Zeabur自动生成的变量
const connectionConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD,
  database: DATABASE_NAME,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  // 添加连接超时和重试配置
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // 确保连接池配置
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Connection config:', {
  ...connectionConfig,
  password: connectionConfig.password ? '***' : 'undefined'
});

// 创建连接池而不是单连接
let db = null;

export const getDb = () => {
  if (!db) {
    console.log('Creating database connection pool...');
    try {
      db = mysql.createPool(connectionConfig);
      
      // 测试连接
      db.getConnection((error, connection) => {
        if (error) {
          console.error('FATAL: Error getting database connection:', error);
          process.exit(1);
        } else {
          console.log('✅ Successfully connected to the database.');
          connection.release();
        }
      });
      
    } catch (error) {
      console.error('FATAL: Error creating database pool:', error);
      process.exit(1);
    }
  }
  return db;
};

// 为了向后兼容，也导出db
export { getDb as db };