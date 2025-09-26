// server/index.js
import express from "express";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import userStatsRoutes from "./routes/userStats.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import merchantsRoutes from "./routes/merchants.js";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./middleware/auth.js";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // 生产环境端口或本地开发端口

// 支持多个CORS源，包括生产环境的前端域名
const corsOrigins = [
  process.env.CORS_ORIGIN,
  "https://oldksports.zeabur.app",
  "https://oldksports-frontend.zeabur.app",
  "http://localhost:5173"
].filter(Boolean); // 过滤掉undefined值

console.log('CORS Origins:', corsOrigins);

app.use(cors({ 
  origin: corsOrigins.length > 0 ? corsOrigins : "http://localhost:5173", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));
app.use(cookieParser());

// 确保上传目录存在
const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

// 兼容处理：启动时将历史图片统一迁移到 public/uploads/images
const migrateLegacyImages = () => {
  try {
    const legacyDirs = [
      // 旧后端路径
      uploadsDir,
      // 旧前端构建前的静态路径（本地开发可能存在）
      path.join(process.cwd(), '..', 'client', 'public', 'uploads', 'images')
    ];

    legacyDirs.forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const src = path.join(dir, file);
          const dst = path.join(publicUploadsDir, file);
          try {
            if (fs.statSync(src).isFile()) {
              if (!fs.existsSync(dst)) {
                fs.copyFileSync(src, dst);
                console.log('迁移历史图片:', file);
              }
            }
          } catch (e) {
            console.warn('迁移单个文件失败:', file, e?.message);
          }
        });
      } catch (e) {
        console.warn('扫描历史目录失败:', dir, e?.message);
      }
    });
  } catch (e) {
    console.warn('迁移历史图片流程出现异常:', e?.message);
  }
};
// 启动时执行一次迁移
migrateLegacyImages();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳_随机数_原文件名
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'post_' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 静态文件服务 - 提供上传的图片访问
app.use('/uploads/images', express.static(path.join(process.cwd(), 'public', 'uploads', 'images')));

// Health check routes（提供两种路径，便于端口探活脚本使用）
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});
// 根路径返回200，避免部分端口检测脚本把 GET / 视为探活
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 图片上传接口
app.post("/api/upload/images", upload.array('images', 9), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "没有上传任何文件" 
      });
    }

    const uploadedFiles = req.files.map(file => {
      // 复制文件到public目录，供前端访问
      const publicPath = path.join(publicUploadsDir, file.filename);
      fs.copyFileSync(file.path, publicPath);
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/images/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      files: uploadedFiles,
      message: `成功上传 ${uploadedFiles.length} 张图片`
    });

  } catch (error) {
    console.error('图片上传错误:', error);
    res.status(500).json({
      success: false,
      error: "图片上传失败"
    });
  }
});

// 静态文件服务 - 为上传的图片提供访问
console.log('静态文件服务路径:', path.join(process.cwd(), 'public', 'uploads', 'images'));
console.log('当前工作目录:', process.cwd());

// 使用相对路径，适配Zeabur部署
const staticPath = path.join(process.cwd(), 'public', 'uploads', 'images');
console.log('使用静态文件路径:', staticPath);

app.use('/uploads/images', express.static(staticPath));
// 兼容旧的URL路径（直接/uploads/文件名）  
app.use('/uploads', express.static(staticPath));
// 兼容少数旧内容直接引用 /public/uploads/images 前缀
app.use('/public/uploads/images', express.static(staticPath));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-stats", userStatsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/merchants", merchantsRoutes);

// 检查当前用户权限的API端点
app.get("/api/admin/check", authenticateToken, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      user: {
        id: req.user.id,
        username: req.user.username,
        isAdmin: req.user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '检查权限失败' });
  }
});

// 管理员清空所有帖子的API端点
app.delete("/api/admin/posts/clear", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, error: '需要管理员权限' });
    }
    
    await new Promise((resolve, reject) => {
      getDb().query('DELETE FROM forum_posts', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    await new Promise((resolve, reject) => {
      getDb().query('ALTER TABLE forum_posts AUTO_INCREMENT = 1', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    res.json({ success: true, message: '所有帖子已清空' });
  } catch (error) {
    console.error('清空帖子失败:', error);
    res.status(500).json({ success: false, error: '清空失败' });
  }
});


// 启动服务器
const startServer = async () => {
    try {
        // 初始化数据库连接
        const db = getDb();
        
        // 先执行数据库迁移
        console.log('执行数据库迁移...');
        const minimalMigrate = await import('./minimal-migrate.js');
        await minimalMigrate.default();
        
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`Backend server is running on port ${PORT}!`);
            console.log("Database: MySQL - 连接成功，迁移完成");
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

startServer();