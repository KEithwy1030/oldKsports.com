// server/routes/users.js
import express from 'express';
import { updateUserPoints, getUserAvatar, getUserInfo, updateUserProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.patch('/me/points', authenticateToken, updateUserPoints);

// 更新用户资料
router.put('/me', authenticateToken, updateUserProfile);

// 获取用户头像
router.get('/:username/avatar', getUserAvatar);

// 获取用户信息（包括积分）
router.get('/:username/info', getUserInfo);

export default router;
