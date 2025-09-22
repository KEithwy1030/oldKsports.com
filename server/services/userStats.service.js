// server/services/userStats.service.js
import { getDb } from '../db.js';

class UserStatsService {
  // 增加用户发帖数
  async incrementUserPosts(userId) {
    try {
      await getDb().execute(
        'UPDATE users SET total_posts = total_posts + 1 WHERE id = ?',
        [userId]
      );
      console.log(`✅ 用户 ${userId} 发帖数+1`);
    } catch (error) {
      console.error('❌ 更新用户发帖数失败:', error);
      throw error;
    }
  }

  // 增加用户回复数
  async incrementUserReplies(userId) {
    try {
      await getDb().execute(
        'UPDATE users SET total_replies = total_replies + 1 WHERE id = ?',
        [userId]
      );
      console.log(`✅ 用户 ${userId} 回复数+1`);
    } catch (error) {
      console.error('❌ 更新用户回复数失败:', error);
      throw error;
    }
  }

  // 更新用户签到状态
  async updateUserCheckin(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 获取用户当前签到信息
      const userRows = await new Promise((resolve, reject) => {
        getDb().execute(
          'SELECT consecutive_checkins, last_checkin_date FROM users WHERE id = ?',
          [userId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      if (userRows.length === 0) {
        throw new Error('用户不存在');
      }
      
      const user = userRows[0];
      let newConsecutiveCheckins = 1;
      
      // 如果昨天签到了，连续签到+1，否则重置为1
      if (user.last_checkin_date) {
        const lastCheckinDate = new Date(user.last_checkin_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastCheckinDate.toDateString() === yesterday.toDateString()) {
          newConsecutiveCheckins = user.consecutive_checkins + 1;
        }
      }
      
      // 更新签到信息
      await getDb().execute(
        'UPDATE users SET consecutive_checkins = ?, last_checkin_date = ? WHERE id = ?',
        [newConsecutiveCheckins, today, userId]
      );
      
      console.log(`✅ 用户 ${userId} 签到成功，连续签到 ${newConsecutiveCheckins} 天`);
      return newConsecutiveCheckins;
    } catch (error) {
      console.error('❌ 更新用户签到状态失败:', error);
      throw error;
    }
  }

  // 获取用户统计数据
  async getUserStats(userId) {
    try {
      const rows = await new Promise((resolve, reject) => {
        getDb().execute(
          'SELECT total_posts, total_replies, consecutive_checkins, last_checkin_date FROM users WHERE id = ?',
          [userId],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      if (rows.length === 0) {
        return {
          totalPosts: 0,
          totalReplies: 0,
          consecutiveCheckins: 0,
          lastCheckinDate: null
        };
      }
      
      const stats = rows[0];
      return {
        totalPosts: stats.total_posts || 0,
        totalReplies: stats.total_replies || 0,
        consecutiveCheckins: stats.consecutive_checkins || 0,
        lastCheckinDate: stats.last_checkin_date
      };
    } catch (error) {
      console.error('❌ 获取用户统计数据失败:', error);
      throw error;
    }
  }

  // 获取所有用户的统计数据（用于管理员）
  async getAllUsersStats() {
    try {
      const rows = await new Promise((resolve, reject) => {
        getDb().execute(
          'SELECT id, username, total_posts, total_replies, consecutive_checkins FROM users ORDER BY total_posts DESC',
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      return rows.map(row => ({
        id: row.id,
        username: row.username,
        totalPosts: row.total_posts || 0,
        totalReplies: row.total_replies || 0,
        consecutiveCheckins: row.consecutive_checkins || 0
      }));
    } catch (error) {
      console.error('❌ 获取所有用户统计数据失败:', error);
      throw error;
    }
  }
}

export default new UserStatsService();
