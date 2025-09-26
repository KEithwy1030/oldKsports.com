#!/bin/bash
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
