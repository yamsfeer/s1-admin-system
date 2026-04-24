/**
 * 看板统计路由模块（增强版）
 *
 * 职责：
 * - GET /api/dashboard/stats 获取看板统计数据（仅 admin 可访问）
 *   - summary: 各状态工单计数
 *   - trend: 近7天每日工单数量
 *   - revenue: 收入统计（今日/本月/待收）
 *   - techRanking: 技师工作量排行
 *   - recentOrders: 最新工单动态
 *   - typeRanking: 热门维修类型排行
 */

const express = require('express');
const { getDb } = require('../utils/db');
const { success, fail } = require('../utils/response');
const { authRequired, roleCheck } = require('../middleware/auth');

const router = express.Router();

// 状态颜色映射
const STATUS_COLORS = {
  pending: '#F56C6C',
  working: '#E6A23C',
  done: '#67C23A',
  settled: '#909399'
};

const STATUS_LABELS = {
  pending: '待派单',
  working: '进行中',
  done: '已完工',
  settled: '已结算'
};

/**
 * GET /api/dashboard/stats
 * 获取看板完整统计数据
 */
router.get('/stats', authRequired, roleCheck('admin'), (req, res) => {
  const db = getDb();

  // ---- 1. 各状态工单计数（summary） ----
  const statusRows = db.prepare(`
    SELECT status, COUNT(*) AS count FROM orders GROUP BY status
  `).all();

  const summary = { pending: 0, working: 0, done: 0, settled: 0 };
  for (const row of statusRows) {
    if (summary.hasOwnProperty(row.status)) {
      summary[row.status] = row.count;
    }
  }

  // ---- 2. 近7天每日工单数量（trend） ----
  const trend = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trend.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  const startDate = trend[0].date;
  const endDate = trend[6].date;

  const trendRows = db.prepare(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM orders
    WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
    GROUP BY DATE(created_at)
  `).all(startDate, endDate);

  const trendMap = new Map();
  for (const row of trendRows) trendMap.set(row.date, row.count);
  for (const item of trend) {
    if (trendMap.has(item.date)) item.count = trendMap.get(item.date);
  }

  // ---- 3. 收入统计（revenue） ----
  const todayStr = today.toISOString().slice(0, 10);
  const todayRevenue = db.prepare(`
    SELECT COALESCE(SUM(fee), 0) AS total FROM orders
    WHERE status = 'settled' AND DATE(settled_at) = ?
  `).get(todayStr);

  const monthStart = todayStr.slice(0, 7) + '-01';
  const monthRevenue = db.prepare(`
    SELECT COALESCE(SUM(fee), 0) AS total FROM orders
    WHERE status = 'settled' AND DATE(settled_at) >= ?
  `).get(monthStart);

  const pendingRevenue = db.prepare(`
    SELECT COALESCE(SUM(fee), 0) AS total FROM orders WHERE status = 'done'
  `).get();

  const totalRevenue = db.prepare(`
    SELECT COALESCE(SUM(fee), 0) AS total FROM orders WHERE status = 'settled'
  `).get();

  const revenue = {
    today: todayRevenue.total || 0,
    month: monthRevenue.total || 0,
    pending: pendingRevenue.total || 0,
    total: totalRevenue.total || 0
  };

  // ---- 4. 技师工作量排行（techRanking） ----
  const techRanking = db.prepare(`
    SELECT
      u.id,
      u.real_name AS name,
      COUNT(CASE WHEN o.status = 'settled' THEN 1 END) AS settled_count,
      COALESCE(SUM(CASE WHEN o.status = 'settled' THEN o.fee ELSE 0 END), 0) AS settled_amount,
      COUNT(CASE WHEN o.status = 'working' THEN 1 END) AS working_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.tech_id
    WHERE u.role = 'tech'
    GROUP BY u.id, u.real_name
    ORDER BY settled_count DESC
  `).all();

  // ---- 5. 最近工单动态（recentOrders） ----
  const recentOrders = db.prepare(`
    SELECT
      o.id,
      o.order_no,
      o.customer_name,
      o.description,
      o.status,
      o.fee,
      o.created_at,
      u.real_name AS tech_name
    FROM orders o
    LEFT JOIN users u ON o.tech_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 8
  `).all();

  for (const order of recentOrders) {
    order.status_label = STATUS_LABELS[order.status] || order.status;
    order.status_color = STATUS_COLORS[order.status] || '#909399';
  }

  // ---- 6. 热门维修类型排行（typeRanking） ----
  // 基于关键词简单分类
  const allDescriptions = db.prepare(`
    SELECT description FROM orders
  `).all();

  const typeKeywords = [
    { keyword: '水管', name: '水管维修' },
    { keyword: '堵塞', name: '疏通服务' },
    { keyword: '电路', name: '电路维修' },
    { keyword: '空调', name: '空调维修' },
    { keyword: '门窗', name: '门窗维修' },
    { keyword: '渗水', name: '防水维修' },
    { keyword: '热水器', name: '热水器维修' },
    { keyword: '灯', name: '灯具维修' },
    { keyword: '龙头', name: '龙头维修' },
    { keyword: '煤气', name: '灶具维修' },
    { keyword: '油烟', name: '油烟机维修' },
    { keyword: '地板', name: '地板维修' },
    { keyword: '花洒', name: '卫浴维修' },
    { keyword: '门锁', name: '门锁维修' },
    { keyword: '玻璃', name: '玻璃维修' },
    { keyword: '瓷砖', name: '瓷砖维修' },
    { keyword: '台面', name: '台面维修' },
    { keyword: '网线', name: '弱电维修' }
  ];

  const typeCounts = {};
  for (const type of typeKeywords) {
    typeCounts[type.name] = 0;
  }
  typeCounts['其他维修'] = 0;

  for (const row of allDescriptions) {
    let matched = false;
    for (const type of typeKeywords) {
      if (row.description.includes(type.keyword)) {
        typeCounts[type.name]++;
        matched = true;
        break;
      }
    }
    if (!matched) typeCounts['其他维修']++;
  }

  const typeRanking = Object.entries(typeCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return success(res, {
    summary,
    trend,
    revenue,
    techRanking,
    recentOrders,
    typeRanking
  });
});

module.exports = router;
