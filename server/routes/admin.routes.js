// server/routes/admin.routes.fixed.js
// 修复后的管理员路由文件
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDb } from '../db.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 获取数据库连接实例
const db = getDb();

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

// 数据库查询辅助函数
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// 管理员仪表板统计（全部真实数据）
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 总量统计
    const userStats = await dbQuery('SELECT COUNT(*) as total_users FROM users');
    const postStats = await dbQuery('SELECT COUNT(*) as total_posts FROM forum_posts');
    const replyStats = await dbQuery('SELECT COUNT(*) as total_replies FROM forum_replies');

    // 今日新增统计
    const todayPosts = await dbQuery("SELECT COUNT(*) as today_posts FROM forum_posts WHERE DATE(created_at) = CURDATE()");
    const todayReplies = await dbQuery("SELECT COUNT(*) as today_replies FROM forum_replies WHERE DATE(created_at) = CURDATE()");

    // 在线用户（近10分钟有登录或活跃）
    const onlineUsersRows = await dbQuery(
      `SELECT COUNT(*) AS online_users
       FROM users 
       WHERE last_login IS NOT NULL AND TIMESTAMPDIFF(MINUTE, last_login, NOW()) <= 10`
    );
    const onlineUsers = onlineUsersRows?.[0]?.online_users || 0;

    res.json({
      success: true,
      data: {
        totalUsers: (userStats?.[0]?.total_users) || 0,
        totalPosts: (postStats?.[0]?.total_posts) || 0,
        totalReplies: (replyStats?.[0]?.total_replies) || 0,
        onlineUsers,
        todayPosts: (todayPosts?.[0]?.today_posts) || 0,
        todayReplies: (todayReplies?.[0]?.today_replies) || 0,
        // 预留增长数据结构，前端做了 length 判断
        userGrowth: [],
        postGrowth: []
      }
    });
  } catch (error) {
    console.error('获取仪表板统计失败:', error);
    res.status(500).json({ success: false, error: '获取统计信息失败' });
  }
});

// 管理员活动日志
router.get('/dashboard/activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const recentPosts = await dbQuery(`
      SELECT p.*, u.username 
      FROM forum_posts p 
      JOIN users u ON p.author_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: recentPosts
    });
  } catch (error) {
    console.error('获取活动日志失败:', error);
    res.status(500).json({ success: false, error: '获取活动日志失败' });
  }
});

// 系统状态检查（前端期望包含 server/database/storage 三段）
router.get('/system/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 检查数据库连接
    await dbQuery('SELECT 1 as health_check');

    // 服务器状态（进程与时间）
    const serverStatus = { status: 'normal', message: 'Server is running', uptimeSec: Math.floor(process.uptime()) };

    // 存储使用（统计 uploads 目录体积，作为简化指标）
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads', 'images');
    let totalBytes = 0;
    try {
      if (fs.existsSync(uploadsRoot)) {
        const files = fs.readdirSync(uploadsRoot);
        for (const f of files) {
          const fp = path.join(uploadsRoot, f);
          const stat = fs.statSync(fp);
          if (stat.isFile()) totalBytes += stat.size;
        }
      }
    } catch (_) { /* ignore */ }
    // 以 2GB 为参考容量估算占用百分比，避免读取磁盘分区信息带来跨平台差异
    const referenceCapacity = 2 * 1024 * 1024 * 1024; // 2GB
    const usage = Math.min(100, Math.round((totalBytes / referenceCapacity) * 100));
    const storageStatus = { status: 'normal', usage, message: 'Uploads OK' };

    res.json({
      success: true,
      data: {
        server: serverStatus,
        database: { status: 'normal', message: 'Database connected' },
        storage: storageStatus
      }
    });
  } catch (error) {
    console.error('系统状态检查失败:', error);
    res.status(500).json({
      success: false,
      error: '系统状态检查失败',
      data: {
        server: { status: 'degraded', message: 'Server error' },
        database: { status: 'error', message: 'Database disconnected' },
        storage: { status: 'unknown', usage: 0, message: 'Unknown' }
      }
    });
  }
});

// 用户管理
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbQuery(`
      SELECT id, username, email, points, is_admin, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await dbQuery('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

// 商家管理相关路由
// 获取所有商家
router.get('/merchants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const merchants = await dbQuery('SELECT * FROM merchants ORDER BY created_at DESC');
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
    
    const result = await dbQuery(
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
    
    await dbQuery(
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
    
    await dbQuery('DELETE FROM merchants WHERE id = ?', [id]);
    
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
    
    await dbQuery(
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
    const entries = await dbQuery(`
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
    
    const result = await dbQuery(
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
    
    const result = await dbQuery(
      'UPDATE blacklist SET merchant_name = ?, violation_type = ?, description = ?, evidence_urls = ?, severity = ? WHERE id = ?',
      [merchant_name, violation_type, description, evidence_urls, severity, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: '黑榜记录未找到' });
    }
    
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
    
    await dbQuery('DELETE FROM blacklist WHERE id = ?', [id]);
    
    res.json({ success: true, message: '黑榜记录删除成功' });
  } catch (error) {
    console.error('删除黑榜记录失败:', error);
    res.status(500).json({ success: false, error: '删除黑榜记录失败' });
  }
});

// 验证黑榜记录
router.patch('/blacklist/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verification_notes } = req.body;
    
    const updateData = [];
    const updateValues = [];
    
    if (verified !== undefined) {
      updateData.push('verified = ?');
      updateValues.push(verified);
    }
    
    if (verification_notes !== undefined) {
      updateData.push('verification_notes = ?');
      updateValues.push(verification_notes);
    }
    
    updateData.push('verified_by = ?', 'verified_at = NOW()');
    updateValues.push(req.user.id, id);
    
    const sql = `UPDATE blacklist SET ${updateData.join(', ')} WHERE id = ?`;
    
    await dbQuery(sql, updateValues);
    
    res.json({ success: true, message: '黑榜记录验证成功' });
  } catch (error) {
    console.error('验证黑榜记录失败:', error);
    res.status(500).json({ success: false, error: '验证黑榜记录失败' });
  }
});

export default router;
