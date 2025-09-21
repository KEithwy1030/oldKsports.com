// Authentication middleware
import authService from '../services/authService.js';
import { createErrorResponse } from '../utils/errorHandler.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authService.extractTokenFromHeader(authHeader);
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const errorResponse = createErrorResponse(error, req);
    res.status(401).json(errorResponse);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json(createErrorResponse(
      new Error('Admin access required'),
      req
    ));
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authService.extractTokenFromHeader(authHeader);
      const decoded = authService.verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};