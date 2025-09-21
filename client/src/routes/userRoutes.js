// User routes
import express from 'express';
import userService from '../services/userService.js';
import authService from '../services/authService.js';
import { createSuccessResponse, createErrorResponse, ERROR_TYPES, asyncHandler } from '../utils/errorHandler.js';
import { validateRequest } from '../utils/validation.js';

const router = express.Router();

// Import authentication middleware
import { authenticateToken } from '../middleware/authMiddleware.js';

// Get user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const result = await userService.getProfile(req.user.userId);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(404).json(errorResponse);
  }
}));

// Update user profile
router.put('/me', authenticateToken, validateRequest({ validate: (data) => {
  const errors = [];
  if (data.username && (data.username.length < 2 || data.username.length > 50)) {
    errors.push('Username must be between 2 and 50 characters');
  }
  if (data.email && !data.email.includes('@')) {
    errors.push('Invalid email address');
  }
  return errors;
}}), asyncHandler(async (req, res) => {
  try {
    const result = await userService.updateProfile(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(400).json(errorResponse);
  }
}));

// Update user points
router.patch('/me/points', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { points } = req.body;
    
    if (typeof points !== 'number' || points < 0) {
      throw new Error('Points must be a positive number');
    }
    
    const result = await userService.updateUserPoints(req.user.userId, points);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(400).json(errorResponse);
  }
}));

// Get user posts
router.get('/:userId/posts', asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await userService.getUserPosts(userId, page, limit);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(500).json(errorResponse);
  }
}));

export default router;