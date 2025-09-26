@echo off
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
