// server/controllers/userStats.controller.js
import userStatsService from '../services/userStats.service.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await userStatsService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    });
  }
};

export const updateUserCheckin = async (req, res) => {
  try {
    const userId = req.user.id;
    const consecutiveCheckins = await userStatsService.updateUserCheckin(userId);
    
    res.json({
      success: true,
      data: {
        consecutiveCheckins,
        message: '签到成功'
      }
    });
  } catch (error) {
    console.error('用户签到失败:', error);
    res.status(500).json({
      success: false,
      error: '签到失败'
    });
  }
};

export const getAllUsersStats = async (req, res) => {
  try {
    // 只有管理员可以查看所有用户统计
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '权限不足'
      });
    }
    
    const stats = await userStatsService.getAllUsersStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取所有用户统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    });
  }
};
