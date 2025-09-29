import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取用户未读通知数量
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        COUNT(*) as total_unread,
        SUM(CASE WHEN type = 'reply' THEN 1 ELSE 0 END) as reply_count,
        SUM(CASE WHEN type = 'mention' THEN 1 ELSE 0 END) as mention_count,
        SUM(CASE WHEN type = 'message' THEN 1 ELSE 0 END) as message_count,
        SUM(CASE WHEN type = 'system' THEN 1 ELSE 0 END) as system_count
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
    `;
    
    console.log('🔔 获取未读通知数量查询:', query);
    console.log('🔔 用户ID:', userId);
    
    getDb().query(query, [userId], (err, results) => {
      if (err) {
        console.error('❌ 获取未读通知数量失败:', err);
        return res.status(500).json({ success: false, error: '获取通知失败' });
      }
      
      const counts = results[0];
      console.log('🔔 未读通知数量结果:', counts);
      
      res.json({
        success: true,
        data: {
          total: parseInt(counts.total_unread) || 0,
          reply: parseInt(counts.reply_count) || 0,
          mention: parseInt(counts.mention_count) || 0,
          message: parseInt(counts.message_count) || 0,
          system: parseInt(counts.system_count) || 0
        }
      });
    });
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 获取用户通知列表
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE n.user_id = ?';
    let queryParams = [userId];
    
    if (type && ['reply', 'mention', 'message', 'system'].includes(type)) {
      whereClause += ' AND n.type = ?';
      queryParams.push(type);
    }
    
    const query = `
      SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message as content,
        n.type,
        n.is_read,
        n.created_at
      FROM notifications n
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    console.log('🔔 完整SQL查询:', query);
    console.log('🔔 查询参数详情:', queryParams);
    
    queryParams.push(parseInt(limit), parseInt(offset));
    
    console.log('🔔 获取通知列表查询:', query);
    console.log('🔔 查询参数:', queryParams);
    
    getDb().query(query, queryParams, (err, results) => {
      if (err) {
        console.error('❌ 获取通知列表失败:', {
          error: err.message,
          code: err.code,
          errno: err.errno,
          sqlState: err.sqlState,
          sql: query,
          params: queryParams
        });
        return res.status(500).json({ 
          success: false, 
          error: '获取通知失败',
          details: err.message 
        });
      }
      
      console.log('🔔 通知查询结果:', {
        count: results.length,
        results: results
      });
      
      res.json({
        success: true,
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.length
        }
      });
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 标记通知为已读
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds, type } = req.body;
    
    let query;
    let queryParams;
    
    if (notificationIds && Array.isArray(notificationIds)) {
      // 标记指定通知为已读
      const placeholders = notificationIds.map(() => '?').join(',');
      query = `UPDATE notifications SET is_read = TRUE WHERE id IN (${placeholders}) AND user_id = ?`;
      queryParams = [...notificationIds, userId];
    } else if (type) {
      // 标记某类型的所有通知为已读
      query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND type = ?';
      queryParams = [userId, type];
    } else {
      // 标记所有通知为已读
      query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ?';
      queryParams = [userId];
    }
    
    getDb().query(query, queryParams, (err, result) => {
      if (err) {
        console.error('标记通知已读失败:', err);
        return res.status(500).json({ success: false, error: '标记失败' });
      }
      
      res.json({
        success: true,
        message: '通知已标记为已读',
        affectedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 创建新通知（内部使用）
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { recipientId, senderId, type, title, content, relatedPostId, relatedReplyId } = req.body;
    
    // 验证通知类型
    if (!['reply', 'mention', 'message', 'system'].includes(type)) {
      return res.status(400).json({ success: false, error: '无效的通知类型' });
    }
    
    const query = `
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    getDb().query(query, [recipientId, title, content, type, false], (err, result) => {
      if (err) {
        console.error('创建通知失败:', err);
        return res.status(500).json({ success: false, error: '创建通知失败' });
      }
      
      res.json({
        success: true,
        message: '通知创建成功',
        notificationId: result.insertId
      });
    });
  } catch (error) {
    console.error('创建通知错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 删除通知
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    const query = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';
    
    getDb().query(query, [notificationId, userId], (err, result) => {
      if (err) {
        console.error('删除通知失败:', err);
        return res.status(500).json({ success: false, error: '删除失败' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: '通知不存在或无权限删除' });
      }
      
      res.json({
        success: true,
        message: '通知删除成功'
      });
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

export default router;
