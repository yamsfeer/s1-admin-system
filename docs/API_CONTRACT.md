# API 契约

## 基础信息
- Base URL: `/api`
- 认证方式: Bearer Token (JWT)
- 统一响应格式: `{ code: 0, data: {}, message: "success" }`
- 错误码约定: 0=成功, 401=未认证, 403=无权限, 400=参数错误, 404=资源不存在, 500=服务器错误

## 认证模块

### POST /api/auth/login
登录系统

**鉴权**：无需

**请求体**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应体**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "real_name": "王姐",
      "role": "admin"
    }
  }
}
```

**错误码**
- 400: 用户名或密码为空
- 401: 用户名或密码错误

---

### GET /api/auth/me
获取当前登录用户信息

**鉴权**：需登录

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "real_name": "王姐",
    "role": "admin",
    "phone": "13800001111"
  }
}
```

## 工单模块

### POST /api/orders
创建工单

**鉴权**：需登录（admin）

**请求体**
```json
{
  "customer_name": "李阿姨",
  "customer_phone": "13800001111",
  "address": "阳光小区3栋502",
  "description": "厨房水管漏水",
  "tech_id": 2
}
```

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "WO20260423001",
    "status": "working"
  }
}
```

**业务规则**
- 如果指定了 tech_id，状态自动设为 working；否则为 pending
- order_no 自动生成，格式：WO + 日期(8位) + 序号(3位)

**错误码**
- 400: 必填字段缺失（customer_name, address, description）
- 403: 非管理员无权创建

---

### GET /api/orders
获取工单列表（分页+筛选+搜索）

**鉴权**：需登录

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| size | number | 否 | 每页条数，默认 10 |
| status | string | 否 | 状态筛选：pending/working/done/settled |
| keyword | string | 否 | 关键词搜索（客户名/地址/描述） |
| start_date | string | 否 | 开始日期，格式 YYYY-MM-DD |
| end_date | string | 否 | 结束日期，格式 YYYY-MM-DD |

**响应体**
```json
{
  "code": 0,
  "data": {
    "total": 35,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "order_no": "WO20260423001",
        "customer_name": "李阿姨",
        "customer_phone": "13800001111",
        "address": "阳光小区3栋502",
        "description": "厨房水管漏水",
        "status": "working",
        "tech_id": 2,
        "tech_name": "张师傅",
        "fee": 0,
        "created_at": "2026-04-23 09:30:00",
        "updated_at": "2026-04-23 09:30:00"
      }
    ]
  }
}
```

**权限规则**
- admin 角色返回所有工单
- tech 角色只返回 tech_id 等于自己的工单

---

### GET /api/orders/:id
获取工单详情

**鉴权**：需登录

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "WO20260423001",
    "customer_name": "李阿姨",
    "customer_phone": "13800001111",
    "address": "阳光小区3栋502",
    "description": "厨房水管漏水",
    "status": "working",
    "tech_id": 2,
    "tech_name": "张师傅",
    "fee": 0,
    "settled_at": null,
    "created_at": "2026-04-23 09:30:00",
    "updated_at": "2026-04-23 09:30:00",
    "remarks": [
      {
        "id": 1,
        "content": "需要更换角阀，已拍照留档",
        "created_by": 1,
        "creator_name": "王姐",
        "created_at": "2026-04-23 10:00:00"
      }
    ]
  }
}
```

---

### PUT /api/orders/:id/status
更新工单状态

**鉴权**：需登录

**请求体**
```json
{
  "status": "done",
  "fee": 150.00
}
```

**状态流转规则**
| 当前状态 | 允许转换到 | 需要字段 |
|----------|-----------|----------|
| pending | working | tech_id（若未指定） |
| working | done | fee（可选） |
| working | pending | 无（重新派单） |
| done | settled | fee（必填） |

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "status": "done",
    "fee": 150.00
  }
}
```

**错误码**
- 400: 非法的状态流转
- 403: 非管理员无权结算

---

### PUT /api/orders/:id
更新工单基本信息

**鉴权**：需登录（admin）

**请求体**
```json
{
  "customer_name": "李阿姨",
  "customer_phone": "13800001111",
  "address": "阳光小区3栋502",
  "description": "厨房水管漏水（更新）",
  "tech_id": 3
}
```

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "WO20260423001"
  }
}
```

---

### POST /api/orders/:id/remarks
添加工单备注

