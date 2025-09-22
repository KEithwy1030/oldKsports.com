// 通用启动脚本 - 适用于任何部署平台
import { config, validateConfig } from '../config/index.js';
import { healthCheck } from '../config/database.js';
import express from 'express';

const startServer = async (app) => {
  try {
    console.log('🚀 启动服务器...');
    
    // 1. 验证配置
    validateConfig();
    
    // 2. 数据库健康检查
    console.log('🔍 检查数据库连接...');
    const dbHealthy = await healthCheck();
    if (!dbHealthy) {
      throw new Error('数据库连接失败');
    }
    console.log('✅ 数据库连接正常');
    
    // 3. 启动HTTP服务器
    const server = app.listen(config.app.port, () => {
      console.log(`🎉 服务器启动成功!`);
      console.log(`   环境: ${config.app.env}`);
      console.log(`   端口: ${config.app.port}`);
      console.log(`   时间: ${new Date().toISOString()}`);
      console.log(`   进程ID: ${process.pid}`);
    });
    
    // 4. 优雅关闭处理
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 收到 ${signal} 信号，开始优雅关闭...`);
      
      server.close(() => {
        console.log('✅ HTTP服务器已关闭');
        process.exit(0);
      });
      
      // 强制关闭超时
      setTimeout(() => {
        console.log('⚠️  强制关闭服务器');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

export default startServer;
