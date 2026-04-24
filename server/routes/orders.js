/**
 * 工单路由模块
 *
 * 职责：
 * - POST   /api/orders          创建工单（admin）
 * - GET    /api/orders          获取工单列表（分页+筛选+搜索，tech角色只返回自己的）
 * - GET    /api/orders/export   导出工单 Excel（admin）
 * - POST   /api/orders/:id/remarks 添加工单备注（需登录）
 * - GET    /api/orders/:id      获取工单详情（含备注列表）
 * - PUT    /api/orders/:id/status 更新工单状态（含业务规则校验）
 * - PUT    /api/orders/:id      更新工单基本信息（admin）
 * - DELETE /api/orders/:id      删除工单（admin）
 */

const express = require('express');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { authRequired, roleCheck } = require('../middleware/auth');
const { generateOrderNo } = require('../utils/orderNo');
const ExcelJS = require('exceljs');

const router = express.Router();

// 合法的工单状态值
const VALID_STATUSES = ['pending', 'working', 'done', 'settled'];

// 允许的状态流转映射：当前状态 → 允许转换到的状态列表
const STATUS_TRANSITIONS = {
  pending: ['working'],
  working: ['done', 'pending'],
  done: ['settled'],
  settled: []  // 已结算，不可再流转
};

// 状态中文映射（用于导出等场景）
const STATUS_LABELS = {
  pending: '待派单',
  working: '进行中',
  done: '已完工',
  settled: '已结算'
};

/**
 * POST /api/orders
 * 创建工单
 *
 * 业务规则：
 * - 必填字段：customer_name, address, description
 * - 如果指定了 tech_id，状态自动设为 working；否则为 pending
 * - order_no 自动生成，格式：WO + 日期(8位) + 序号(3位)
 */
