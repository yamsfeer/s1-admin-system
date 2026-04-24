#!/bin/bash
# 维修派单管家 - 项目初始化和服务启动脚本

set -e

echo "============================================="
echo "  维修派单管家 - 项目初始化"
echo "============================================="

# ---- 后端初始化 ----
echo ""
echo "[1/4] 初始化后端..."
cd server

if [ ! -d node_modules ]; then
  echo "  安装后端依赖..."
  npm install
else
  echo "  后端依赖已安装，跳过"
fi

# 确保 data 目录存在
mkdir -p data

echo "  启动后端服务..."
node app.js &
SERVER_PID=$!
echo "  后端 PID: $SERVER_PID"

# 等待后端启动
echo "  等待后端服务就绪..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8011/api/auth/login > /dev/null 2>&1; then
    echo "  后端服务已就绪 ✓"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "  后端启动超时，请检查日志"
    exit 1
  fi
  sleep 1
done

cd ..

# ---- 前端初始化 ----
echo ""
echo "[2/4] 初始化前端..."
cd client

if [ ! -d node_modules ]; then
  echo "  安装前端依赖..."
  npm install
else
  echo "  前端依赖已安装，跳过"
fi

cd ..

# ---- 数据库验证 ----
echo ""
echo "[3/4] 验证数据库..."
if [ -f server/data/app.db ]; then
  echo "  数据库文件已创建 ✓"
  TABLE_COUNT=$(sqlite3 server/data/app.db ".tables" | wc -w)
  echo "  数据表数量: $TABLE_COUNT"
else
  echo "  警告：数据库文件未找到，后端可能启动异常"
fi

# ---- 启动前端 ----
echo ""
echo "[4/4] 启动前端开发服务器..."
cd client
npm run dev &
CLIENT_PID=$!
echo "  前端 PID: $CLIENT_PID"
cd ..

echo ""
echo "============================================="
echo "  初始化完成！"
echo "============================================="
echo ""
echo "  后端地址: http://localhost:8011"
echo "  前端地址: http://localhost:8012"
echo "  默认管理员: admin / 123456"
echo "  默认技师:   zhangsan / 123456"
echo ""
echo "  停止服务: kill $SERVER_PID $CLIENT_PID"
echo "============================================="
