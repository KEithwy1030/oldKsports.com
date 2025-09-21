// server/routes/userStats.js
import express from 'express';
import { getUserStats, updateUserCheckin, getAllUsersStats } from '../controllers/userStats.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取当前用户统计数据
router.get('/me', authenticateToken, getUserStats);

// 用户签到
router.post('/me/checkin', authenticateToken, updateUserCheckin);

// 获取所有用户统计数据（管理员）
router.get('/all', authenticateToken, getAllUsersStats);

export default router;
