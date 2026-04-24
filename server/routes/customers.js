/**
 * 客户管理路由模块
 *
 * 职责：
 * - GET    /api/customers      获取客户列表（支持 keyword 搜索）
 * - POST   /api/customers      创建客户
 * - PUT    /api/customers/:id  更新客户信息
 * - DELETE /api/customers/:id  删除客户
 */

const express = require('express');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { authRequired, roleCheck } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/customers
 * 获取客户列表
 *
 * 查询参数：
 * - keyword: 关键词搜索（姓名/电话/地址）
 *
 * 鉴权：需登录（admin）
 * 响应体：{ code: 0, data: [{ id, name, phone, address, remark, created_at }] }
 */
router.get('/', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { keyword } = req.query;

  const conditions = [];
  const params = [];

  if (keyword && keyword.trim()) {
    conditions.push('(name LIKE ? OR phone LIKE ? OR address LIKE ?)');
    const kw = `%${keyword.trim()}%`;
    params.push(kw, kw, kw);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const customers = db.prepare(`
    SELECT id, name, phone, address, remark, created_at
    FROM customers
    ${whereClause}
    ORDER BY created_at DESC
  `).all(...params);

  return success(res, customers);
});

/**
 * POST /api/customers
 * 创建客户
 *
 * 请求体：{ name, phone?, address?, remark? }
 * 响应体：{ code: 0, data: { id, name, phone, address, remark } }
 */
router.post('/', authRequired, roleCheck('admin'), (req, res) => {
  const { name, phone, address, remark } = req.body;

  if (!name || !name.trim()) {
    return fail(res, 400, '客户姓名不能为空', 400);
  }

  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO customers (name, phone, address, remark)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    name.trim(),
    phone ? phone.trim() : null,
    address ? address.trim() : null,
    remark ? remark.trim() : null
  );

  return success(res, {
    id: result.lastInsertRowid,
    name: name.trim(),
    phone: phone ? phone.trim() : null,
    address: address ? address.trim() : null,
    remark: remark ? remark.trim() : null
  });
});

/**
 * PUT /api/customers/:id
 * 更新客户信息
 *
 * 请求体：{ name?, phone?, address?, remark? }
 * 响应体：{ code: 0, data: { id, name, phone, address, remark } }
 */
router.put('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name, phone, address, remark } = req.body;

  // 检查客户是否存在
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    return fail(res, 404, '客户不存在', 404);
  }

  // 参数校验
  if (name !== undefined && !name.trim()) {
    return fail(res, 400, '客户姓名不能为空', 400);
  }

  // 构建动态更新字段
  const updateFields = [];
  const updateParams = [];

  if (name !== undefined && name !== null) {
    updateFields.push('name = ?');
    updateParams.push(name.trim());
  }

  if (phone !== undefined && phone !== null) {
    updateFields.push('phone = ?');
    updateParams.push(phone.trim());
  }

  if (address !== undefined && address !== null) {
    updateFields.push('address = ?');
    updateParams.push(address.trim());
  }

  if (remark !== undefined && remark !== null) {
    updateFields.push('remark = ?');
    updateParams.push(remark.trim());
  }

  if (updateFields.length === 0) {
    return fail(res, 400, '没有需要更新的字段', 400);
  }

  const updateSql = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`;
  updateParams.push(id);

  db.prepare(updateSql).run(...updateParams);

  const updated = db.prepare('SELECT id, name, phone, address, remark, created_at FROM customers WHERE id = ?').get(id);
  return success(res, updated);
});

/**
 * DELETE /api/customers/:id
 * 删除客户
 *
 * 响应体：{ code: 0, data: null }
 */
router.delete('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;

  // 检查客户是否存在
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    return fail(res, 404, '客户不存在', 404);
  }

  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  return success(res, null);
});

module.exports = router;
