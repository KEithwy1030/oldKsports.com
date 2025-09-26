// server/controllers/user.controller.js
import jwt from 'jsonwebtoken';
import { updateUserPoints as updateUserPointsService } from '../services/user.service.js';
import { getDb } from '../db.js';

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
            getDb().query(
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
        console.log('更新用户资料请求:', {
            userId: req.user?.id,
            body: req.body,
            headers: req.headers
        });
        
        const userId = req.user.id;
        const updateData = req.body;
        
        // 构建动态更新SQL
        const allowedFields = ['avatar', 'email', 'username', 'hasUploadedAvatar', 'roles'];
        const fieldsToUpdate = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                // 处理字段名映射
                if (key === 'hasUploadedAvatar') {
                    fieldsToUpdate.push('has_uploaded_avatar = ?');
                    values.push(value ? 1 : 0);
                } else if (key === 'roles') {
                    // 处理roles数组，转换为JSON字符串
                    fieldsToUpdate.push('roles = ?');
                    values.push(JSON.stringify(value));
                } else {
                    fieldsToUpdate.push(`${key} = ?`);
                    values.push(value);
                }
            }
        }
        
        if (fieldsToUpdate.length === 0) {
            console.log('没有有效字段需要更新:', updateData);
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }
        
        values.push(userId);
        const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        
        console.log('执行SQL更新:', { sql, values });
        
        await new Promise((resolve, reject) => {
            getDb().query(sql, values, (err, result) => {
                if (err) {
                    console.error('SQL更新失败:', err);
                    reject(err);
                } else {
                    console.log('SQL更新成功:', result);
                    resolve(result);
                }
            });
        });
        
        // 获取更新后的用户信息
        const updatedUser = await new Promise((resolve, reject) => {
            getDb().query(
                'SELECT id, username, email, points, avatar, has_uploaded_avatar, role, roles, created_at FROM users WHERE id = ?',
                [userId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                }
            );
        });
        
        // 解析roles JSON字段
        let roles = null;
        if (updatedUser.roles) {
            try {
                // 尝试解析JSON格式
                roles = JSON.parse(updatedUser.roles);
            } catch (e) {
                // 如果JSON解析失败，尝试解析逗号分隔的字符串
                try {
                    if (typeof updatedUser.roles === 'string' && updatedUser.roles.includes(',')) {
                        roles = updatedUser.roles.split(',').map(role => role.trim()).filter(role => role);
                    } else if (typeof updatedUser.roles === 'string') {
                        roles = [updatedUser.roles.trim()];
                    }
                } catch (e2) {
                    console.warn('Failed to parse roles:', updatedUser.roles);
                    roles = null;
                }
            }
        }
        
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
                role: updatedUser.role || '用户',
                roles: roles,
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
            getDb().query(
                'SELECT id, username, email, points, avatar, has_uploaded_avatar, role, roles, created_at FROM users WHERE username = ?',
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
        
        // 计算用户等级
        const { getUserLevel } = await import('../utils/userLevel.js');
        const level = getUserLevel(user.points);
        
        // 解析roles JSON字段
        console.log('用户数据调试 - 用户名:', user.username);
        console.log('用户数据调试 - roles字段:', user.roles);
        console.log('用户数据调试 - roles字段类型:', typeof user.roles);
        console.log('用户数据调试 - 完整用户数据:', user);
        
        let roles = null;
        if (user.roles) {
            // MySQL JSON字段已经被自动解析为JavaScript数组，直接使用
            if (Array.isArray(user.roles)) {
                roles = user.roles;
                console.log('MySQL JSON数组解析成功:', roles);
            } else if (typeof user.roles === 'string') {
                try {
                    // 尝试解析JSON字符串
                    roles = JSON.parse(user.roles);
                    console.log('JSON字符串解析成功:', roles);
                } catch (e) {
                    // 如果JSON解析失败，尝试解析逗号分隔的字符串
                    if (user.roles.includes(',')) {
                        roles = user.roles.split(',').map(role => role.trim()).filter(role => role);
                        console.log('逗号分隔解析成功:', roles);
                    } else {
                        roles = [user.roles.trim()];
                        console.log('单字符串解析成功:', roles);
                    }
                }
            }
        } else {
            console.log('roles字段为空或null');
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: user.points,
                avatar: user.avatar,
                hasUploadedAvatar: user.has_uploaded_avatar,
                role: user.role || '用户',
                roles: roles,
                level: level,
                joinDate: user.created_at
            }
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ success: false, error: 'Failed to get user info' });
    }
};
