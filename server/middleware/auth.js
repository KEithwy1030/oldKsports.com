// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // 优先从 Cookie 读取
    let token = req.cookies.access_token;
    
    // 如果 Cookie 没有，尝试从 Authorization header 读取
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    console.log('认证中间件 - Token来源:', {
      fromCookie: !!req.cookies.access_token,
      fromHeader: !!(req.headers['authorization']),
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    });

    if (!token) {
      console.log('认证失败: 令牌缺失');
      return res.status(401).json({
        success: false,
        error: '访问令牌缺失'
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oldksports_jwt_secret_key_2024');
    console.log('JWT解码成功:', { userId: decoded.userId, exp: decoded.exp });
    
    // 从数据库获取用户信息
    console.log('🔍 查询用户ID:', decoded.userId, '类型:', typeof decoded.userId);
    
    const rows = await new Promise((resolve, reject) => {
      getDb().query(
        'SELECT id, username, email, points, is_admin FROM users WHERE id = ?',
        [decoded.userId],
        (err, results) => {
          if (err) {
            console.error('❌ 数据库查询错误:', err);
            reject(err);
          } else {
            console.log('📊 数据库查询结果:', results.length, '条记录');
            resolve(results);
          }
        }
      );
    });

    if (rows.length === 0) {
      console.log('❌ 用户不存在，用户ID:', decoded.userId);
      
      // 添加调试：查询所有用户
      const allUsers = await new Promise((resolve, reject) => {
        getDb().query('SELECT id, username FROM users LIMIT 10', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      console.log('📋 数据库中的用户:', allUsers);
      
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      });
    }

    const user = rows[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      points: user.points,
      isAdmin: user.is_admin || false
    };

    console.log('用户认证成功:', { 
      id: req.user.id, 
      username: req.user.username, 
      isAdmin: req.user.isAdmin 
    });
    next();
  } catch (error) {
    console.error('认证失败详情:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
      stack: error.stack?.split('\n')[0]
    });
    
    let errorMessage = '无效的访问令牌';
    let statusCode = 403;
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = '访问令牌已过期，请重新登录';
      statusCode = 401;
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = '访问令牌格式无效';
      statusCode = 401;
    } else if (error.name === 'NotBeforeError') {
      errorMessage = '访问令牌尚未生效';
      statusCode = 401;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      tokenError: true
    });
  }
};
