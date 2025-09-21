// Health check routes
import express from 'express';
import databaseService from '../services/database.js';
import { createSuccessResponse, createErrorResponse, asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// Health check endpoint
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: `Node.js ${process.version}`,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(createSuccessResponse(health));
}));

// Database connection check
router.get('/database', asyncHandler(async (req, res) => {
  try {
    const health = await databaseService.healthCheck();
    res.json(createSuccessResponse(health));
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(500).json(errorResponse);
  }
}));

export default router;