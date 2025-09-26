#!/usr/bin/env node
/**
 * 修复导出的SQL文件中的语法错误
 * 主要修复连续空值问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始修复导出的SQL文件...');

// 修复函数
function fixSqlSyntax(content) {
  console.log('📝 修复SQL语法错误...');
  
  let fixed = content;
  
  // 修复连续空值问题 (,, -> ,NULL,)
  fixed = fixed.replace(/,\s*,/g, ', NULL,');
  console.log('✅ 修复连续空值问题');
  
  // 修复未引用的字符串值
  fixed = fixed.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g, ', \'$1\',');
  console.log('✅ 修复未引用的字符串值');
  
  // 修复JSON格式的roles字段
  fixed = fixed.replace(/,\s*'([^']*)'\s*,/g, (match, value) => {
    // 如果值包含逗号，说明是多个角色，需要转换为JSON数组
    if (value.includes(',')) {
      const roles = value.split(',').map(role => `"${role.trim()}"`).join(',');
      return `, '["${roles}"]',`;
    }
    // 单个角色转换为JSON数组
    return `, '["${value}"]',`;
  });
  console.log('✅ 修复JSON格式的roles字段');
  
  // 修复其他可能的语法问题
  fixed = fixed.replace(/,\s*NULL\s*,/g, ', NULL,');
  console.log('✅ 修复NULL值格式');
  
  return fixed;
}

// 修复完整导出文件
const fullExportFile = path.join(__dirname, 'oldksports_database_export.sql');
if (fs.existsSync(fullExportFile)) {
  console.log('📤 修复完整导出文件...');
  const content = fs.readFileSync(fullExportFile, 'utf8');
  const fixed = fixSqlSyntax(content);
  fs.writeFileSync(fullExportFile, fixed, 'utf8');
  console.log('✅ 完整导出文件修复完成');
}

// 修复分表导出文件
const exportDir = path.join(__dirname, 'database_export');
if (fs.existsSync(exportDir)) {
  console.log('📤 修复分表导出文件...');
  const files = fs.readdirSync(exportDir);
  
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const filePath = path.join(exportDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixSqlSyntax(content);
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ 修复文件: ${file}`);
    }
  }
}

console.log('\n🎉 SQL文件修复完成！');
console.log('📁 修复的文件:');
console.log(`   - 完整导出: ${fullExportFile}`);
console.log(`   - 分表导出: ${exportDir}/`);

// 创建测试脚本
const testScript = `#!/bin/bash
# 测试修复后的SQL文件
echo "🧪 测试修复后的SQL文件..."

# 检查语法
echo "📝 检查SQL语法..."
mysql --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL客户端可用"
    echo "💡 可以使用以下命令测试SQL文件:"
    echo "   mysql -h主机 -u用户名 -p密码 数据库名 < oldksports_database_export.sql"
else
    echo "❌ MySQL客户端不可用，请安装MySQL客户端"
fi

echo "🎉 测试完成！"
`;

const testScriptPath = path.join(__dirname, 'test_fixed_sql.sh');
fs.writeFileSync(testScriptPath, testScript, 'utf8');
fs.chmodSync(testScriptPath, '755');
console.log(`✅ 测试脚本创建完成: ${testScriptPath}`);

// 创建Windows测试脚本
const windowsTestScript = `@echo off
REM 测试修复后的SQL文件
echo 🧪 测试修复后的SQL文件...

REM 检查MySQL客户端
mysql --help >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL客户端不可用，请安装MySQL客户端
    pause
    exit /b 1
) else (
    echo ✅ MySQL客户端可用
    echo 💡 可以使用以下命令测试SQL文件:
    echo    mysql -h主机 -u用户名 -p密码 数据库名 ^< oldksports_database_export.sql
)

echo 🎉 测试完成！
pause
`;

const windowsTestScriptPath = path.join(__dirname, 'test_fixed_sql.bat');
fs.writeFileSync(windowsTestScriptPath, windowsTestScript, 'utf8');
console.log(`✅ Windows测试脚本创建完成: ${windowsTestScriptPath}`);

console.log('\n📋 修复总结:');
console.log('   - 修复了连续空值问题 (,, -> ,NULL,)');
console.log('   - 修复了未引用的字符串值');
console.log('   - 修复了JSON格式的roles字段');
console.log('   - 创建了测试脚本');
console.log('\n🚀 现在可以尝试导入修复后的SQL文件了！');
