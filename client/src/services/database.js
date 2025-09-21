// Database connection and utility functions
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { handleDatabaseError } from '../utils/errorHandler.js';

dotenv.config();

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.isInitialized = false;
  }

  // Initialize database connection pool
  async initialize() {
    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'oldksports',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // Additional configuration for better performance
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      };

      this.pool = mysql.createPool(dbConfig);
      
      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      this.isConnected = true;
      this.isInitialized = true;
      console.log('✅ Database connection successful');
      
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      this.isInitialized = false;
      throw handleDatabaseError(error);
    }
  }

  // Get database connection
  getConnection() {
    if (!this.isConnected || !this.pool || !this.isInitialized) {
      throw new Error('Database not initialized or connection lost');
    }
    return this.pool.getConnection();
  }

  // Execute query with error handling
  async query(sql, params = []) {
    try {
      const [results] = await this.pool.query(sql, params);
      return results;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Execute transaction
  async transaction(callback) {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create a proxy for the connection that adds query method with error handling
      const transactionConnection = {
        query: async (sql, params) => {
          const [results] = await connection.query(sql, params);
          return results;
        },
        beginTransaction: connection.beginTransaction.bind(connection),
        commit: connection.commit.bind(connection),
        rollback: connection.rollback.bind(connection),
        release: connection.release.bind(connection)
      };
      
      // Execute user's callback with the transaction connection
      const result = await callback(transactionConnection);
      
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw handleDatabaseError(error);
    } finally {
      connection.release();
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isInitialized || !this.isConnected) {
        return {
          status: 'disconnected',
          timestamp: new Date().toISOString(),
          error: 'Database not initialized'
        };
      }
      
      const connection = await this.getConnection();
      await connection.ping();
      connection.release();
      
      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
        pool: {
          totalConnections: this.pool.pool.allConnections ? this.pool.pool.allConnections.length : 0,
          activeConnections: this.pool.pool.allConnections ? this.pool.pool.allConnections.length : 0,
          freeConnections: this.pool.pool.freeConnections ? this.pool.pool.freeConnections.length : 0
        }
      };
    } catch (error) {
      return {
        status: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const [users] = await this.query(
        'SELECT id, username, email, points, level, join_date, last_login, is_admin, roles, avatar, has_uploaded_avatar FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      if (user.join_date) {
        user.joinDate = new Date(user.join_date);
      }
      if (user.last_login) {
        user.lastLogin = new Date(user.last_login);
      }
      
      return user;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const users = await this.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (!users || users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Get user by reset token
  async getUserByResetToken(token) {
    try {
      const users = await this.query(
        'SELECT * FROM users WHERE reset_token = ?',
        [token]
      );
      
      if (!users || users.length === 0) {
        return null;
      }
      
      return users[0];
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Create user
  async createUser(userData) {
    try {
      const result = await this.query(
        'INSERT INTO users (username, email, password, points, level, join_date, last_login, is_admin, roles, avatar, has_uploaded_avatar) VALUES (?, ?, ?, 20, \'bronze\', NOW(), NOW(), 0, ?, ?, false)',
        [userData.username, userData.email, userData.password, JSON.stringify([]), null]
      );
      
      return { id: result.insertId, ...userData };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const { username, email, avatar, hasUploadedAvatar, points, password, resetToken, resetTokenExpires } = userData;
      
      const updateFields = [];
      const updateValues = [];
      
      if (username) {
        updateFields.push('username = ?');
        updateValues.push(username);
      }
      
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      
      if (avatar !== undefined) {
        updateFields.push('avatar = ?');
        updateValues.push(avatar);
      }
      
      if (hasUploadedAvatar !== undefined) {
        updateFields.push('has_uploaded_avatar = ?');
        updateValues.push(hasUploadedAvatar);
      }
      
      if (points !== undefined) {
        updateFields.push('points = ?');
        updateValues.push(points);
      }
      
      if (password !== undefined) {
        updateFields.push('password = ?');
        updateValues.push(password);
      }
      
      if (resetToken !== undefined) {
        updateFields.push('reset_token = ?');
        updateValues.push(resetToken);
      }
      
      if (resetTokenExpires !== undefined) {
        updateFields.push('reset_token_expires = ?');
        updateValues.push(resetTokenExpires);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      updateValues.push(userId);
      
      const result = await this.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.getUserById(userId);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Update user last login
  async updateUserLastLogin(userId) {
    try {
      await this.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [userId]
      );
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Get user posts
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [posts] = await this.query(
        'SELECT * FROM forum_posts WHERE author_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      const [totalCount] = await this.query(
        'SELECT COUNT(*) as total FROM forum_posts WHERE author_id = ?',
        [userId]
      );
      
      return {
        posts: posts.map(post => ({
          ...post,
          timestamp: new Date(post.created_at)
        })),
        pagination: {
          page,
          limit,
          total: totalCount[0].total,
          pages: Math.ceil(totalCount[0].total / limit)
        }
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // Close database connection
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database connection closed');
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();

export default databaseService;