// server/controllers/user.controller.js
import jwt from 'jsonwebtoken';
import { updateUserPoints as updateUserPointsService } from '../services/user.service.js';
import { db } from '../db.js';

const getUserInfoFromToken = (req) => {
    let token = req.cookies.access_token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "oldksports_jwt_secret_key_2024");
    } catch (err) {
        return null;
    }
};

export const updateUserPoints = async (req, res) => {
    try {
        const { points } = req.body;
        if (typeof points !== 'number') {
            return res.status(400).json({ error: "Points must be a number" });
        }

        const result = await updateUserPointsService(req.user.id, points);
        return res.status(200).json({ 
            success: true, 
            message: "Points updated successfully",
            points: points 
        });
    } catch (err) {
        console.error('Update points error:', err);
        return res.status(500).json({ error: "Failed to update points" });
    }
};

export const getUserAvatar = async (req, res) => {
    try {
        const { username } = req.params;
        
        const rows = await new Promise((resolve, reject) => {
            db.query(
                'SELECT avatar FROM users WHERE username = ?',
                [username],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = rows[0];
        res.json({ 
            success: true, 
            avatar: user.avatar 
        });
    } catch (error) {
        console.error('Error getting user avatar:', error);
        res.status(500).json({ success: false, error: 'Failed to get avatar' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        // 构建动态更新SQL
        const allowedFields = ['avatar', 'email', 'username', 'hasUploadedAvatar'];
        const fieldsToUpdate = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                // 处理字段名映射
                if (key === 'hasUploadedAvatar') {
                    fieldsToUpdate.push('has_uploaded_avatar = ?');
                    values.push(value ? 1 : 0);
                } else {
                    fieldsToUpdate.push(`${key} = ?`);
                    values.push(value);
                }
            }
        }
        
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }
        
        values.push(userId);
        const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 获取更新后的用户信息
        const updatedUser = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, username, email, points, avatar, has_uploaded_avatar, created_at FROM users WHERE id = ?',
                [userId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                points: updatedUser.points,
                avatar: updatedUser.avatar,
                hasUploadedAvatar: updatedUser.has_uploaded_avatar,
                joinDate: updatedUser.created_at
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const { username } = req.params;
        const rows = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, username, email, points, avatar, has_uploaded_avatar, created_at FROM users WHERE username = ?',
                [username],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const user = rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: user.points,
                avatar: user.avatar,
                hasUploadedAvatar: user.has_uploaded_avatar,
                joinDate: user.created_at
            }
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ success: false, error: 'Failed to get user info' });
    }
};
