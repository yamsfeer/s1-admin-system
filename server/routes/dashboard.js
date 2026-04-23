/**
 * 看板统计路由模块
 *
 * 职责：
 * - GET /api/dashboard/stats 获取看板统计数据（仅 admin 可访问）
 *   - summary: 各状态工单计数（pending/working/done/settled）
 *   - trend: 近7天每日工单数量数组
 */

const express = require('express');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { authRequired, roleCheck } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * 获取看板统计数据
 *
 * 鉴权：需登录（admin）
 *
 * 响应体：
 * {
 *   code: 0,
 *   data: {
 *     summary: { pending: 5, working: 12, done: 8, settled: 30 },
 *     trend: [
 *       { date: "2026-04-17", count: 6 },
 *       ...
 *       { date: "2026-04-23", count: 9 }
 *     ]
 *   }
 * }
 *
 * 说明：
 * - summary: 各状态工单数量，用于饼图和统计卡片
 * - trend: 近7天每日工单数量，用于折线图
 * - 趋势数据为空时返回零值（count 全为 0）
 */
router.get('/stats', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();

  // ---- 1. 查询各状态工单计数（summary） ----
  const statusRows = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM orders
    GROUP BY status
  `).all();

  // 将查询结果转换为 { pending: N, working: N, done: N, settled: N } 格式
  const summary = {
    pending: 0,
    working: 0,
    done: 0,
    settled: 0
  };

  for (const row of statusRows) {
    if (summary.hasOwnProperty(row.status)) {
      summary[row.status] = row.count;
    }
  }

  // ---- 2. 查询近7天每日工单数量（trend） ----

  // 生成近7天的日期列表（从6天前到今天）
  const trend = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // 格式化为 YYYY-MM-DD
    const dateStr = d.toISOString().slice(0, 10);
    trend.push({ date: dateStr, count: 0 });
  }

  // 查询近7天内每天的工单创建数量
  // SQLite DATE() 函数截取 created_at 的日期部分
  const startDate = trend[0].date;
  const endDate = trend[6].date;

  const trendRows = db.prepare(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM orders
    WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
    GROUP BY DATE(created_at)
  `).all(startDate, endDate);

  // 将数据库查询结果填充到 trend 数组中
  // 使用 Map 提高查找效率
  const trendMap = new Map();
  for (const row of trendRows) {
    trendMap.set(row.date, row.count);
  }

  for (const item of trend) {
    if (trendMap.has(item.date)) {
      item.count = trendMap.get(item.date);
    }
    // 未匹配到的日期保持 count: 0（零值）
  }

  return success(res, { summary, trend });
});

module.exports = router;
