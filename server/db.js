// server/db.js (FINAL ZEABUR-READY VERSION)
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

// 这段代码会优先使用 Zeabur 自动注入的环境变量。
// 如果在本地，它会使用你 .env 文件里的配置。
const connectionConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root', // 确保使用 MYSQL_USERNAME，与 Zeabur 保持一致
  password: process.env.MYSQL_PASSWORD,      // 密码必须在 .env 或 Zeabur 变量中提供
  database: process.env.MYSQL_DATABASE || 'old_k_sports',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10) // 确保端口是数字类型
};

export const db = mysql.createConnection(connectionConfig);

// 添加更健壮的连接测试和错误处理逻辑
db.connect(error => {
  if (error) {
    console.error('FATAL: Error connecting to the database:', error);
    // 在生产环境中，如果数据库连接失败，应该让程序崩溃退出，以便服务自动重启
    process.exit(1); 
  }
  console.log('Successfully connected to the database.');
});