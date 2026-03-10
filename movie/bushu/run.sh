#!/bin/bash

# 小米运动刷步数 - 启动脚本

echo "=========================================="
echo "  小米运动刷步数 JavaScript 版本"
echo "=========================================="
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "Node.js 版本: $(node --version)"
echo ""

# 检查配置文件
if [ ! -f "config.json" ] && [ -z "$CONFIG" ]; then
    echo "警告: 未找到 config.json 文件且未设置 CONFIG 环境变量"
    echo "请参考 config.example.json 创建配置文件或设置环境变量"
    echo ""
    echo "示例: export CONFIG='{\"USER\":\"账号\",\"PWD\":\"密码\",...}'"
    exit 1
fi

# 如果存在 config.json，读取并设置为环境变量
if [ -f "config.json" ] && [ -z "$CONFIG" ]; then
    echo "从 config.json 加载配置..."
    export CONFIG=$(cat config.json)
fi

# 检查是否设置了 AES_KEY
if [ -n "$AES_KEY" ]; then
    echo "检测到 AES_KEY，将启用加密保存功能"
else
    echo "未设置 AES_KEY，不使用加密保存（建议设置以提高安全性）"
fi

echo ""
echo "开始执行..."
echo "=========================================="
echo ""

# 运行主程序
cd "$(dirname "$0")"
node main.js

exit_code=$?

echo ""
echo "=========================================="
if [ $exit_code -eq 0 ]; then
    echo "执行完成！"
else
    echo "执行失败，退出码: $exit_code"
fi
echo "=========================================="

exit $exit_code


