#!/usr/bin/env node
/**
 * 重新导出干净的MySQL数据库数据
 * 避免之前的语法错误问题
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 旧数据库配置（本地开发环境）
const OLD_DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'k19941030',
  database: 'old_k_sports',
  port: 3306
};

console.log('🚀 开始重新导出干净的数据库数据...');
console.log('📊 数据库配置:', {
  host: OLD_DB_CONFIG.host,
  user: OLD_DB_CONFIG.user,
  database: OLD_DB_CONFIG.database,
  port: OLD_DB_CONFIG.port
});

async function exportCleanDatabase() {
  let connection = null;
  
  try {
    // 连接数据库
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(OLD_DB_CONFIG);
    console.log('✅ 数据库连接成功');

    // 获取所有表名
    console.log('📋 获取数据库表列表...');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('📊 发现表:', tableNames);

    // 创建导出目录
    const exportDir = path.join(__dirname, 'clean_database_export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
      console.log('📁 创建导出目录:', exportDir);
    }

    // 导出每个表的数据
    for (const tableName of tableNames) {
      console.log(`\n📤 导出表: ${tableName}`);
      
      try {
        // 获取表结构
        const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        const createStatement = createTable[0]['Create Table'];
        
        // 获取表数据
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
        console.log(`📊 表 ${tableName} 有 ${rows.length} 行数据`);

        // 创建SQL文件
        const sqlFile = path.join(exportDir, `${tableName}.sql`);
        let sqlContent = `-- 表结构: ${tableName}\n`;
        sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sqlContent += `${createStatement};\n\n`;
        
        if (rows.length > 0) {
          sqlContent += `-- 表数据: ${tableName}\n`;
          
          // 获取列名
          const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
          const columnNames = columns.map(col => col.Field);
          
          // 生成INSERT语句 - 使用更安全的方法
          for (const row of rows) {
            const values = columnNames.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') {
                // 转义单引号
                const escapedValue = value.replace(/'/g, "''");
                return `'${escapedValue}'`;
              }
              if (value instanceof Date) {
                return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              }
              if (typeof value === 'number') {
                return value.toString();
              }
              if (typeof value === 'boolean') {
                return value ? '1' : '0';
              }
              // 处理JSON字段
              if (typeof value === 'object' && value !== null) {
                return `'${JSON.stringify(value)}'`;
              }
              return `'${String(value)}'`;
            });
            
            sqlContent += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
          }
        }
        
        // 写入文件
        fs.writeFileSync(sqlFile, sqlContent, 'utf8');
        console.log(`✅ 表 ${tableName} 导出完成: ${sqlFile}`);
        
      } catch (error) {
        console.error(`❌ 导出表 ${tableName} 失败:`, error.message);
      }
    }

    // 创建完整的数据库导出文件
    console.log('\n📦 创建完整数据库导出文件...');
    const fullExportFile = path.join(__dirname, 'oldksports_clean_export.sql');
    let fullSqlContent = `-- OldKSports 数据库干净导出\n`;
    fullSqlContent += `-- 导出时间: ${new Date().toISOString()}\n`;
    fullSqlContent += `-- 数据库: ${OLD_DB_CONFIG.database}\n\n`;
    fullSqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // 合并所有表的SQL
    for (const tableName of tableNames) {
      const sqlFile = path.join(exportDir, `${tableName}.sql`);
      if (fs.existsSync(sqlFile)) {
        const tableSql = fs.readFileSync(sqlFile, 'utf8');
        fullSqlContent += tableSql + '\n';
      }
    }

    fullSqlContent += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
    
    // 写入完整导出文件
    fs.writeFileSync(fullExportFile, fullSqlContent, 'utf8');
    console.log(`✅ 完整数据库导出文件创建完成: ${fullExportFile}`);

    // 创建导入脚本
    console.log('\n📝 创建导入脚本...');
    const importScript = `#!/bin/bash
# OldKSports 干净数据库导入脚本
# 使用方法: ./import_clean_database.sh

echo "🚀 开始导入OldKSports干净数据库..."

# 检查MySQL连接
if ! mysql -h"${OLD_DB_CONFIG.host}" -u"${OLD_DB_CONFIG.user}" -p"${OLD_DB_CONFIG.password}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ 无法连接到数据库，请检查配置"
    exit 1
fi

echo "✅ 数据库连接成功"

# 导入完整数据库
echo "📤 导入完整数据库..."
mysql -h"${OLD_DB_CONFIG.host}" -u"${OLD_DB_CONFIG.user}" -p"${OLD_DB_CONFIG.password}" "${OLD_DB_CONFIG.database}" < oldksports_clean_export.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库导入成功！"
else
    echo "❌ 数据库导入失败"
    exit 1
fi

echo "🎉 导入完成！"
`;

    const importScriptPath = path.join(__dirname, 'import_clean_database.sh');
    fs.writeFileSync(importScriptPath, importScript, 'utf8');
    fs.chmodSync(importScriptPath, '755');
    console.log(`✅ 导入脚本创建完成: ${importScriptPath}`);

    // 创建Windows批处理文件
    const windowsImportScript = `@echo off
REM OldKSports 干净数据库导入脚本 (Windows)
REM 使用方法: import_clean_database.bat

echo 🚀 开始导入OldKSports干净数据库...

REM 检查MySQL连接
mysql -h"${OLD_DB_CONFIG.host}" -u"${OLD_DB_CONFIG.user}" -p"${OLD_DB_CONFIG.password}" -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到数据库，请检查配置
    pause
    exit /b 1
)

echo ✅ 数据库连接成功

REM 导入完整数据库
echo 📤 导入完整数据库...
mysql -h"${OLD_DB_CONFIG.host}" -u"${OLD_DB_CONFIG.user}" -p"${OLD_DB_CONFIG.password}" "${OLD_DB_CONFIG.database}" < oldksports_clean_export.sql

if errorlevel 1 (
    echo ❌ 数据库导入失败
    pause
    exit /b 1
) else (
    echo ✅ 数据库导入成功！
    echo 🎉 导入完成！
)

pause
`;

    const windowsImportScriptPath = path.join(__dirname, 'import_clean_database.bat');
    fs.writeFileSync(windowsImportScriptPath, windowsImportScript, 'utf8');
    console.log(`✅ Windows导入脚本创建完成: ${windowsImportScriptPath}`);

    console.log('\n🎉 干净数据库导出完成！');
    console.log('📁 导出文件位置:');
    console.log(`   - 完整导出: ${fullExportFile}`);
    console.log(`   - 分表导出: ${exportDir}/`);
    console.log(`   - 导入脚本: ${importScriptPath}`);
    console.log(`   - Windows导入: ${windowsImportScriptPath}`);

  } catch (error) {
    console.error('❌ 导出过程中发生错误:', error);
    throw error;
  } finally {
    // 关闭连接
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行导出
exportCleanDatabase()
  .then(() => {
    console.log('\n✅ 干净数据库导出任务完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 干净数据库导出任务失败:', error);
    process.exit(1);
  });
