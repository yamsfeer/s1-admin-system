/**
 * 维修派单管家 - Express 入口
 *
 * 职责：
 * - 加载中间件（CORS、JSON 解析、静态文件服务）
 * - 挂载路由模块
 * - 统一错误处理
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { success, fail } = require('./utils/response');
const { initDb, closeDb } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 8011;

// ---- 数据库初始化 ----
initDb();

// ---- 中间件 ----

// CORS：允许前端开发服务器跨域访问
app.use(cors());

// JSON 请求体解析
app.use(express.json());

// URL-encoded 请求体解析（兼容表单提交）
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（前端构建产物）
// 生产环境下 Nginx 直接服务静态文件，此处作为备选
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// ---- 路由挂载 ----

// API 健康检查
app.get('/api/health', (req, res) => {
  success(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// ---- 业务路由挂载 ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/technicians', require('./routes/technicians'));    // T008
app.use('/api/customers', require('./routes/customers'));        // T009
app.use('/api/dashboard', require('./routes/dashboard'));        // T006

// ---- SPA 兜底路由 ----
// 非API请求返回 index.html，由前端路由处理
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    // API 路由未匹配到，返回 404
    return fail(res, 404, '接口不存在', 404);
  }
  // 前端 SPA 兜底
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'), (err) => {
    if (err) {
      // 前端构建产物不存在，返回简单提示
      res.status(200).send('维修派单管家 - 后端服务运行中');
    }
  });
});

// ---- 统一错误处理中间件 ----

// 404 处理（针对 API 请求）
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return fail(res, 404, '接口不存在', 404);
  }
  next();
});

// 全局错误捕获
app.use((err, req, res, next) => {
  console.error('[服务器错误]', err.message || err);

  // JWT 错误特殊处理
  if (err.name === 'UnauthorizedError') {
    return fail(res, 401, '认证失败，请重新登录', 401);
  }

  // 参数解析错误
  if (err.type === 'entity.parse.failed') {
    return fail(res, 400, '请求体格式错误', 400);
  }

  // 其他未捕获的错误
  return fail(res, 500, '服务器内部错误', 500);
});

// ---- 启动服务 ----

const server = app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`  维修派单管家 - 后端服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`===========================================`);
});

// ---- 优雅关闭 ----
process.on('SIGINT', () => {
  console.log('\n[服务器] 正在关闭...');
  closeDb();
  server.close(() => {
    console.log('[服务器] 已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[服务器] 收到 SIGTERM，正在关闭...');
  closeDb();
  server.close(() => {
    console.log('[服务器] 已关闭');
    process.exit(0);
  });
});

module.exports = app;
