import request from './request';

/**
 * 获取看板统计数据
 * 返回 summary（各状态计数）和 trend（近7天工单趋势）
 */
export function getDashboardStats() {
  return request.get('/dashboard/stats');
}
