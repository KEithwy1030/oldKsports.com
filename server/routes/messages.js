import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 测试端点 - 验证路由是否正常工作
router.get('/test', (req, res) => {
  console.log('🧪 消息API测试端点被调用');
  res.json({ 
    success: true, 
    message: '消息API路由正常工作',
    timestamp: new Date().toISOString()
  });
});

// 获取聊天用户列表（按最新消息排序）
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END as id,
        u.username,
        u.avatar,
        (SELECT content FROM messages m2 
         WHERE (m2.sender_id = ? AND m2.receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) 
            OR (m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id = ?)
         ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages m2 
         WHERE (m2.sender_id = ? AND m2.receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) 
            OR (m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND m2.receiver_id = ?)
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END 
           AND m2.receiver_id = ? AND m2.is_read = FALSE) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY last_message_time DESC
    `;
    
    getDb().query(query, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], (err, results) => {
      if (err) {
        console.error('获取聊天用户列表失败:', err);
        return res.status(500).json({ success: false, error: '获取用户列表失败' });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error('获取聊天用户列表错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 获取与特定用户的对话消息
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 获取对话消息请求:', {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      currentUserId: req.user?.id,
      otherUserId: req.params.userId,
      user: req.user,
      headers: req.headers
    });
    
    // 确保返回JSON格式
    res.setHeader('Content-Type', 'application/json');
    
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    
    if (!currentUserId) {
      console.error('❌ 用户未认证');
      return res.status(401).json({ success: false, error: '用户未认证' });
    }
    
    if (!otherUserId || isNaN(otherUserId)) {
      console.error('❌ 无效的用户ID:', req.params.userId);
      return res.status(400).json({ success: false, error: '无效的用户ID' });
    }
    
    // 检查数据库连接
    const db = getDb();
    if (!db) {
      console.error('❌ 数据库连接失败');
      return res.status(500).json({ success: false, error: '数据库连接失败' });
    }
    
    const query = `
      SELECT 
        m.*,
        sender.username as sender_username,
        sender.avatar as sender_avatar
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;
    
    console.log('📝 执行查询:', query);
    console.log('📝 查询参数:', [currentUserId, otherUserId, otherUserId, currentUserId]);
    
    db.query(query, [currentUserId, otherUserId, otherUserId, currentUserId], (err, results) => {
      if (err) {
        console.error('❌ 获取对话消息失败:', err);
        return res.status(500).json({ success: false, error: '获取消息失败' });
      }
      
      console.log('✅ 获取对话消息成功，消息数量:', results.length);
      res.json({
        success: true,
        data: results || []
      });
    });
  } catch (error) {
    console.error('❌ 获取对话消息错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 发送私信
router.post('/', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;
    
    if (!receiver_id || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    
    // 验证接收者存在
    const checkUserQuery = 'SELECT id FROM users WHERE id = ?';
    getDb().query(checkUserQuery, [receiver_id], (err, userResults) => {
      if (err) {
        console.error('验证用户失败:', err);
        return res.status(500).json({ success: false, error: '验证用户失败' });
      }
      
      if (userResults.length === 0) {
        return res.status(404).json({ success: false, error: '接收者不存在' });
      }
      
      // 插入消息
      const insertQuery = `
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
      `;
      
      getDb().query(insertQuery, [senderId, receiver_id, content.trim()], (err, result) => {
        if (err) {
          console.error('发送消息失败:', err);
          return res.status(500).json({ success: false, error: '发送消息失败' });
        }
        
        res.json({
          success: true,
          message: '消息发送成功',
          messageId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 标记与特定用户的消息为已读
router.put('/mark-read/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);
    
    const query = `
      UPDATE messages 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `;
    
    getDb().query(query, [otherUserId, currentUserId], (err, result) => {
      if (err) {
        console.error('标记消息已读失败:', err);
        return res.status(500).json({ success: false, error: '标记失败' });
      }
      
      res.json({
        success: true,
        message: '消息已标记为已读',
        affectedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 标记所有消息为已读
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  console.log('🔥 收到mark-all-read请求, 用户ID:', req.user?.id);
  try {
    const currentUserId = req.user.id;
    
    const query = `
      UPDATE messages 
      SET is_read = TRUE 
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    
    getDb().query(query, [currentUserId], (err, result) => {
      if (err) {
        console.error('标记所有消息已读失败:', err);
        return res.status(500).json({ success: false, error: '标记失败' });
      }
      
      console.log('🔥 标记所有消息已读成功, 影响行数:', result.affectedRows);
      res.json({
        success: true,
        message: '所有消息已标记为已读',
        affectedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('标记所有消息已读错误:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

// 添加一个简单的测试路由
router.put('/test-route', (req, res) => {
  console.log('🔥 测试路由被调用');
  res.json({ success: true, message: '测试路由工作正常' });
});

// 强制触发文件更新
console.log('🔥 Messages路由文件已更新 - ' + new Date().toISOString());

export default router;
