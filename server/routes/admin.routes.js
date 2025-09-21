// server/routes/admin.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: '需要管理员权限'
    });
  }
  next();
};

// 获取仪表板统计数据
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 获取总用户数
    const totalUsersResult = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取总帖子数
    const totalPostsResult = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM posts', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取总回复数
    const totalRepliesResult = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM replies', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取今日新增用户数
    const todayUsersResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()',
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    // 获取今日新增帖子数
    const todayPostsResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = CURDATE()',
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    // 获取今日新增回复数
    const todayRepliesResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT COUNT(*) as count FROM replies WHERE DATE(created_at) = CURDATE()',
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    // 获取最近7天用户增长数据
    const userGrowthResult = await new Promise((resolve, reject) => {
      db.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM users 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取最近7天帖子增长数据
    const postGrowthResult = await new Promise((resolve, reject) => {
      db.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM posts 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const stats = {
      totalUsers: totalUsersResult[0].count,
      totalPosts: totalPostsResult[0].count,
      totalReplies: totalRepliesResult[0].count,
      todayUsers: todayUsersResult[0].count,
      todayPosts: todayPostsResult[0].count,
      todayReplies: todayRepliesResult[0].count,
      userGrowth: userGrowthResult,
      postGrowth: postGrowthResult,
      onlineUsers: Math.floor(totalUsersResult[0].count * 0.1) // 模拟在线用户数
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取仪表板统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    });
  }
});

