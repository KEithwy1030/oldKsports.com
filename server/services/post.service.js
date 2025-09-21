// server/services/post.service.js
import { db } from '../db.js';
import userStatsService from './userStats.service.js';
import NotificationService from './notification.service.js';

export const findPosts = (category) => {
    return new Promise((resolve, reject) => {
        // 检查数据库连接状态
        if (db.state === 'disconnected') {
            console.log('数据库未连接，返回空数据');
            return resolve([]);
        }

        // 修改查询以包含最新回复时间，并按最新活动时间排序
        const q = category ? 
            `SELECT p.id, p.title, p.content, p.author, p.category, p.created_at, p.updated_at, p.views, p.likes, u.username, u.avatar,
             COALESCE(MAX(r.created_at), p.created_at) as latest_activity
             FROM users u 
             JOIN forum_posts p ON u.id = p.author_id 
             LEFT JOIN forum_replies r ON p.id = r.post_id 
             WHERE p.category=?
             GROUP BY p.id, p.content, p.author, p.category, p.created_at, p.updated_at, p.views, p.likes, u.username, u.avatar
             ORDER BY latest_activity DESC` :
            `SELECT p.id, p.title, p.content, p.author, p.category, p.created_at, p.updated_at, p.views, p.likes, u.username, u.avatar,
             COALESCE(MAX(r.created_at), p.created_at) as latest_activity
             FROM users u 
             JOIN forum_posts p ON u.id = p.author_id 
             LEFT JOIN forum_replies r ON p.id = r.post_id 
             GROUP BY p.id, p.content, p.author, p.category, p.created_at, p.updated_at, p.views, p.likes, u.username, u.avatar
             ORDER BY latest_activity DESC`;
        db.query(q, [category], (err, data) => {
            if (err) {
                console.error('查询帖子失败:', err.message);
                return resolve([]); // 返回空数组而不是拒绝
            }
            resolve(data);
        });
    });
};

export const findPostById = (postId) => {
    return new Promise((resolve, reject) => {
        // 首先获取帖子信息
        const postQuery = "SELECT p.id, p.title, p.content, p.author, p.category, p.created_at, p.updated_at, p.views, p.likes, u.username, u.avatar, u.avatar AS userImg FROM users u JOIN forum_posts p ON u.id = p.author_id WHERE p.id = ?";
        db.query(postQuery, [postId], (err, postData) => {
            if (err) return reject(err);
            if (!postData || postData.length === 0) return resolve(null);
            
            const post = postData[0];
            
            // 然后获取该帖子的回复
            const repliesQuery = "SELECT r.id, r.content, r.author_id, r.created_at, r.likes, u.username as author FROM forum_replies r LEFT JOIN users u ON r.author_id = u.id WHERE r.post_id = ? ORDER BY r.created_at ASC";
            db.query(repliesQuery, [postId], (err, repliesData) => {
                if (err) return reject(err);
                
                // 将回复添加到帖子对象中
                post.replies = repliesData || [];
                resolve(post);
            });
        });
    });
};

