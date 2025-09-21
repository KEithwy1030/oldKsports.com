// production-check.js
// 生产环境发布前的完整检查脚本

import fs from 'fs';
import path from 'path';

console.log('🔍 oldkSports 1.0 生产环境发布前检查\n');

const checks = [];
let passedChecks = 0;
let totalChecks = 0;

function addCheck(name, condition, message, fix = '') {
    totalChecks++;
    const passed = condition;
    if (passed) passedChecks++;
    
    checks.push({
        name,
        passed,
        message,
        fix
    });
    
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    if (!passed) {
        console.log(`   ${message}`);
        if (fix) console.log(`   💡 修复建议: ${fix}`);
    }
    console.log('');
}

// 1. 检查关键文件存在性
console.log('📁 文件结构检查');
console.log('─'.repeat(50));

addCheck(
    '后端入口文件存在',
    fs.existsSync('server/index.js'),
    '缺少后端入口文件',
    '确保server/index.js文件存在'
);

addCheck(
    '前端构建配置存在',
    fs.existsSync('vite.config.ts'),
    '缺少Vite配置文件',
    '确保vite.config.ts文件存在'
);

addCheck(
    '数据库配置文件存在',
    fs.existsSync('server/db.js'),
    '缺少数据库配置文件',
    '确保server/db.js文件存在'
);

addCheck(
    '环境配置文件存在',
    fs.existsSync('server/.env') || fs.existsSync('.env'),
    '缺少环境配置文件',
    '创建.env文件并配置数据库连接'
);

// 2. 检查package.json配置
console.log('📦 依赖配置检查');
console.log('─'.repeat(50));

let frontendPackage = {};
let backendPackage = {};

try {
    frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (e) {
    console.log('❌ 无法读取前端package.json');
}

try {
    backendPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
} catch (e) {
    console.log('❌ 无法读取后端package.json');
}

addCheck(
    '前端依赖完整',
    frontendPackage.dependencies && Object.keys(frontendPackage.dependencies).length > 0,
    '前端依赖不完整',
    '运行 npm install 安装前端依赖'
);

addCheck(
    '后端依赖完整',
    backendPackage.dependencies && Object.keys(backendPackage.dependencies).length > 0,
    '后端依赖不完整',
    '在server目录运行 npm install 安装后端依赖'
);

// 3. 检查关键功能组件
console.log('🧩 组件完整性检查');
console.log('─'.repeat(50));

const criticalComponents = [
    'src/context/AuthContext.tsx',
    'src/pages/ForumPage.tsx',
    'src/pages/UserProfile.tsx',
    'src/pages/MerchantsPage.tsx',
    'src/components/MultiImageUpload.tsx',
    'src/components/BrowserCompatibleModal.tsx',
    'src/components/SystemAvatars.tsx'
];

criticalComponents.forEach(component => {
    addCheck(
        `${path.basename(component)} 存在`,
        fs.existsSync(component),
        `关键组件缺失: ${component}`,
        '确保所有关键组件文件存在'
    );
});

// 4. 检查后端路由
console.log('🛣️  后端路由检查');
console.log('─'.repeat(50));

const criticalRoutes = [
    'server/routes/auth.js',
    'server/routes/posts.js',
    'server/routes/users.js',
    'server/routes/admin.routes.js'
];

criticalRoutes.forEach(route => {
    addCheck(
        `${path.basename(route)} 存在`,
        fs.existsSync(route),
        `关键路由缺失: ${route}`,
        '确保所有API路由文件存在'
    );
});

// 5. 检查上传目录
console.log('📂 上传目录检查');
console.log('─'.repeat(50));

const uploadDirs = [
    'public/uploads/images',
    'server/public/uploads/images'
];

uploadDirs.forEach(dir => {
    addCheck(
        `${dir} 目录存在`,
        fs.existsSync(dir),
        `上传目录不存在: ${dir}`,
        `创建目录: mkdir -p ${dir}`
    );
});

// 6. 检查配置文件内容
console.log('⚙️  配置检查');
console.log('─'.repeat(50));

// 检查Vite配置
try {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
    addCheck(
        'Vite代理配置正确',
        viteConfig.includes('5174') && viteConfig.includes('proxy'),
        'Vite代理配置可能有问题',
        '确保vite.config.ts中代理指向正确的后端端口'
    );
} catch (e) {
    addCheck('Vite配置文件可读', false, '无法读取Vite配置文件');
}

// 检查后端端口配置
try {
    const serverIndex = fs.readFileSync('server/index.js', 'utf8');
    addCheck(
        '后端端口配置正确',
        serverIndex.includes('5174'),
        '后端端口配置可能有问题',
        '确保server/index.js中端口设置为5174'
    );
    
    addCheck(
        '静态文件服务配置',
        serverIndex.includes('express.static'),
        '缺少静态文件服务配置',
        '在server/index.js中添加express.static配置'
    );
} catch (e) {
    addCheck('后端配置文件可读', false, '无法读取后端配置文件');
}

// 7. 安全检查
console.log('🔒 安全配置检查');
console.log('─'.repeat(50));

try {
    const serverIndex = fs.readFileSync('server/index.js', 'utf8');
    addCheck(
        'CORS配置存在',
        serverIndex.includes('cors'),
        '缺少CORS配置',
        '确保配置了适当的CORS策略'
    );
    
    addCheck(
        'JWT密钥配置',
        serverIndex.includes('JWT_SECRET') || serverIndex.includes('jwt'),
        'JWT配置可能缺失',
        '确保配置了JWT密钥'
    );
} catch (e) {
    console.log('无法检查安全配置');
}

// 8. 生成检查报告
console.log('📋 检查总结');
console.log('='.repeat(50));
console.log(`总检查项: ${totalChecks}`);
console.log(`通过检查: ${passedChecks}`);
console.log(`失败检查: ${totalChecks - passedChecks}`);
console.log(`通过率: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 所有检查通过！系统已准备好发布！');
} else {
    console.log('\n⚠️  部分检查未通过，请修复后再发布。');
    console.log('\n❌ 失败的检查项:');
    checks.filter(check => !check.passed).forEach(check => {
        console.log(`   • ${check.name}: ${check.message}`);
        if (check.fix) console.log(`     修复: ${check.fix}`);
    });
}

// 9. 生成部署清单
console.log('\n📝 部署清单');
console.log('='.repeat(50));
console.log('发布前必做事项:');
console.log('□ 1. 运行数据清理脚本: node cleanup-for-production.js');
console.log('□ 2. 构建前端: npm run build');
console.log('□ 3. 测试所有核心功能');
console.log('□ 4. 检查数据库连接');
console.log('□ 5. 验证文件上传功能');
console.log('□ 6. 清理浏览器缓存');
console.log('□ 7. 备份当前数据库');
console.log('□ 8. 更新README文档');
console.log('□ 9. 创建版本标签');
console.log('□ 10. 部署到生产环境');

console.log('\n🚀 oldkSports 1.0 即将发布！');
