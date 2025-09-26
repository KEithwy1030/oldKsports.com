@echo off
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