router.post('/', authRequired, roleCheck('admin'), (req, res) => {
  const { customer_name, customer_phone, address, description, tech_id } = req.body;

  // 参数校验：必填字段
  if (!customer_name || !customer_name.trim()) {
    return fail(res, 400, '客户姓名不能为空', 400);
  }
  if (!address || !address.trim()) {
    return fail(res, 400, '维修地址不能为空', 400);
  }
  if (!description || !description.trim()) {
    return fail(res, 400, '问题描述不能为空', 400);
  }

  const db = getDb();

  // 如果指定了 tech_id，验证技师是否存在且角色为 tech
  if (tech_id) {
    const tech = db.prepare('SELECT id, role FROM users WHERE id = ?').get(tech_id);
    if (!tech) {
      return fail(res, 400, '指定的技师不存在', 400);
    }
    if (tech.role !== 'tech') {
      return fail(res, 400, '指定的用户不是技师角色', 400);
    }
  }

  // 自动生成工单编号
  const order_no = generateOrderNo();

  // 根据是否指派技师决定初始状态
  const status = tech_id ? 'working' : 'pending';

  // 插入工单记录
  const stmt = db.prepare(`
    INSERT INTO orders (order_no, customer_name, customer_phone, address, description, status, tech_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    order_no,
    customer_name.trim(),
    customer_phone ? customer_phone.trim() : null,
    address.trim(),
    description.trim(),
    status,
    tech_id || null
  );

  return success(res, {
    id: result.lastInsertRowid,
    order_no,
    status
  });
});

/**
 * GET /api/orders
 * 获取工单列表（分页+筛选+搜索）
 *
 * 查询参数：
 * - page: 页码，默认 1
 * - size: 每页条数，默认 10
 * - status: 状态筛选
 * - keyword: 关键词搜索（客户名/地址/描述）
 * - start_date: 开始日期
 * - end_date: 结束日期
 *
 * 权限规则：
 * - admin 角色返回所有工单
 * - tech 角色只返回 tech_id 等于自己的工单
 */
router.get('/', authRequired, (req, res) => {
  const db = getDb();

  // 解析分页参数
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 10));
  const offset = (page - 1) * size;

  // 解析筛选参数
  const { status, keyword, start_date, end_date } = req.query;

  // 构建 WHERE 条件和参数
  const conditions = [];
  const params = [];

  // 角色权限：tech 只能看自己的工单
  if (req.user.role === 'tech') {
    conditions.push('o.tech_id = ?');
    params.push(req.user.id);
  }

  // 状态筛选
  if (status && VALID_STATUSES.includes(status)) {
    conditions.push('o.status = ?');
    params.push(status);
  }

  // 关键词搜索（客户名/地址/描述）
  if (keyword && keyword.trim()) {
    conditions.push('(o.customer_name LIKE ? OR o.address LIKE ? OR o.description LIKE ?)');
    const kw = `%${keyword.trim()}%`;
    params.push(kw, kw, kw);
  }

  // 日期范围筛选
  if (start_date) {
    conditions.push('o.created_at >= ?');
    params.push(`${start_date} 00:00:00`);
  }
  if (end_date) {
    conditions.push('o.created_at <= ?');
    params.push(`${end_date} 23:59:59`);
  }

  // 拼接 WHERE 子句
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询总数
  const countSql = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
  const countResult = db.prepare(countSql).get(...params);
  const total = countResult.total;

  // 查询列表数据，关联查询技师姓名
  const listSql = `
    SELECT
      o.id, o.order_no, o.customer_name, o.customer_phone,
      o.address, o.description, o.status, o.tech_id,
      u.real_name AS tech_name,
      o.fee, o.settled_at, o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN users u ON o.tech_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const list = db.prepare(listSql).all(...params, size, offset);

  return success(res, {
    total,
    page,
    size,
    list
  });
});

/**
 * GET /api/orders/export
 * 导出工单列表为 Excel 文件（.xlsx）
 *
 * 查询参数：
 * - status: 状态筛选
 * - keyword: 关键词搜索（客户名/地址/描述）
 * - start_date: 开始日期
 * - end_date: 结束日期
 *
 * 权限规则：
 * - 仅 admin 可导出
 *
 * Excel 样式：
 * - 表头：加粗 + 浅蓝背景 #D9E1F2
 * - 状态列：中文映射
 * - 费用列：数字格式，保留2位小数
 * - 列宽自适应
 */
router.get('/export', authRequired, roleCheck('admin'), async (req, res) => {
  const db = getDb();

  // 解析筛选参数（与 GET /api/orders 保持一致）
  const { status, keyword, start_date, end_date } = req.query;

  // 构建 WHERE 条件和参数
  const conditions = [];
  const params = [];

  // 状态筛选
  if (status && VALID_STATUSES.includes(status)) {
    conditions.push('o.status = ?');
    params.push(status);
  }

  // 关键词搜索（客户名/地址/描述）
  if (keyword && keyword.trim()) {
    conditions.push('(o.customer_name LIKE ? OR o.address LIKE ? OR o.description LIKE ?)');
    const kw = `%${keyword.trim()}%`;
    params.push(kw, kw, kw);
  }

  // 日期范围筛选
  if (start_date) {
    conditions.push('o.created_at >= ?');
    params.push(`${start_date} 00:00:00`);
  }
  if (end_date) {
    conditions.push('o.created_at <= ?');
    params.push(`${end_date} 23:59:59`);
  }

  // 拼接 WHERE 子句
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询所有符合条件的工单（不分页）
  const listSql = `
    SELECT
      o.id, o.order_no, o.customer_name, o.customer_phone,
      o.address, o.description, o.status, o.tech_id,
      u.real_name AS tech_name,
      o.fee, o.settled_at, o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN users u ON o.tech_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
  `;

  const list = db.prepare(listSql).all(...params);

  // 创建 Excel 工作簿
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('工单列表');

  // 定义列（表头名称、字段映射、列宽）
  const columns = [
    { header: '工单编号', key: 'order_no', width: 18 },
    { header: '客户姓名', key: 'customer_name', width: 12 },
    { header: '客户电话', key: 'customer_phone', width: 15 },
    { header: '维修地址', key: 'address', width: 25 },
    { header: '问题描述', key: 'description', width: 30 },
    { header: '工单状态', key: 'status_label', width: 10 },
    { header: '指派技师', key: 'tech_name', width: 12 },
    { header: '维修费用', key: 'fee', width: 12 },
    { header: '创建时间', key: 'created_at', width: 20 },
    { header: '结算时间', key: 'settled_at', width: 20 }
  ];

  worksheet.columns = columns;

  // 设置表头行样式：加粗 + 浅蓝背景 #D9E1F2
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
  });

  // 填充数据行
  for (const order of list) {
    worksheet.addRow({
      order_no: order.order_no,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone || '',
      address: order.address,
      description: order.description,
      status_label: STATUS_LABELS[order.status] || order.status,
      tech_name: order.tech_name || '',
      fee: order.fee != null ? parseFloat(order.fee) : 0,
      created_at: order.created_at || '',
      settled_at: order.settled_at || ''
    });
  }

  // 设置费用列数字格式（保留2位小数）
  // 费用列是第8列（H列）
  for (let i = 2; i <= list.length + 1; i++) {
    const feeCell = worksheet.getCell(i, 8);
    feeCell.numFmt = '0.00';
  }

  // 生成日期后缀（YYYYMMDD 格式）
  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `orders_${dateSuffix}.xlsx`;

  // 设置响应头
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${filename}`
  );

  // 将工作簿写入响应流
  await workbook.xlsx.write(res);

  // 结束响应
  res.end();
});

/**
 * POST /api/orders/:id/remarks
 * 添加工单备注
 *
 * 业务规则：
 * - 需登录（admin 和 tech 均可添加）
 * - 备注内容不能为空
 * - created_by 从 JWT token 中获取（req.user.id）
 * - 工单不存在时返回 404
 *
 * 请求体：{ content: "需要更换角阀" }
 * 响应体：{ code: 0, data: { id, content, created_by, created_at } }
 */
router.post('/:id/remarks', authRequired, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { content } = req.body;

  // 校验备注内容不为空
  if (!content || !content.trim()) {
    return fail(res, 400, '备注内容不能为空', 400);
  }

  // 检查工单是否存在
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!order) {
    return fail(res, 404, '工单不存在', 404);
  }

  // tech 角色只能给自己的工单添加备注
  if (req.user.role === 'tech') {
    const orderDetail = db.prepare('SELECT tech_id FROM orders WHERE id = ?').get(id);
    if (orderDetail.tech_id !== req.user.id) {
      return fail(res, 403, '无权限给该工单添加备注', 403);
    }
  }

  // 插入备注记录，created_by 从 JWT token 中获取
  const stmt = db.prepare(`
    INSERT INTO order_remarks (order_id, content, created_by)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(
    parseInt(id),
    content.trim(),
    req.user.id
  );

  // 查询刚插入的备注记录返回完整信息
  const remark = db.prepare(`
    SELECT id, content, created_by, created_at
    FROM order_remarks
    WHERE id = ?
  `).get(result.lastInsertRowid);

  return success(res, remark);
});

