// 发送测试通知给所有用户
import { getDb } from './server/db.js';
import { NotificationService } from './server/services/notification.service.js';

async function sendTestNotification() {
    try {
        console.log('🚀 开始发送测试通知给所有用户...');
        
        // 获取所有用户
        const users = await new Promise((resolve, reject) => {
            getDb().query('SELECT id, username FROM users', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log(`📊 找到 ${users.length} 个用户`);
        
        // 为每个用户创建测试通知
        const results = [];
        for (const user of users) {
            try {
                const notificationResult = await NotificationService.createSystemNotification(
                    user.id,
                    '🎉 系统测试通知',
                    `您好 ${user.username}！\n\n这是一个系统测试通知，用于验证通知功能是否正常工作。\n\n如果您能看到这条通知，说明通知系统已经成功修复！\n\n感谢您的耐心等待！`
                );
                
                console.log(`✅ 用户 ${user.username} (ID: ${user.id}) 通知创建成功`);
                results.push({ userId: user.id, username: user.username, success: true });
            } catch (error) {
                console.error(`❌ 用户 ${user.username} (ID: ${user.id}) 通知创建失败:`, error.message);
                results.push({ userId: user.id, username: user.username, success: false, error: error.message });
            }
        }
        
        console.log('📋 测试通知发送结果:');
        console.log(`✅ 成功: ${results.filter(r => r.success).length}`);
        console.log(`❌ 失败: ${results.filter(r => !r.success).length}`);
        
        return results;
    } catch (error) {
        console.error('❌ 发送测试通知失败:', error);
        throw error;
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    sendTestNotification()
        .then(results => {
            console.log('🎉 测试通知发送完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 测试通知发送失败:', error);
            process.exit(1);
        });
}

export default sendTestNotification;
