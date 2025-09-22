// 通用部署测试脚本 - 适用于任何平台
import axios from 'axios';
import { config } from '../server/config/index.js';

const testDeployment = async () => {
  const baseURL = process.env.TEST_URL || `http://localhost:${config.app.port}`;
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  console.log(`🧪 开始测试部署: ${baseURL}`);
  console.log('='.repeat(50));

  // 测试1: 健康检查
  await runTest('健康检查', async () => {
    const response = await axios.get(`${baseURL}/api/health`);
    if (response.status === 200) {
      console.log('✅ 应用健康状态正常');
      return true;
    }
    throw new Error(`健康检查失败: ${response.status}`);
  }, results);

  // 测试2: 数据库连接
  await runTest('数据库连接', async () => {
    const response = await axios.get(`${baseURL}/api/health/db`);
    if (response.data.healthy) {
      console.log('✅ 数据库连接正常');
      return true;
    }
    throw new Error('数据库连接失败');
  }, results);

  // 测试3: 用户注册
  await runTest('用户注册', async () => {
    const testUser = {
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123456'
    };
    
    const response = await axios.post(`${baseURL}/api/auth/register`, testUser);
    if (response.status === 201) {
      console.log('✅ 用户注册功能正常');
      return true;
    }
    throw new Error(`注册失败: ${response.status}`);
  }, results);

  // 测试4: 用户登录
  await runTest('用户登录', async () => {
    const loginData = {
      username: '老k',
      password: 'Kk19941030'
    };
    
    const response = await axios.post(`${baseURL}/api/auth/login`, loginData);
    if (response.status === 200 && response.data.success) {
      console.log('✅ 用户登录功能正常');
      return true;
    }
    throw new Error(`登录失败: ${response.status}`);
  }, results);

  // 测试5: 文件上传
  await runTest('文件上传', async () => {
    const FormData = require('form-data');
    const fs = require('fs');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('test-image.jpg'));
    
    const response = await axios.post(`${baseURL}/api/upload`, form, {
      headers: form.getHeaders()
    });
    
    if (response.status === 200) {
      console.log('✅ 文件上传功能正常');
      return true;
    }
    throw new Error(`文件上传失败: ${response.status}`);
  }, results);

  // 测试6: API响应时间
  await runTest('API响应时间', async () => {
    const start = Date.now();
    await axios.get(`${baseURL}/api/health`);
    const duration = Date.now() - start;
    
    if (duration < 1000) {
      console.log(`✅ API响应时间正常: ${duration}ms`);
      return true;
    }
    throw new Error(`API响应时间过慢: ${duration}ms`);
  }, results);

  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总:');
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ 失败的测试:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 所有测试通过！部署成功！');
  }
};

const runTest = async (name, testFn, results) => {
  try {
    console.log(`\n🔍 测试: ${name}`);
    const passed = await testFn();
    results.tests.push({ name, passed: true });
    results.passed++;
  } catch (error) {
    console.log(`❌ ${name} 失败: ${error.message}`);
    results.tests.push({ name, passed: false, error: error.message });
    results.failed++;
  }
};

// 运行测试
testDeployment().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
