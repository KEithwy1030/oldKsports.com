// User service for handling user-related business logic
import databaseService from './database.js';
import { createSuccessResponse, createErrorResponse, ERROR_TYPES } from '../utils/errorHandler.js';
import { userSchema, updateProfileSchema, sanitizeUserInput } from '../utils/validation.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123456789';

class UserService {
  // User registration
  async register(userData) {
    try {
      // Validate input
      const validationErrors = userSchema.validate(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      const sanitizedData = sanitizeUserInput(userData);
      
      // Check if user already exists
      const existingUser = await databaseService.getUserByEmail(sanitizedData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create user
      const newUser = await databaseService.createUser(sanitizedData);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Format user data for response
      const formattedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        points: newUser.points,
        level: newUser.level,
        joinDate: newUser.joinDate,
        lastLogin: newUser.lastLogin,
        isAdmin: newUser.is_admin,
        roles: [],
        avatar: newUser.avatar,
        hasUploadedAvatar: newUser.has_uploaded_avatar
      };
      
      return createSuccessResponse({
        message: 'Registration successful',
        token,
        user: formattedUser
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User login
  async login(email, password) {
    try {
      // Find user by email
      const user = await databaseService.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Simple password check (in production, use bcrypt)
      if (user.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      await databaseService.updateUserLastLogin(user.id);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Format user data for response
      const formattedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        joinDate: new Date(user.join_date),
        lastLogin: new Date(user.last_login),
        isAdmin: user.is_admin,
        roles: [],
        avatar: user.avatar,
        hasUploadedAvatar: user.has_uploaded_avatar
      };
      
      return createSuccessResponse({
        message: 'Login successful',
        token,
        user: formattedUser
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return createSuccessResponse(user);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, userData) {
    try {
      // Validate input
      const validationErrors = updateProfileSchema.validate(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      const sanitizedData = sanitizeUserInput(userData);
      
      // Update user
      const updatedUser = await databaseService.updateUser(userId, sanitizedData);
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return createSuccessResponse({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const updatedUser = await databaseService.updateUser(userId, userData);
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return createSuccessResponse({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Update user points
  async updateUserPoints(userId, points) {
    try {
      const updatedUser = await databaseService.updateUser(userId, { points });
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return createSuccessResponse({
        message: 'User points updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update points error:', error);
      throw error;
    }
  }

  // Get user posts
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const posts = await databaseService.getUserPosts(userId, page, limit);
      return createSuccessResponse(posts);
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const user = await databaseService.getUserByEmail(email);
      if (!user) {
        return createErrorResponse('User not found', ERROR_TYPES.NOT_FOUND);
      }
      return createSuccessResponse(user);
    } catch (error) {
      console.error('Get user by email error:', error);
      throw error;
    }
  }

  // Get user by reset token
  async getUserByResetToken(token) {
    try {
      const user = await databaseService.getUserByResetToken(token);
      if (!user) {
        return createErrorResponse('User not found', ERROR_TYPES.NOT_FOUND);
      }
      return createSuccessResponse(user);
    } catch (error) {
      console.error('Get user by reset token error:', error);
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
}

export default new UserService();