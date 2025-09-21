// Input validation and sanitization utilities

// Simple validation without zod (for backend compatibility)
export const userSchema = {
  validate: (userData) => {
    const errors = [];
    
    if (!userData.username || userData.username.length < 2 || userData.username.length > 50) {
      errors.push('Username must be between 2 and 50 characters');
    }
    
    if (!userData.email || !userData.email.includes('@')) {
      errors.push('Invalid email address');
    }
    
    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return errors;
  }
};

export const loginSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.email || !data.email.includes('@')) {
      errors.push('Invalid email address');
    }
    
    if (!data.password || data.password.length === 0) {
      errors.push('Password is required');
    }
    
    return errors;
  }
};

export const registerSchema = {
  validate: (data) => {
    const errors = [];
    
    if (!data.username || data.username.length < 2 || data.username.length > 50) {
      errors.push('Username must be between 2 and 50 characters');
    }
    
    if (!data.email || !data.email.includes('@')) {
      errors.push('Invalid email address');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return errors;
  }
};

export const updateProfileSchema = {
  validate: (userData) => {
    const errors = [];
    
    if (userData.username && (userData.username.length < 2 || userData.username.length > 50)) {
      errors.push('Username must be between 2 and 50 characters');
    }
    
    if (userData.email && !userData.email.includes('@')) {
      errors.push('Invalid email address');
    }
    
    return errors;
  }
};

// Sanitization functions
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Basic XSS prevention
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const sanitizeUserInput = (userData) => {
  const sanitized = { ...userData };
  
  if (sanitized.username) {
    sanitized.username = sanitizeInput(sanitized.username.trim());
  }
  
  if (sanitized.email) {
    sanitized.email = sanitizeInput(sanitized.email.trim());
  }
  
  if (sanitized.avatar) {
    sanitized.avatar = sanitizeInput(sanitized.avatar);
  }
  
  return sanitized;
};

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const errors = schema.validate(req.body);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.map(err => ({
            field: 'body',
            message: err
          }))
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    
    // Remove old requests
    const validRequests = clientRequests.filter(time => now - time < windowMs);
    requests.set(clientId, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Please try again later'
      });
    }
    
    validRequests.push(now);
    next();
  };
};