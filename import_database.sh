#!/bin/bash
# OldKSports 数据库导入脚本
# 使用方法: ./import_database.sh

echo "🚀 开始导入OldKSports数据库..."

# 检查MySQL连接
if ! mysql -h"localhost" -u"root" -p"k19941030" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ 无法连接到数据库，请检查配置"
    exit 1
fi

echo "✅ 数据库连接成功"

# 导入完整数据库
echo "📤 导入完整数据库..."
mysql -h"localhost" -u"root" -p"k19941030" "old_k_sports" < oldksports_database_export.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库导入成功！"
else
    echo "❌ 数据库导入失败"
    exit 1
fi

echo "🎉 导入完成！"
