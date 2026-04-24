/**
 * JWT 认证中间件 + 角色权限判断
 *
 * 职责：
 * - authRequired: 校验 JWT Token，解析用户信息并挂载到 req.user
 * - roleCheck(roles): 角色权限判断，仅允许指定角色访问
 */

const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

// JWT 密钥，生产环境应从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'repair-dispatch-secret-key-2026';

// JWT Token 有效期：24 小时
const JWT_EXPIRES_IN = '24h';

/**
 * 生成 JWT Token
 * @param {object} payload - 要编码的数据（用户信息）
 * @returns {string} JWT Token 字符串
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT 校验中间件
 * 从请求头 Authorization 中提取 Bearer Token，
 * 校验有效性后解析用户信息挂载到 req.user
 */
function authRequired(req, res, next) {
  // 从请求头获取 Authorization 字段
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return fail(res, 401, '未提供认证信息，请先登录', 401);
  }

  // 校验 Bearer 格式
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return fail(res, 401, '认证格式错误，请使用 Bearer Token', 401);
  }

  const token = parts[1];

  try {
    // 验证并解码 Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将用户信息挂载到 req对象上，供后续中间件和路由使用
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, 401, 'Token 已过期，请重新登录', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return fail(res, 401, 'Token 无效，请重新登录', 401);
    }
    // 其他 JWT 错误
    return fail(res, 401, '认证失败，请重新登录', 401);
  }
}

/**
 * 角色权限判断中间件工厂函数
 * 返回一个中间件，检查 req.user.role 是否在允许的角色列表中
 *
 * @param {string[]} roles - 允许访问的角色数组，如 ['admin'] 或 ['admin', 'tech']
 * @returns {function} Express 中间件
 *
 * @example
 * // 仅允许管理员访问
 * router.post('/orders', authRequired, roleCheck('admin'), handler);
 *
 * // 允许多种角色访问
 * router.get('/orders', authRequired, roleCheck('admin', 'tech'), handler);
 */
function roleCheck(...roles) {
  return (req, res, next) => {
    // authRequired 中间件应已挂载 req.user
    if (!req.user) {
      return fail(res, 401, '未认证，请先登录', 401);
    }

    if (!roles.includes(req.user.role)) {
      return fail(res, 403, '无权限访问该资源', 403);
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateToken,
  authRequired,
  roleCheck
};