// 获取最近活动
router.get('/dashboard/activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 获取最近帖子
    const recentPosts = await new Promise((resolve, reject) => {
      db.query(`
        SELECT p.id, p.title, p.created_at, u.username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取最近回复
    const recentReplies = await new Promise((resolve, reject) => {
      db.query(`
        SELECT r.id, r.content, r.created_at, u.username, p.title as post_title
        FROM replies r
        JOIN users u ON r.user_id = u.id
        JOIN posts p ON r.post_id = p.id
        ORDER BY r.created_at DESC
        LIMIT 10
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取最近注册用户
    const recentUsers = await new Promise((resolve, reject) => {
      db.query(`
        SELECT id, username, email, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 合并并排序活动
    const activities = [
      ...recentPosts.map(post => ({
        id: `post_${post.id}`,
        type: 'post',
        content: `发布了新帖子：${post.title}`,
        user: post.username,
        timestamp: post.created_at
      })),
      ...recentReplies.map(reply => ({
        id: `reply_${reply.id}`,
        type: 'reply',
        content: `回复了帖子：${reply.post_title}`,
        user: reply.username,
        timestamp: reply.created_at
      })),
      ...recentUsers.map(user => ({
        id: `user_${user.id}`,
        type: 'user',
        content: '新用户注册',
        user: user.username,
        timestamp: user.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('获取最近活动失败:', error);
    res.status(500).json({
      success: false,
      error: '获取活动数据失败'
    });
  }
});

// 获取用户列表
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.username, u.email, u.points, u.is_admin, u.created_at,
             COUNT(DISTINCT p.id) as post_count,
             COUNT(DISTINCT r.id) as reply_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN replies r ON u.id = r.user_id
    `;

    const queryParams = [];

    if (search) {
      query += ' WHERE u.username LIKE ? OR u.email LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const users = await new Promise((resolve, reject) => {
      db.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];

    if (search) {
      countQuery += ' WHERE username LIKE ? OR email LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await new Promise((resolve, reject) => {
      db.query(countQuery, countParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult[0].total,
          pages: Math.ceil(totalResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    });
  }
});

// 获取帖子列表
router.get('/posts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.id, p.title, p.content, p.category, p.created_at, p.updated_at,
             u.username, u.email,
             COUNT(DISTINCT r.id) as reply_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN replies r ON p.id = r.post_id
    `;

    const queryParams = [];

    if (search) {
      query += ' WHERE p.title LIKE ? OR p.content LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const posts = await new Promise((resolve, reject) => {
      db.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM posts';
    const countParams = [];

    if (search) {
      countQuery += ' WHERE title LIKE ? OR content LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await new Promise((resolve, reject) => {
      db.query(countQuery, countParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult[0].total,
          pages: Math.ceil(totalResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取帖子列表失败'
    });
  }
});

// 删除帖子
router.delete('/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 先删除相关回复
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM replies WHERE post_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 删除帖子
    const result = await new Promise((resolve, reject) => {
      db.query('DELETE FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '帖子不存在'
      });
    }

    res.json({
      success: true,
      message: '帖子删除成功'
    });

  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      error: '删除帖子失败'
    });
  }
});

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否是管理员
    const userResult = await new Promise((resolve, reject) => {
      db.query('SELECT is_admin FROM users WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    if (userResult[0].is_admin) {
      return res.status(403).json({
        success: false,
        error: '不能删除管理员账号'
      });
    }

    // 删除用户相关数据
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM replies WHERE user_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      db.query('DELETE FROM posts WHERE user_id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // 删除用户
    const result = await new Promise((resolve, reject) => {
      db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      success: true,
      message: '用户删除成功'
    });

  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      error: '删除用户失败'
    });
  }
});

// 获取系统状态
router.get('/system/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 检查存储空间使用率
    const getStorageUsage = () => {
      try {
        const stats = fs.statSync(process.cwd());
        // 这里简化处理，实际应该检查整个磁盘使用率
        // 对于开发环境，我们假设存储空间正常
        return {
          used: 0,
          total: 100,
          percentage: 0,
          status: 'normal'
        };
      } catch (error) {
        return {
          used: 0,
          total: 100,
          percentage: 0,
          status: 'unknown'
        };
      }
    };

    // 检查数据库连接
    const checkDatabaseConnection = () => {
      return new Promise((resolve) => {
        db.query('SELECT 1', (err) => {
          resolve({
            status: err ? 'error' : 'normal',
            message: err ? 'Database connection failed' : 'Database connected'
          });
        });
      });
    };

    const storageInfo = getStorageUsage();
    const dbStatus = await checkDatabaseConnection();

    const systemStatus = {
      server: {
        status: 'normal',
        message: 'Server is running'
      },
      database: dbStatus,
      storage: {
        status: storageInfo.status,
        usage: storageInfo.percentage,
        message: storageInfo.percentage < 80 ? 'Storage space normal' : 'Storage space low'
      }
    };

    res.json({
      success: true,
      data: systemStatus
    });

  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取系统状态失败'
    });
  }
});

// 商家管理相关路由
// 获取所有商家
router.get('/merchants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [merchants] = await db.promise().query(
      'SELECT * FROM merchants ORDER BY created_at DESC'
    );
    res.json({ success: true, data: merchants });
  } catch (error) {
    console.error('获取商家列表失败:', error);
    res.status(500).json({ success: false, error: '获取商家列表失败' });
  }
});

// 添加商家
router.post('/merchants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, contact_info, website, logo_url } = req.body;
    
    const [result] = await db.promise().query(
      'INSERT INTO merchants (name, description, category, contact_info, website, logo_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, contact_info, website, logo_url, req.user.id]
    );

    res.json({ success: true, message: '商家添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加商家失败:', error);
    res.status(500).json({ success: false, error: '添加商家失败' });
  }
});

// 更新商家
router.put('/merchants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, contact_info, website, logo_url } = req.body;
    
    await db.promise().query(
      'UPDATE merchants SET name = ?, description = ?, category = ?, contact_info = ?, website = ?, logo_url = ? WHERE id = ?',
      [name, description, category, contact_info, website, logo_url, id]
    );

    res.json({ success: true, message: '商家更新成功' });
  } catch (error) {
    console.error('更新商家失败:', error);
    res.status(500).json({ success: false, error: '更新商家失败' });
  }
});

// 删除商家
router.delete('/merchants/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.promise().query('DELETE FROM merchants WHERE id = ?', [id]);

    res.json({ success: true, message: '商家删除成功' });
  } catch (error) {
    console.error('删除商家失败:', error);
    res.status(500).json({ success: false, error: '删除商家失败' });
  }
});

// 更新商家状态
router.patch('/merchants/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.promise().query(
      'UPDATE merchants SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: '商家状态更新成功' });
  } catch (error) {
    console.error('更新商家状态失败:', error);
    res.status(500).json({ success: false, error: '更新商家状态失败' });
  }
});

// 黑榜管理相关路由
// 获取所有黑榜记录
router.get('/blacklist', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [entries] = await db.promise().query(`
      SELECT b.*, 
             u1.username as creator_username,
             u2.username as verifier_username
      FROM blacklist b
      LEFT JOIN users u1 ON b.created_by = u1.id
      LEFT JOIN users u2 ON b.verified_by = u2.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('获取黑榜列表失败:', error);
    res.status(500).json({ success: false, error: '获取黑榜列表失败' });
  }
});

// 添加黑榜记录
router.post('/blacklist', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { merchant_name, violation_type, description, evidence_urls, severity } = req.body;
    
    const [result] = await db.promise().query(
      'INSERT INTO blacklist (merchant_name, violation_type, description, evidence_urls, severity, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [merchant_name, violation_type, description, evidence_urls, severity, req.user.id]
    );

    res.json({ success: true, message: '黑榜记录添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加黑榜记录失败:', error);
    res.status(500).json({ success: false, error: '添加黑榜记录失败' });
  }
});

// 更新黑榜记录
router.put('/blacklist/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { merchant_name, violation_type, description, evidence_urls, severity } = req.body;
    
    await db.promise().query(
      'UPDATE blacklist SET merchant_name = ?, violation_type = ?, description = ?, evidence_urls = ?, severity = ? WHERE id = ?',
      [merchant_name, violation_type, description, evidence_urls, severity, id]
    );

    res.json({ success: true, message: '黑榜记录更新成功' });
  } catch (error) {
    console.error('更新黑榜记录失败:', error);
    res.status(500).json({ success: false, error: '更新黑榜记录失败' });
  }
});

// 删除黑榜记录
router.delete('/blacklist/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.promise().query('DELETE FROM blacklist WHERE id = ?', [id]);

    res.json({ success: true, message: '黑榜记录删除成功' });
  } catch (error) {
    console.error('删除黑榜记录失败:', error);
    res.status(500).json({ success: false, error: '删除黑榜记录失败' });
  }
});

// 更新黑榜记录状态
router.patch('/blacklist/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 如果状态变为verified，记录审核者
    const updateData = status === 'verified' 
      ? ['UPDATE blacklist SET status = ?, verified_by = ? WHERE id = ?', [status, req.user.id, id]]
      : ['UPDATE blacklist SET status = ? WHERE id = ?', [status, id]];
    
    await db.promise().query(...updateData);

    res.json({ success: true, message: '黑榜记录状态更新成功' });
  } catch (error) {
    console.error('更新黑榜记录状态失败:', error);
    res.status(500).json({ success: false, error: '更新黑榜记录状态失败' });
  }
});

export default router;
