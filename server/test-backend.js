// 测试后端服务是否正常运行

const testBackend = async () => {
    try {
        console.log('=== 测试后端服务 ===');
        
        const backendUrl = 'https://oldksports-backend.zeabur.app';
        
        // 1. 测试健康检查端点
        console.log('1. 测试健康检查端点...');
        try {
            const healthResponse = await fetch(`${backendUrl}/api/health`);
            const healthData = await healthResponse.json();
            console.log('✅ 健康检查成功:', healthData);
        } catch (error) {
            console.log('❌ 健康检查失败:', error.message);
        }
        
        // 2. 测试登录端点
        console.log('\n2. 测试登录端点...');
        try {
            const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: '552319164@qq.com',
                    password: 'Kk19941030'
                })
            });
            
            console.log('登录响应状态:', loginResponse.status);
            console.log('登录响应头:', Object.fromEntries(loginResponse.headers.entries()));
            
            const loginData = await loginResponse.text();
            console.log('登录响应内容:', loginData);
            
            if (loginResponse.status === 200) {
                console.log('✅ 登录端点可访问');
            } else if (loginResponse.status === 404) {
                console.log('❌ 登录端点不存在 (404)');
            } else {
                console.log('⚠️ 登录端点返回状态:', loginResponse.status);
            }
            
        } catch (error) {
            console.log('❌ 登录端点测试失败:', error.message);
        }
        
        // 3. 测试不带/api前缀的登录端点
        console.log('\n3. 测试不带/api前缀的登录端点...');
        try {
            const loginResponse2 = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: '552319164@qq.com',
                    password: 'Kk19941030'
                })
            });
            
            console.log('登录响应状态:', loginResponse2.status);
            const loginData2 = await loginResponse2.text();
            console.log('登录响应内容:', loginData2);
            
        } catch (error) {
            console.log('❌ 不带/api前缀的登录端点测试失败:', error.message);
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
};

testBackend();
