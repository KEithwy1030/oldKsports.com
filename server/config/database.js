// 通用数据库连接管理 - 支持多种数据库
import mysql from 'mysql2';
import { config, validateConfig } from './index.js';

// 数据库连接池
let pool = null;

// 创建数据库连接池
const createConnectionPool = () => {
  if (pool) {
    return pool;
  }

  console.log('🔌 创建数据库连接池...');
  console.log(`   主机: ${config.database.host}:${config.database.port}`);
  console.log(`   数据库: ${config.database.database}`);
  console.log(`   用户: ${config.database.username}`);

  pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
    connectionLimit: config.database.connectionLimit,
    acquireTimeout: config.database.acquireTimeout,
    timeout: config.database.timeout,
    // 通用配置
    multipleStatements: false,
    dateStrings: true,
    charset: 'utf8mb4',
    // 连接错误处理
    reconnect: true,
    // 连接超时
    connectTimeout: 60000,
    // 查询超时
    timeout: 60000,
  });

  // 测试连接
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      console.error('请检查数据库配置和网络连接');
      process.exit(1);
    } else {
      console.log('✅ 数据库连接成功');
      connection.release();
    }
  });

  return pool;
};

// 获取数据库连接
export const getConnection = () => {
  if (!pool) {
    createConnectionPool();
  }
  return pool;
};

// 执行查询（Promise版本）
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!pool) {
      createConnectionPool();
    }
    
    pool.query(sql, params, (err, results, fields) => {
      if (err) {
        console.error('数据库查询错误:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// 执行事务
export const transaction = async (callback) => {
  const connection = await new Promise((resolve, reject) => {
    if (!pool) {
      createConnectionPool();
    }
    pool.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 关闭连接池
export const closePool = () => {
  if (pool) {
    pool.end();
    pool = null;
    console.log('🔌 数据库连接池已关闭');
  }
};

// 健康检查
export const healthCheck = async () => {
  try {
    const result = await query('SELECT 1 as health');
    return result[0].health === 1;
  } catch (error) {
    console.error('数据库健康检查失败:', error);
    return false;
  }
};

// 导出默认连接（向后兼容）
export default getConnection();
