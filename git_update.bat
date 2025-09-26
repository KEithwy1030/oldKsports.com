@echo off
echo ========================================
echo 自动Git更新脚本
echo ========================================

echo 检查Git状态...
git status

echo.
echo 添加所有更改...
git add .

echo.
echo 提交更改...
git commit -m "自动更新: %date% %time%"

echo.
echo 推送到远程仓库...
git push origin main

echo.
echo ========================================
echo Git更新完成！
echo ========================================
pause
