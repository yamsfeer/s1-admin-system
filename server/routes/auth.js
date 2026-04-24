/**
 * 认证路由模块
 *
 * 职责：
 * - POST /api/auth/login  用户登录，返回 JWT Token 和用户信息
 * - GET  /api/auth/me     获取当前登录用户信息（需认证）
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { generateToken, authRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * 用户登录
 *
 * 请求体：{ username, password }
 * 响应体：{ code: 0, data: { token, user: { id, username, real_name, role } } }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 参数校验：用户名和密码不能为空
  if (!username || !password) {
    return fail(res, 400, '用户名或密码不能为空', 400);
  }

  const db = getDb();

  // 查询用户
  const user = db.prepare('SELECT id, username, password, real_name, role, phone FROM users WHERE username = ?').get(username);

  if (!user) {
    return fail(res, 401, '用户名或密码错误', 401);
  }

  // 验证密码（bcrypt 对比）
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return fail(res, 401, '用户名或密码错误', 401);
  }

  // 生成 JWT Token，payload 包含用户核心信息
  const token = generateToken({
    id: user.id,
    username: user.username,
    real_name: user.real_name,
    role: user.role
  });

  // 返回成功响应，不包含密码
  return success(res, {
    token,
    user: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role
    }
  });
});

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 *
 * 鉴权：需登录
 * 响应体：{ code: 0, data: { id, username, real_name, role, phone } }
 */
router.get('/me', authRequired, (req, res) => {
  const db = getDb();

  // req.user 由 authRequired 中间件挂载
  const user = db.prepare('SELECT id, username, real_name, role, phone FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return fail(res, 404, '用户不存在', 404);
  }

  return success(res, user);
});

module.exports = router;
