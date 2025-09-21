// Authentication routes
import express from 'express';
import authService from '../services/authService.js';
import { createSuccessResponse, createErrorResponse, ERROR_TYPES, asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// User login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(401).json(errorResponse);
  }
}));

// User registration
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json(errorResponse);
  }
}));

// Forgot password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(400).json(errorResponse);
  }
}));

// Reset password
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  
  try {
    const result = await authService.resetPassword(token, password, confirmPassword);
    res.json(result);
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(400).json(errorResponse);
  }
}));

export default router;