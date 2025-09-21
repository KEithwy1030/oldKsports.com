// Global error handling utilities

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Create standardized error responses
export const createErrorResponse = (error, req = null) => {
  const { statusCode = 500, code = 'INTERNAL_ERROR', message } = error;
  
  const response = {
    success: false,
    error: {
      code,
      message: message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
  };
  
  // Add request details for debugging (in development)
  if (process.env.NODE_ENV === 'development' && req) {
    response.error.request = {
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
  }
  
  return response;
};

// Success response creator
export const createSuccessResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };
};

// Database error handler
export const handleDatabaseError = (error) => {
  console.error('Database Error:', error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    throw new AppError('Resource already exists', 409, 'DUPLICATE_ENTRY');
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('Referenced resource not found', 404, 'NOT_FOUND');
  }
  
  if (error.code === 'ER_BAD_FIELD_ERROR') {
    throw new AppError(`Database field error: ${error.sqlMessage}`, 500, 'DATABASE_FIELD_ERROR');
  }
  
  if (error.code === 'DATABASE_ERROR') {
    throw new AppError(`Database operation failed: ${error.message}`, 500, 'DATABASE_ERROR');
  }
  
  throw new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

// Authentication error handler
export const handleAuthError = (error) => {
  console.error('Authentication Error:', error);
  
  if (error.name === 'JsonWebTokenError') {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }
  
  throw new AppError('Authentication failed', 401, 'AUTHENTICATION_ERROR');
};

// Global error handler for Express
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_FORMAT';
    message = 'Invalid ID format';
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
    message = 'File too large';
  }
  
  const errorResponse = createErrorResponse(err, req);
  
  // Add stack trace in development
  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (req, res) => {
  const errorResponse = createErrorResponse(
    new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND'),
    req
  );
  res.status(404).json(errorResponse);
};

// API client error handler
export const handleApiError = (error) => {
  console.error('API Client Error:', error);
  
  if (error.message.includes('Network Error')) {
    return '网络连接失败，请检查网络设置';
  }
  
  if (error.message.includes('401')) {
    return '登录已过期，请重新登录';
  }
  
  if (error.message.includes('403')) {
    return '权限不足，无法执行此操作';
  }
  
  if (error.message.includes('404')) {
    return '请求的资源不存在';
  }
  
  if (error.message.includes('413')) {
    return '文件过大，请选择小于10MB的图片';
  }
  
  if (error.message.includes('429')) {
    return '请求过于频繁，请稍后重试';
  }
  
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  return error.message || '操作失败，请重试';
};

export default AppError;