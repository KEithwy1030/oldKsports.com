// CORS configuration middleware
import { createErrorResponse } from '../utils/errorHandler.js';

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // ONLY allow requests from http://localhost:5173
    const allowedOrigin = 'http://localhost:5173';
    
    if (origin === allowedOrigin) {
      console.log('Allowing origin:', origin);
      callback(null, true);
    } else {
      console.error('CORS error: Origin not allowed:', origin);
      console.error('Only', allowedOrigin, 'is allowed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
};

export const handleCorsError = (err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    const errorResponse = createErrorResponse(
      new Error('CORS policy violation'),
      req
    );
    res.status(403).json(errorResponse);
  } else {
    next();
  }
};