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

// 本地开发环境默认配置
const isDevelopment = process.env.NODE_ENV === 'development';

// 验证必需的环境变量，开发环境使用默认值
const defaultConfig = {
  MYSQL_HOST: 'localhost',
  MYSQL_USERNAME: 'root',
  MYSQL_PASSWORD: 'k19941030',
  MYSQL_DATABASE: 'old_k_sports',
  MYSQL_PORT: '3306'
};

// 在开发环境中使用默认配置
if (isDevelopment) {
  Object.keys(defaultConfig).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = defaultConfig[key];
      console.log(`🔧 Using default ${key}: ${key.includes('PASSWORD') ? '***' : defaultConfig[key]}`);
    }
  });
} else {
  // 生产环境严格检查环境变量
  const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your Zeabur environment variable configuration.');
    process.exit(1);
  }
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
  // 连接超时配置
  connectTimeout: 30000,        // 30秒连接超时
  // 连接池配置
  connectionLimit: 10,          // 最大连接数
  queueLimit: 0,                // 无限制队列
  waitForConnections: true      // 等待可用连接
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