export const createPost = async (postData, userId) => {
    try {
        // 验证必需参数
        if (!postData || !userId) {
            throw new Error("Missing required parameters");
        }
        
        // 验证帖子数据
        if (!postData.title || !postData.content) {
            throw new Error("Title and content are required");
        }
        
        // 检查是否已存在相同标题的帖子
        const existingPosts = await new Promise((resolve, reject) => {
            db.query("SELECT id FROM forum_posts WHERE title = ?", [postData.title], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (existingPosts.length > 0) {
            throw new Error("帖子标题已存在，请使用不同的标题");
        }
        
        // 需要先获取用户名，因为数据库表需要 author 字段
        const userRows = await new Promise((resolve, reject) => {
            db.query("SELECT username FROM users WHERE id = ?", [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        if (userRows.length === 0) throw new Error("User not found");
        
        const username = userRows[0].username;
        const q = "INSERT INTO forum_posts(`title`, `content`, `category`, `author_id`, `author`, `created_at`) VALUES (?, ?, ?, ?, ?, ?)";
        
        // 确保所有参数都不是undefined，使用null代替
        const values = [ 
            postData.title || null, 
            postData.content || null, 
            postData.category || 'general', 
            userId || null, 
            username || null, 
            new Date() 
        ];
        
        console.log('创建帖子参数:', { postData, userId, username, values });
        
        await new Promise((resolve, reject) => {
            db.query(q, values, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        // 更新用户发帖统计
        await userStatsService.incrementUserPosts(userId);
        
        return { success: true, message: "Post has been created." };
    } catch (error) {
        console.error('创建帖子失败:', error);
        throw error;
    }
};

export const deletePost = (postId, userId, isAdmin = false) => {
    return new Promise((resolve, reject) => {
        console.log('删除帖子服务:', { postId, userId, isAdmin });
        
        // 管理员可以删除任何帖子，普通用户只能删除自己的帖子
        const q = isAdmin 
            ? "DELETE FROM forum_posts WHERE `id` = ?" 
            : "DELETE FROM forum_posts WHERE `id` = ? AND `author_id` = ?";
        const params = isAdmin ? [postId] : [postId, userId];
        
        console.log('执行SQL:', q, '参数:', params);
        
        db.query(q, params, (err, data) => {
            if (err) {
                console.error('删除SQL错误:', err);
                return reject(err);
            }
            console.log('删除结果:', data);
            if (data.affectedRows === 0) return reject(new Error("Forbidden"));
            resolve("Post has been deleted!");
        });
    });
};

export const updatePost = (postData, postId, userId) => {
    return new Promise((resolve, reject) => {
        const q = "UPDATE forum_posts SET `title`=?,`content`=?,`category`=? WHERE `id` = ? AND `author_id` = ?";
        const values = [ postData.title, postData.content, postData.category ];
        db.query(q, [...values, postId, userId], (err, data) => {
            if (err) return reject(err);
            if (data.affectedRows === 0) return reject(new Error("Forbidden"));
            resolve("Post has been updated.");
        });
    });
};

export const addReply = async (replyData, postId, userId) => {
    try {
        // 首先获取用户名
        const userRows = await new Promise((resolve, reject) => {
            db.query("SELECT username FROM users WHERE id = ?", [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        if (userRows.length === 0) throw new Error("User not found");
        
        const username = userRows[0].username;
        
        // 获取帖子信息和作者ID
        const postRows = await new Promise((resolve, reject) => {
            db.query("SELECT title, author_id FROM forum_posts WHERE id = ?", [postId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        if (postRows.length === 0) throw new Error("Post not found");
        
        const post = postRows[0];
        const postAuthorId = post.author_id;
        const postTitle = post.title;
        
        // 插入回复到数据库
        const q = "INSERT INTO forum_replies(`post_id`, `author_id`, `content`, `created_at`) VALUES (?, ?, ?, ?)";
        const values = [postId, userId, replyData.content, new Date()];
        
        const insertResult = await new Promise((resolve, reject) => {
            db.query(q, values, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const replyId = insertResult.insertId;
        
        // 更新用户回复统计
        await userStatsService.incrementUserReplies(userId);
        
        // 创建回复通知（如果不是自己回复自己的帖子）
        if (postAuthorId !== userId) {
            try {
                await NotificationService.createReplyNotification(
                    postAuthorId, 
                    userId, 
                    postId, 
                    replyId, 
                    postTitle
                );
                console.log('回复通知创建成功');
            } catch (notifyError) {
                console.error('创建回复通知失败:', notifyError);
                // 不影响主要功能，继续执行
            }
        }
        
        // 处理@提及通知
        try {
            await NotificationService.processMentions(replyData.content, userId, postId, replyId);
            console.log('@提及通知处理完成');
        } catch (mentionError) {
            console.error('处理@提及失败:', mentionError);
            // 不影响主要功能，继续执行
        }
        
        return "Reply has been added.";
    } catch (error) {
        console.error('添加回复失败:', error);
        throw error;
    }
};