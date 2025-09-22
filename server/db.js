// server/db.js - ZEABUR PRODUCTION VERSION (OPTIMIZED)
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

// 验证必需的环境变量
const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please check your Zeabur environment variable configuration.');
  process.exit(1);
}

// 使用Zeabur提供的数据库配置
const DATABASE_NAME = process.env.MYSQL_DATABASE;
console.log('Using database name:', DATABASE_NAME);

// 优化的数据库连接配置
const connectionConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: DATABASE_NAME,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  // 连接超时和重试配置
  connectTimeout: 30000,        // 30秒连接超时
  acquireTimeout: 30000,        // 30秒获取连接超时
  timeout: 30000,               // 30秒查询超时
  reconnect: true,              // 自动重连
  // 连接池配置
  connectionLimit: 10,          // 最大连接数
  queueLimit: 0,                // 无限制队列
  waitForConnections: true,     // 等待可用连接
  // 重试配置
  retryDelay: 2000,             // 2秒重试延迟
  maxRetries: 3                 // 最大重试次数
};

console.log('Connection config:', {
  ...connectionConfig,
  password: '***'
});

// 创建连接池
let db = null;

export const getDb = () => {
  if (!db) {
    console.log('Creating database connection pool...');
    try {
      db = mysql.createPool(connectionConfig);
      
      // 测试连接并添加重试机制
      const testConnection = (retryCount = 0) => {
        db.getConnection((error, connection) => {
          if (error) {
            console.error(`❌ Database connection attempt ${retryCount + 1} failed:`, error.message);
            
            if (retryCount < connectionConfig.maxRetries) {
              console.log(`🔄 Retrying connection in ${connectionConfig.retryDelay}ms...`);
              setTimeout(() => testConnection(retryCount + 1), connectionConfig.retryDelay);
            } else {
              console.error('💥 FATAL: All database connection attempts failed');
              console.error('Final error:', error);
              process.exit(1);
            }
          } else {
            console.log('✅ Successfully connected to the database');
            console.log('📊 Connection pool created successfully');
            connection.release();
          }
        });
      };
      
      // 开始测试连接
      testConnection();
      
    } catch (error) {
      console.error('💥 FATAL: Error creating database pool:', error);
      process.exit(1);
    }
  }
  return db;
};

// 为了向后兼容，也导出db
export { getDb as db };