/**
 * GET /api/orders/:id
 * 获取工单详情（含备注列表）
 */
router.get('/:id', authRequired, (req, res) => {
  const db = getDb();
  const { id } = req.params;

  // 查询工单基本信息，关联技师姓名
  const order = db.prepare(`
    SELECT
      o.id, o.order_no, o.customer_name, o.customer_phone,
      o.address, o.description, o.status, o.tech_id,
      u.real_name AS tech_name,
      o.fee, o.settled_at, o.created_at, o.updated_at
    FROM orders o
    LEFT JOIN users u ON o.tech_id = u.id
    WHERE o.id = ?
  `).get(id);

  if (!order) {
    return fail(res, 404, '工单不存在', 404);
  }

  // tech 角色只能查看自己的工单
  if (req.user.role === 'tech' && order.tech_id !== req.user.id) {
    return fail(res, 403, '无权限查看该工单', 403);
  }

  // 查询备注列表，关联备注创建人姓名
  const remarks = db.prepare(`
    SELECT
      r.id, r.content, r.created_by,
      u.real_name AS creator_name,
      r.created_at
    FROM order_remarks r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.order_id = ?
    ORDER BY r.created_at ASC
  `).all(id);

  order.remarks = remarks;

  return success(res, order);
});

/**
 * PUT /api/orders/:id/status
 * 更新工单状态
 *
 * 状态流转规则：
 * - pending  → working    （需 tech_id，若工单尚未指派）
 * - working  → done       （fee 可选）
 * - working  → pending    （重新派单）
 * - done     → settled    （fee 必填）
 * - settled  → 不可再流转
 *
 * 请求体：{ status, tech_id?, fee? }
 */
