// 通用配置管理 - 适用于任何部署平台
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 环境配置
const config = {
  // 应用基础配置
  app: {
    name: process.env.APP_NAME || 'OldKSports',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // 数据库配置（支持多种数据库）
  database: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
    username: process.env.DB_USERNAME || process.env.MYSQL_USERNAME || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'old_k_sports',
    // 连接池配置
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 文件上传配置
  upload: {
    dir: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  },

  // 邮件配置（可选）
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },

  // Redis配置（可选）
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};

// 配置验证
const validateConfig = () => {
  const required = ['database.host', 'database.username', 'database.database'];
  const missing = [];

  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ 缺少必需的配置项:', missing);
    console.error('请检查环境变量配置');
    process.exit(1);
  }

  console.log('✅ 配置验证通过');
};

// 开发环境配置检查
if (config.app.env === 'development') {
  console.log('🔧 开发环境配置:');
  console.log(`  应用端口: ${config.app.port}`);
  console.log(`  数据库: ${config.database.host}:${config.database.port}`);
  console.log(`  CORS源: ${config.app.corsOrigin}`);
}

export { config, validateConfig };
