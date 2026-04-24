/**
 * 工单编号生成工具
 *
 * 格式：WO + 日期(8位) + 序号(3位)
 * 示例：WO20260423001
 *
 * 实现逻辑：
 * - 查询数据库中当天已有的最大编号
 * - 在最大序号基础上 +1 生成新编号
 * - 如果当天无工单，从 001 开始
 */

const { getDb } = require('./db');

/**
 * 生成工单编号
 * 格式：WO + YYYYMMDD + 3位序号
 *
 * @returns {string} 工单编号，如 "WO20260423001"
 */
function generateOrderNo() {
  const db = getDb();

  // 获取当前日期，格式 YYYYMMDD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 工单编号前缀：WO + 日期
  const prefix = `WO${dateStr}`;

  // 查询当天已有的最大编号
  // 使用 LIKE 匹配当天前缀，取最大序号
  const result = db.prepare(
    "SELECT MAX(order_no) as max_no FROM orders WHERE order_no LIKE ?"
  ).get(`${prefix}%`);

  let seq = 1;

  if (result && result.max_no) {
    // 从最大编号中提取序号部分（最后3位）
    const maxSeq = parseInt(result.max_no.slice(-3), 10);
    seq = maxSeq + 1;
  }

  // 格式化序号为3位，不足前补零
  const seqStr = String(seq).padStart(3, '0');

  return `${prefix}${seqStr}`;
}

module.exports = { generateOrderNo };
