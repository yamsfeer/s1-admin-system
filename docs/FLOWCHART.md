# 业务流程图

## 1. 核心业务流程：报修→派单→完工→结算

```
业主报修电话
     |
     v
[派单员录入工单] ----------> [工单状态: 待派单]
     |                              |
     |                              v
     |                     [选择技师派单]
     |                              |
     |                              v
     |                     [工单状态: 进行中]
     |                              |
     |                    +---------+---------+
     |                    |                   |
     |                    v                   v
     |              [技师完工]           [需要重新派单]
     |                    |                   |
     |                    v                   |
     |           [录入维修费用]               |
     |                    |                   |
     |                    v                   |
     |           [工单状态: 已完工]           |
     |                    |                   |
     |                    v                   |
     |           [确认结款]                   |
     |                    |                   |
     |                    v                   v
     |           [工单状态: 已结算]  <---[回到待派单]
     |                    |
     |                    v
     |           [月底导出Excel对账]
     |                    |
     v                    v
[流程结束] <-------------+
```

---

## 2. 登录与权限流程

```
[用户访问系统]
       |
       v
 [是否有token?]
       |
  +----+----+
  |         |
  v         v
 [有]     [无]
  |         |
  v         v
[验证token] [跳转登录页]
  |              |
  +----+---+     v
  |    |   |  [输入账号密码]
  v    v   v     |
[有效][过期][无效] v
  |    |    |  [调用登录API]
  |    |    |     |
  |    v    v  +--+--+
  |  [跳转登录页] |   |
  |             v   v
  |          [成功] [失败]
  |             |    |
  |             v    v
  |         [存token] [显示错误]
  |             |
  v             v
[根据角色放行]
       |
  +----+----+
  |         |
  v         v
[admin]  [tech]
  |         |
  v         v
[全量功能] [受限功能]
  |         |
  v         v
[进入数据看板]
```

---

## 3. 数据看板数据流

```
[用户打开Dashboard]
        |
        v
[GET /api/dashboard/stats]
        |
        v
[后端聚合查询]
        |
  +-----+-----+
  |           |
  v           v
[各状态计数] [近7日趋势]
  |           |
  v           v
[summary]  [trend数组]
  |           |
  v           v
[4个统计卡片] [折线图]
  |
  v
[饼图(由summary计算比例)]
```

### SQL 聚合逻辑

**summary 查询**：
```sql
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status
```

**trend 查询**：
```sql
SELECT DATE(created_at) as date, COUNT(*) as count
FROM orders
WHERE created_at >= date('now', '-6 days')
GROUP BY DATE(created_at)
ORDER BY date
```

---

## 4. Excel 导出流程

```
[用户点击"导出Excel"]
        |
        v
[携带筛选条件]
GET /api/orders/export?status=x&start_date=x&end_date=x
        |
        v
[后端查询符合条件的工单]
        |
        v
[exceljs 创建 Workbook]
        |
        v
[添加 Worksheet]
        |
        v
[写入表头(加粗+浅蓝背景)]
        |
        v
[逐行写入数据]
  - 状态字段映射为中文
  - 费用保留2位小数
        |
        v
[设置列宽自适应]
        |
        v
[写入 Response 流]
  - Content-Type: xlsx
  - Content-Disposition: attachment
        |
        v
[浏览器下载文件]
```

---

## 5. 技师创建与工单关联

```
[管理员新增技师]
        |
        v
[POST /api/technicians]
  - 创建 users 记录, role='tech'
        |
        v
[技师可登录系统]
        |
        v
[创建工单时选择技师]
        |
        v
[orders.tech_id = 技师id]
        |
        v
[技师登录后只能看到 tech_id=自己id 的工单]
        |
        v
[GET /api/technicians 返回 active_orders]
  - COUNT(*) WHERE tech_id=x AND status='working'
```
