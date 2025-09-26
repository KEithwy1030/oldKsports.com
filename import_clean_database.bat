@echo off
REM OldKSports 干净数据库导入脚本 (Windows)
REM 使用方法: import_clean_database.bat

echo 🚀 开始导入OldKSports干净数据库...

REM 检查MySQL连接
mysql -h"localhost" -u"root" -p"k19941030" -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到数据库，请检查配置
    pause
    exit /b 1
)

echo ✅ 数据库连接成功

REM 导入完整数据库
echo 📤 导入完整数据库...
mysql -h"localhost" -u"root" -p"k19941030" "old_k_sports" < oldksports_clean_export.sql

if errorlevel 1 (
    echo ❌ 数据库导入失败
    pause
    exit /b 1
) else (
    echo ✅ 数据库导入成功！
    echo 🎉 导入完成！
)

pause
