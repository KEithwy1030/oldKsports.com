// 检查本地数据库中的管理员账号
import mysql from 'mysql2';

// 本地数据库连接配置
const localDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'k19941030',
    database: 'old_k_sports'
});

const checkLocalAdmin = async () => {
    try {
        console.log('检查本地数据库中的管理员账号...');
        
        // 查询指定邮箱的用户
        const usersByEmail = await new Promise((resolve, reject) => {
            localDb.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE email = ?', ['552319164@qq.com'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 查询指定用户名的用户
        const usersByUsername = await new Promise((resolve, reject) => {
            localDb.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE username = ?', ['老k'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // 查询所有管理员账号
        const allAdmins = await new Promise((resolve, reject) => {
            localDb.query('SELECT id, username, email, is_admin, points, created_at FROM users WHERE is_admin = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('\n=== 按邮箱查询结果 ===');
        if (usersByEmail.length > 0) {
            usersByEmail.forEach(user => {
                console.log(`✅ 找到用户: ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 管理员=${user.is_admin}, 积分=${user.points}, 创建时间=${user.created_at}`);
            });
        } else {
            console.log('❌ 未找到邮箱为 552319164@qq.com 的用户');
        }
        
        console.log('\n=== 按用户名查询结果 ===');
        if (usersByUsername.length > 0) {
            usersByUsername.forEach(user => {
                console.log(`✅ 找到用户: ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 管理员=${user.is_admin}, 积分=${user.points}, 创建时间=${user.created_at}`);
            });
        } else {
            console.log('❌ 未找到用户名为 老k 的用户');
        }
        
        console.log('\n=== 所有管理员账号 ===');
        if (allAdmins.length > 0) {
            console.log(`找到 ${allAdmins.length} 个管理员账号:`);
            allAdmins.forEach(admin => {
                console.log(`- ID=${admin.id}, 用户名=${admin.username}, 邮箱=${admin.email}, 积分=${admin.points}, 创建时间=${admin.created_at}`);
            });
        } else {
            console.log('❌ 本地数据库中没有管理员账号');
        }
        
        // 查询所有用户
        const allUsers = await new Promise((resolve, reject) => {
            localDb.query('SELECT id, username, email, is_admin, points, created_at FROM users ORDER BY created_at DESC', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('\n=== 所有用户列表 ===');
        console.log(`总共 ${allUsers.length} 个用户:`);
        allUsers.forEach(user => {
            const adminFlag = user.is_admin ? '[管理员]' : '[普通用户]';
            console.log(`- ID=${user.id}, 用户名=${user.username}, 邮箱=${user.email}, 积分=${user.points} ${adminFlag}`);
        });
        
    } catch (error) {
        console.error('检查本地数据库失败:', error);
    } finally {
        localDb.end();
    }
};

checkLocalAdmin();