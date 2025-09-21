// server/controllers/auth.controller.js
import { findUserByUsername, findUserByUsernameOrEmail, findUserByEmail, findUserByResetToken, createUser, createPasswordResetToken, resetPassword } from '../services/auth.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import NotificationService from '../services/notification.service.js';

dotenv.config();

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "用户名、邮箱和密码都是必填项" 
            });
        }
        
        // Check if username already exists
        const existingUsers = await findUserByUsername(username);
        if (existingUsers.length) {
            return res.status(409).json({ 
                success: false, 
                message: "用户名已被注册" 
            });
        }
        
        // Check if email already exists
        const existingEmails = await findUserByEmail(email);
        if (existingEmails.length) {
            return res.status(409).json({ 
                success: false, 
                message: "邮箱已被注册" 
            });
        }
        
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        
        // Create user with email
        await createUser(username, email, hash);
        
        // 获取新创建用户的ID
        const newUsers = await findUserByUsername(username);
        if (newUsers.length > 0) {
            const newUserId = newUsers[0].id;
            
            // 创建系统欢迎通知
            try {
                await NotificationService.createSystemNotification(
                    newUserId,
                    '欢迎加入OldkSports体育社区！',
                    `🎉 欢迎 ${username} 加入我们的体育社区！\n\n在这里您可以：\n• 📝 发布体育相关的帖子和讨论\n• 💬 与其他体育爱好者交流互动\n• 🏆 参与论坛活动，积累积分等级\n• 🔍 浏览优质商家和服务信息\n• 💌 通过私信功能与其他用户深入交流\n\n点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！`
                );
                console.log('新用户欢迎通知创建成功');
            } catch (notifyError) {
                console.error('创建欢迎通知失败:', notifyError);
                // 不影响注册流程
            }
        }
        
        return res.status(201).json({ 
            success: true, 
            message: "用户注册成功" 
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ 
            success: false, 
            message: "注册失败，请稍后重试" 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "用户名和密码都是必填项" 
            });
        }
        
        // Find user by username or email
        const users = await findUserByUsernameOrEmail(username);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "用户不存在" 
            });
        }
        
        const user = users[0];
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ 
                success: false, 
                message: "用户名或密码错误" 
            });
        }
        
        // Generate JWT token with expiration
        const jwtSecret = process.env.JWT_SECRET || "oldksports_jwt_secret_key_2024";
        const token = jwt.sign(
            { userId: user.id }, 
            jwtSecret,
            { expiresIn: '7d' } // 7天过期
        );
        
        console.log('JWT生成:', { 
            userId: user.id, 
            secretLength: jwtSecret.length,
            tokenLength: token.length 
        });
        
        // Remove sensitive data
        const { password: _, ...userData } = user;
        
        // Set cookie and return user data
        res.cookie("access_token", token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).status(200).json({
            success: true,
            user: userData,
            token: token
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ 
            success: false, 
            message: "登录失败，请稍后重试" 
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("access_token", { sameSite: "none", secure: true }).status(200).json("User has been logged out.");
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "请输入有效的邮箱地址" 
            });
        }
        
        // Find user by email
        const users = await findUserByEmail(email);
        if (users.length === 0) {
            // For security reasons, don't reveal that the email doesn't exist
            return res.status(200).json({ 
                success: true, 
                message: "如果该邮箱地址已注册，重置密码链接已发送到您的邮箱" 
            });
        }
        
        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Store reset token in database
        await createPasswordResetToken(email, resetToken, resetTokenExpires);
        
        // In production, you would send an email with the reset link
        // For development, return the reset link
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        
        return res.status(200).json({ 
            success: true,
            message: "重置密码链接已发送到您的邮箱",
            resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ 
            success: false, 
            message: "处理请求时发生错误，请稍后重试" 
        });
    }
};

export const resetPasswordToken = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        
        // Validate token format
        if (!token || token.length !== 64) {
            return res.status(400).json({ 
                success: false, 
                message: "无效的重置令牌" 
            });
        }
        
        // Validate password
        if (!password || password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "密码至少需要6位字符" 
            });
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "两次输入的密码不一致" 
            });
        }
        
        // Find user by reset token
        const users = await findUserByResetToken(token);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "重置令牌无效或已过期" 
            });
        }
        
        // Hash new password
        const salt = bcrypt.genSaltSync(10);
        const newPasswordHash = bcrypt.hashSync(password, salt);
        
        // Update password and clear reset token
        await resetPassword(token, newPasswordHash);
        
        return res.status(200).json({ 
            success: true, 
            message: "密码重置成功，请使用新密码登录" 
        });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ 
            success: false, 
            message: "重置密码失败，请稍后重试" 
        });
    }
};