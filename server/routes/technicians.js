/**
 * 技师管理路由模块
 *
 * 职责：
 * - GET    /api/technicians      获取技师列表（含 active_orders 在单数）
 * - POST   /api/technicians      创建技师（注册用户，role='tech'）
 * - PUT    /api/technicians/:id  更新技师信息
 * - DELETE /api/technicians/:id  删除技师（有进行中工单时拒绝）
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { authRequired, roleCheck } = require('../middleware/auth');

const router = express.Router();

// bcrypt 加密轮次，与 db.js 种子数据保持一致
const SALT_ROUNDS = 10;

/**
 * GET /api/technicians
 * 获取技师列表
 *
 * 返回所有 role='tech' 的用户，每项包含 active_orders（进行中工单数）
 *
 * 鉴权：需登录
 * 响应体：{ code: 0, data: [{ id, real_name, phone, active_orders }] }
 */
router.get('/', authRequired, (req, res) => {
  const db = getDb();

  // 查询所有技师，关联统计 status='working' 的工单数量
  const technicians = db.prepare(`
    SELECT
      u.id,
      u.real_name,
      u.phone,
      COALESCE(o.active_orders, 0) AS active_orders
    FROM users u
    LEFT JOIN (
      SELECT tech_id, COUNT(*) AS active_orders
      FROM orders
      WHERE status = 'working'
      GROUP BY tech_id
    ) o ON u.id = o.tech_id
    WHERE u.role = 'tech'
    ORDER BY u.created_at ASC
  `).all();

  return success(res, technicians);
});

/**
 * POST /api/technicians
 * 创建技师
 *
 * 创建一个新用户并自动分配 role='tech'，密码使用 bcrypt 加密
 *
 * 鉴权：需登录（admin）
 * 请求体：{ username, password, real_name, phone }
 * 响应体：{ code: 0, data: { id, username, real_name, role } }
 */
router.post('/', authRequired, roleCheck('admin'), (req, res) => {
  const { username, password, real_name, phone } = req.body;

  // 参数校验：用户名和密码不能为空
  if (!username || !username.trim()) {
    return fail(res, 400, '用户名不能为空', 400);
  }
  if (!password || !password.trim()) {
    return fail(res, 400, '密码不能为空', 400);
  }

  const db = getDb();

  // 检查用户名是否已存在
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (existing) {
    return fail(res, 400, '用户名已存在', 400);
  }

  // bcrypt 加密密码
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  // 插入技师记录，角色固定为 tech
  const stmt = db.prepare(`
    INSERT INTO users (username, password, real_name, role, phone)
    VALUES (?, ?, ?, 'tech', ?)
  `);

  const result = stmt.run(
    username.trim(),
    hashedPassword,
    real_name ? real_name.trim() : null,
    phone ? phone.trim() : null
  );

  // 返回创建的技师信息（不包含密码）
  return success(res, {
    id: result.lastInsertRowid,
    username: username.trim(),
    real_name: real_name ? real_name.trim() : null,
    role: 'tech'
  });
});

/**
 * PUT /api/technicians/:id
 * 更新技师信息
 *
 * 仅允许更新 real_name 和 phone，不允许修改角色和用户名
 *
 * 鉴权：需登录（admin）
 * 请求体：{ real_name?, phone? }
 * 响应体：{ code: 0, data: { id, real_name, phone } }
 */
router.put('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { real_name, phone } = req.body;

  // 检查技师是否存在且角色为 tech
  const technician = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id);
  if (!technician) {
    return fail(res, 404, '技师不存在', 404);
  }
  if (technician.role !== 'tech') {
    return fail(res, 400, '该用户不是技师角色', 400);
  }

  // 构建动态更新字段
  const updateFields = [];
  const updateParams = [];

  if (real_name !== undefined && real_name !== null) {
    updateFields.push('real_name = ?');
    updateParams.push(real_name.trim());
  }

  if (phone !== undefined && phone !== null) {
    updateFields.push('phone = ?');
    updateParams.push(phone.trim());
  }

  if (updateFields.length === 0) {
    return fail(res, 400, '没有需要更新的字段', 400);
  }

  // 执行更新
  const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  updateParams.push(id);

  db.prepare(updateSql).run(...updateParams);

  // 查询更新后的数据返回
  const updated = db.prepare('SELECT id, real_name, phone FROM users WHERE id = ?').get(id);

  return success(res, updated);
});

/**
 * DELETE /api/technicians/:id
 * 删除技师
 *
 * 业务规则：
 * - 若技师有进行中的工单（status='working'），不允许删除
 * - 仅 admin 可删除
 *
 * 鉴权：需登录（admin）
 * 响应体：{ code: 0, data: null }
 * 错误码：
 * - 400: 该技师有进行中的工单，无法删除
 * - 404: 技师不存在
 */
router.delete('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;

  // 检查技师是否存在且角色为 tech
  const technician = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id);
  if (!technician) {
    return fail(res, 404, '技师不存在', 404);
  }
  if (technician.role !== 'tech') {
    return fail(res, 400, '该用户不是技师角色', 400);
  }

  // 检查是否有进行中的工单
  const activeOrders = db.prepare(
    'SELECT COUNT(*) AS cnt FROM orders WHERE tech_id = ? AND status = ?'
  ).get(id, 'working');

  if (activeOrders.cnt > 0) {
    return fail(res, 400, '该技师有进行中的工单，无法删除', 400);
  }

  // 执行删除
  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  return success(res, null);
});

module.exports = router;