**鉴权**：需登录

**请求体**
```json
{
  "content": "需要更换角阀，已拍照留档"
}
```

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "content": "需要更换角阀，已拍照留档",
    "created_by": 1,
    "created_at": "2026-04-23 10:00:00"
  }
}
```

**错误码**
- 400: 备注内容为空

---

### GET /api/orders/export
导出工单 Excel

**鉴权**：需登录（admin）

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| keyword | string | 否 | 关键词搜索 |

**响应**：文件流
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename=orders_YYYYMMDD.xlsx`

**Excel 列定义**
| 列名 | 宽度 | 字段 |
|------|------|------|
| 工单编号 | 18 | order_no |
| 客户姓名 | 12 | customer_name |
| 客户电话 | 15 | customer_phone |
| 维修地址 | 25 | address |
| 问题描述 | 30 | description |
| 工单状态 | 10 | status(中文映射) |
| 指派技师 | 12 | tech_name |
| 维修费用 | 12 | fee |
| 创建时间 | 20 | created_at |
| 结算时间 | 20 | settled_at |

**样式要求**
- 表头行：加粗、浅蓝背景 #D9E1F2
- 费用列：数字格式，保留2位小数
- 列宽自适应

---

### DELETE /api/orders/:id
删除工单

**鉴权**：需登录（admin）

**响应体**
```json
{
  "code": 0,
  "data": null
}
```

**错误码**
- 403: 非管理员无权删除
- 404: 工单不存在

## 看板模块

### GET /api/dashboard/stats
获取看板统计数据

**鉴权**：需登录（admin）

**响应体**
```json
{
  "code": 0,
  "data": {
    "summary": {
      "pending": 5,
      "working": 12,
      "done": 8,
      "settled": 30
    },
    "trend": [
      { "date": "2026-04-17", "count": 6 },
      { "date": "2026-04-18", "count": 3 },
      { "date": "2026-04-19", "count": 8 },
      { "date": "2026-04-20", "count": 5 },
      { "date": "2026-04-21", "count": 7 },
      { "date": "2026-04-22", "count": 4 },
      { "date": "2026-04-23", "count": 9 }
    ]
  }
}
```

**说明**
- summary: 各状态工单数量，用于饼图和统计卡片
- trend: 近7天每日工单数量，用于折线图

## 技师模块

### GET /api/technicians
获取技师列表

**鉴权**：需登录

**响应体**
```json
{
  "code": 0,
  "data": [
    {
      "id": 2,
      "real_name": "张师傅",
      "phone": "13900002222",
      "active_orders": 3
    }
  ]
}
```

**说明**
- active_orders: 该技师当前 status=working 的工单数量

---

### POST /api/technicians
创建技师（注册 + 分配 tech 角色）

**鉴权**：需登录（admin）

**请求体**
```json
{
  "username": "zhangsan",
  "password": "123456",
  "real_name": "张师傅",
  "phone": "13900002222"
}
```

**响应体**
```json
{
  "code": 0,
  "data": {
    "id": 2,
    "username": "zhangsan",
    "real_name": "张师傅",
    "role": "tech"
  }
}
```

---

### PUT /api/technicians/:id
更新技师信息

**鉴权**：需登录（admin）

**请求体**
```json
{
  "real_name": "张师傅",
  "phone": "13900002222"
}
```

---

### DELETE /api/technicians/:id
删除技师

**鉴权**：需登录（admin）

**业务规则**
- 若技师有进行中的工单（active_orders > 0），不允许删除

**错误码**
- 400: 该技师有进行中的工单，无法删除

## 客户模块

### GET /api/customers
获取客户列表

**鉴权**：需登录

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词（姓名/电话） |

**响应体**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "李阿姨",
      "phone": "13800001111",
      "address": "阳光小区3栋502",
      "remark": "",
      "created_at": "2026-04-23 09:00:00"
    }
  ]
}
```

---

### POST /api/customers
创建客户

**鉴权**：需登录（admin）

**请求体**
```json
{
  "name": "李阿姨",
  "phone": "13800001111",
  "address": "阳光小区3栋502",
  "remark": "经常报修水管问题"
}
```

---

### PUT /api/customers/:id
更新客户信息

**鉴权**：需登录（admin）

---

### DELETE /api/customers/:id
删除客户

**鉴权**：需登录（admin）
