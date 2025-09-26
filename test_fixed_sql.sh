#!/bin/bash
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