router.put('/:id/status', authRequired, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status, tech_id, fee } = req.body;

  // 校验目标状态是否合法
  if (!status || !VALID_STATUSES.includes(status)) {
    return fail(res, 400, `非法的状态值，允许值: ${VALID_STATUSES.join('/')}`, 400);
  }

  // 查询当前工单
  const order = db.prepare('SELECT id, status, tech_id, fee FROM orders WHERE id = ?').get(id);
  if (!order) {
    return fail(res, 404, '工单不存在', 404);
  }

  // 校验状态流转是否允许
  const allowedTransitions = STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions.includes(status)) {
    return fail(res, 400, `不允许从 '${STATUS_LABELS[order.status]}' 转换到 '${STATUS_LABELS[status]}'`, 400);
  }

  // 结算操作仅 admin 可执行
  if (status === 'settled' && req.user.role !== 'admin') {
    return fail(res, 403, '非管理员无权结算工单', 403);
  }

  // 根据不同流转规则校验附加字段
  const updates = { status };
  const updateFields = ['status = ?'];
  const updateParams = [status];

  if (status === 'working') {
    // pending → working：需要 tech_id（若工单尚未指派技师）
    if (!order.tech_id && !tech_id) {
      return fail(res, 400, '指派技师时需要提供 tech_id', 400);
    }
    if (tech_id) {
      // 验证技师存在
      const tech = db.prepare('SELECT id, role FROM users WHERE id = ?').get(tech_id);
      if (!tech) {
        return fail(res, 400, '指定的技师不存在', 400);
      }
      if (tech.role !== 'tech') {
        return fail(res, 400, '指定的用户不是技师角色', 400);
      }
      updateFields.push('tech_id = ?');
      updateParams.push(tech_id);
    }
  }

  if (status === 'done') {
    // working → done：fee 可选
    if (fee !== undefined && fee !== null) {
      const feeValue = parseFloat(fee);
      if (isNaN(feeValue) || feeValue < 0) {
        return fail(res, 400, '维修费用格式错误', 400);
      }
      updateFields.push('fee = ?');
      updateParams.push(feeValue);
    }
  }

  if (status === 'settled') {
    // done → settled：fee 必填
    if (fee !== undefined && fee !== null) {
      const feeValue = parseFloat(fee);
      if (isNaN(feeValue) || feeValue < 0) {
        return fail(res, 400, '维修费用格式错误', 400);
      }
      updateFields.push('fee = ?');
      updateParams.push(feeValue);
    } else if (!order.fee || order.fee === 0) {
      // 如果之前没录入费用，则 fee 必填
      return fail(res, 400, '结算时必须录入维修费用', 400);
    }
    // 记录结算时间
    updateFields.push('settled_at = CURRENT_TIMESTAMP');
  }

  if (status === 'pending') {
    // working → pending（重新派单）：清除技师指派
    updateFields.push('tech_id = NULL');
  }

  // 更新 updated_at
  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  // 执行更新
  const updateSql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
  updateParams.push(id);

  db.prepare(updateSql).run(...updateParams);

  // 查询更新后的数据返回
  const updatedOrder = db.prepare('SELECT id, status, tech_id, fee, settled_at FROM orders WHERE id = ?').get(id);

  return success(res, updatedOrder);
});

/**
 * PUT /api/orders/:id
 * 更新工单基本信息
 *
 * 请求体：{ customer_name?, customer_phone?, address?, description?, tech_id? }
 */
router.put('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { customer_name, customer_phone, address, description, tech_id } = req.body;

  // 检查工单是否存在
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!order) {
    return fail(res, 404, '工单不存在', 404);
  }

  // 构建动态更新字段
  const updateFields = [];
  const updateParams = [];

  if (customer_name !== undefined && customer_name !== null) {
    if (!customer_name.trim()) {
      return fail(res, 400, '客户姓名不能为空', 400);
    }
    updateFields.push('customer_name = ?');
    updateParams.push(customer_name.trim());
  }

  if (customer_phone !== undefined && customer_phone !== null) {
    updateFields.push('customer_phone = ?');
    updateParams.push(customer_phone.trim());
  }

  if (address !== undefined && address !== null) {
    if (!address.trim()) {
      return fail(res, 400, '维修地址不能为空', 400);
    }
    updateFields.push('address = ?');
    updateParams.push(address.trim());
  }

  if (description !== undefined && description !== null) {
    if (!description.trim()) {
      return fail(res, 400, '问题描述不能为空', 400);
    }
    updateFields.push('description = ?');
    updateParams.push(description.trim());
  }

  if (tech_id !== undefined) {
    if (tech_id !== null) {
      // 验证技师存在
      const tech = db.prepare('SELECT id, role FROM users WHERE id = ?').get(tech_id);
      if (!tech) {
        return fail(res, 400, '指定的技师不存在', 400);
      }
      if (tech.role !== 'tech') {
        return fail(res, 400, '指定的用户不是技师角色', 400);
      }
    }
    updateFields.push('tech_id = ?');
    updateParams.push(tech_id);
  }

  if (updateFields.length === 0) {
    return fail(res, 400, '没有需要更新的字段', 400);
  }

  // 更新 updated_at
  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  // 执行更新
  const updateSql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
  updateParams.push(id);

  db.prepare(updateSql).run(...updateParams);

  return success(res, { id: parseInt(id) });
});

/**
 * DELETE /api/orders/:id
 * 删除工单
 *
 * 业务规则：
 * - 仅 admin 可删除
 * - 工单不存在返回 404
 * - 关联备注通过 ON DELETE CASCADE 自动删除
 */
router.delete('/:id', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();
  const { id } = req.params;

  // 检查工单是否存在
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!order) {
    return fail(res, 404, '工单不存在', 404);
  }

  // 删除工单（关联备注通过 CASCADE 自动删除）
  db.prepare('DELETE FROM orders WHERE id = ?').run(id);

  return success(res, null);
});

module.exports = router;
