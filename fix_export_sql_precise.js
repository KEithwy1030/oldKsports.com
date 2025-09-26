#!/usr/bin/env node
/**
 * 精确修复导出的SQL文件中的语法错误
 * 只修复连续空值问题，不处理其他数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始精确修复导出的SQL文件...');

// 精确修复函数
function fixSqlSyntaxPrecise(content) {
  console.log('📝 精确修复SQL语法错误...');
  
  let fixed = content;
  
  // 只修复连续空值问题 (,, -> ,NULL,)
  const beforeCount = (fixed.match(/,\s*,/g) || []).length;
  fixed = fixed.replace(/,\s*,/g, ', NULL,');
  const afterCount = (fixed.match(/,\s*,/g) || []).length;
  console.log(`✅ 修复连续空值问题: ${beforeCount} -> ${afterCount}`);
  
  return fixed;
}

// 修复完整导出文件
const fullExportFile = path.join(__dirname, 'oldksports_database_export.sql');
if (fs.existsSync(fullExportFile)) {
  console.log('📤 修复完整导出文件...');
  const content = fs.readFileSync(fullExportFile, 'utf8');
  const fixed = fixSqlSyntaxPrecise(content);
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
      const fixed = fixSqlSyntaxPrecise(content);
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ 修复文件: ${file}`);
    }
  }
}

console.log('\n🎉 SQL文件精确修复完成！');
console.log('📁 修复的文件:');
console.log(`   - 完整导出: ${fullExportFile}`);
console.log(`   - 分表导出: ${exportDir}/`);

// 创建验证脚本
const verifyScript = `#!/bin/bash
# 验证修复后的SQL文件
echo "🧪 验证修复后的SQL文件..."

# 检查连续空值
echo "📝 检查连续空值问题..."
if grep -q ",," oldksports_database_export.sql; then
    echo "❌ 仍然存在连续空值问题"
    grep -n ",," oldksports_database_export.sql | head -5
else
    echo "✅ 连续空值问题已修复"
fi

# 检查基本语法
echo "📝 检查基本SQL语法..."
if mysql --help > /dev/null 2>&1; then
    echo "✅ MySQL客户端可用"
    echo "💡 可以使用以下命令测试SQL文件:"
    echo "   mysql -h主机 -u用户名 -p密码 数据库名 < oldksports_database_export.sql"
else
    echo "❌ MySQL客户端不可用，请安装MySQL客户端"
fi

echo "🎉 验证完成！"
`;

const verifyScriptPath = path.join(__dirname, 'verify_fixed_sql.sh');
fs.writeFileSync(verifyScriptPath, verifyScript, 'utf8');
fs.chmodSync(verifyScriptPath, '755');
console.log(`✅ 验证脚本创建完成: ${verifyScriptPath}`);

// 创建Windows验证脚本
const windowsVerifyScript = `@echo off
REM 验证修复后的SQL文件
echo 🧪 验证修复后的SQL文件...

REM 检查连续空值
echo 📝 检查连续空值问题...
findstr /n ",," oldksports_database_export.sql >nul 2>&1
if errorlevel 1 (
    echo ✅ 连续空值问题已修复
) else (
    echo ❌ 仍然存在连续空值问题
    findstr /n ",," oldksports_database_export.sql | more
)

REM 检查基本语法
echo 📝 检查基本SQL语法...
mysql --help >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL客户端不可用，请安装MySQL客户端
) else (
    echo ✅ MySQL客户端可用
    echo 💡 可以使用以下命令测试SQL文件:
    echo    mysql -h主机 -u用户名 -p密码 数据库名 ^< oldksports_database_export.sql
)

echo 🎉 验证完成！
pause
`;

const windowsVerifyScriptPath = path.join(__dirname, 'verify_fixed_sql.bat');
fs.writeFileSync(windowsVerifyScriptPath, windowsVerifyScript, 'utf8');
console.log(`✅ Windows验证脚本创建完成: ${windowsVerifyScriptPath}`);

console.log('\n📋 修复总结:');
console.log('   - 只修复了连续空值问题 (,, -> ,NULL,)');
console.log('   - 保持了原始数据的完整性');
console.log('   - 创建了验证脚本');
console.log('\n🚀 现在可以尝试导入修复后的SQL文件了！');
