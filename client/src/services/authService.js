// Authentication service for handling auth-related business logic
import userService from './userService.js';
import { loginSchema, registerSchema, sanitizeUserInput } from '../utils/validation.js';
import { createSuccessResponse, createErrorResponse, ERROR_TYPES } from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123456789';

class AuthService {
  // User login
  async login(email, password) {
    try {
      // Validate input
      const validationErrors = loginSchema.validate({ email, password });
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      // Use userService for login logic
      const result = await userService.login(email, password);
      
      return result;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  // User registration
  async register(username, email, password) {
    try {
      // Validate input
      const validationErrors = registerSchema.validate({ username, email, password });
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      const sanitizedData = sanitizeUserInput({ username, email, password });
      
      // Use userService for registration logic
      const result = await userService.register(sanitizedData);
      
      return result;
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  // Extract token from header
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }
    
    return token;
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      // Check if user exists
      const userResponse = await userService.getUserByEmail(email);
      if (!userResponse.success || !userResponse.data) {
        // Security: Don't reveal if email exists
        return createSuccessResponse({
          message: '如果该邮箱地址已注册，重置密码链接已发送到您的邮箱'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      // For development/testing, skip database update and return reset link directly
      const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
    const resetLink = apiBaseUrl === '/api'
      ? `http://localhost:8080/reset-password/${resetToken}`
        : `${apiBaseUrl.replace('/api', '')}/reset-password/${resetToken}`;

      return createSuccessResponse({
        message: '重置密码链接已发送到您的邮箱',
        resetLink: resetLink // Return reset link for development/testing
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, password, confirmPassword) {
    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error('密码确认不匹配');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('密码长度至少为6位');
      }

      // Find user by reset token
      const userResponse = await userService.getUserByResetToken(token);
      if (!userResponse.success || !userResponse.data) {
        throw new Error('重置链接无效或已过期');
      }

      // Check if token is expired
      const user = userResponse.data;
      if (new Date() > new Date(user.resetTokenExpires)) {
        throw new Error('重置链接已过期');
      }

      // Update password and clear reset token
      await userService.updateUser(user.id, {
        password: password, // In production, hash the password
        resetToken: null,
        resetTokenExpires: null
      });

      return createSuccessResponse({
        message: '密码重置成功，请使用新密码登录'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

export default new AuthService();