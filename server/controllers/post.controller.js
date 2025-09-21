// server/controllers/post.controller.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as PostService from '../services/post.service.js';

dotenv.config();

const getUserInfoFromToken = (req) => {
    // 优先从 Cookie 读取
    let token = req.cookies.access_token;
    
    // 如果 Cookie 没有，尝试从 Authorization header 读取
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

export const getPosts = async (req, res) => {
    try {
        const posts = await PostService.findPosts(req.query.cat);
        return res.status(200).json(posts);
    } catch (err) {
        console.error('Error in getPosts:', err);
        return res.status(500).json(err);
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await PostService.findPostById(req.params.id);
        if (!post) return res.status(404).json("Post not found!");
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const addPost = async (req, res) => {
    // 使用认证中间件设置的req.user，而不是getUserInfoFromToken
    if (!req.user) return res.status(401).json("Not authenticated!");

    try {
        console.log('用户信息:', req.user);
        console.log('帖子数据:', req.body);
        
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json("Invalid user information");
        }
        
        const message = await PostService.createPost(req.body, userId);
        return res.status(200).json(message);
    } catch (err) {
        console.error('创建帖子控制器错误:', err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    // 使用认证中间件设置的req.user，而不是getUserInfoFromToken
    if (!req.user) return res.status(401).json("Not authenticated!");

    try {
        console.log('删除帖子请求:', {
            postId: req.params.id,
            userId: req.user.id,
            username: req.user.username,
            isAdmin: req.user.isAdmin
        });
        
        // 管理员可以删除任何帖子，普通用户只能删除自己的帖子
        const message = await PostService.deletePost(req.params.id, req.user.id, req.user.isAdmin);
        return res.status(200).json(message);
    } catch (err) {
        console.error('删除帖子失败:', err.message);
        if (err.message === "Forbidden") return res.status(403).json("You can only delete your post!");
        return res.status(500).json(err);
    }
};

export const updatePost = async (req, res) => {
    const userInfo = getUserInfoFromToken(req);
    if (!userInfo) return res.status(401).json("Not authenticated!");
    
    try {
        const message = await PostService.updatePost(req.body, req.params.id, userInfo.id);
        return res.status(200).json(message);
    } catch (err) {
        if (err.message === "Forbidden") return res.status(403).json("You can only update your post!");
        return res.status(500).json(err);
    }
};

export const addReply = async (req, res) => {
    // 使用认证中间件设置的req.user，而不是getUserInfoFromToken
    if (!req.user) return res.status(401).json("Not authenticated!");

    try {
        console.log('回复用户信息:', req.user);
        console.log('回复数据:', req.body);
        console.log('帖子ID:', req.params.id);
        
        const message = await PostService.addReply(req.body, req.params.id, req.user.id);
        return res.status(200).json(message);
    } catch (err) {
        console.error('添加回复控制器错误:', err);
        return res.status(500).json(err);
    }
};