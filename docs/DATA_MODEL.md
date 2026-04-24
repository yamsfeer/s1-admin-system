# 数据模型

## ER 图（文字描述）

```
User(1) ──< Order(N)    : 指派技师 (tech_id)
Order(1) ──< Remark(N)  : 工单备注
User(1) ──< Remark(N)   : 备注创建人 (created_by)
```

注：Customer 与 Order 为逻辑关联（通过 customer_name 文本匹配），非外键约束，保持灵活。

## 表结构

### users — 用户/技师表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| username | VARCHAR(50) | UNIQUE NOT NULL | 登录账号 |
| password | VARCHAR(255) | NOT NULL | bcrypt 加密密码 |
| real_name | VARCHAR(50) | | 真实姓名 |
| role | VARCHAR(20) | NOT NULL DEFAULT 'tech' | 角色：admin / tech |
| phone | VARCHAR(20) | | 手机号 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**种子数据**
| username | password | real_name | role | phone |
|----------|----------|-----------|------|-------|
| admin | 123456 | 管理员 | admin | 13800000001 |
| zhangsan | 123456 | 张师傅 | tech | 13900002222 |
| lisi | 123456 | 李师傅 | tech | 13900003333 |

---

### orders — 工单表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| order_no | VARCHAR(20) | UNIQUE NOT NULL | 工单编号，格式 WO20260423001 |
| customer_name | VARCHAR(50) | NOT NULL | 客户姓名 |
| customer_phone | VARCHAR(20) | | 客户电话 |
| address | VARCHAR(200) | NOT NULL | 维修地址 |
| description | TEXT | NOT NULL | 问题描述 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | pending/working/done/settled |
| tech_id | INTEGER | FK → users.id | 指派技师（可为空=待派单） |
| fee | DECIMAL(10,2) | DEFAULT 0 | 维修费用 |
| settled_at | DATETIME | | 结算时间 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**状态枚举**
| 值 | 中文名 | 说明 |
|----|--------|------|
| pending | 待派单 | 刚创建，未指派技师 |
| working | 进行中 | 已指派技师，维修中 |
| done | 已完工 | 维修完成，待结算 |
| settled | 已结算 | 费用已结清 |

---

### order_remarks — 工单备注表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| order_id | INTEGER | FK → orders.id, NOT NULL | 关联工单 |
| content | TEXT | NOT NULL | 备注内容 |
| created_by | INTEGER | FK → users.id | 备注创建人 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**级联删除**：删除工单时，关联备注一并删除（ON DELETE CASCADE）

---

### customers — 客户表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| name | VARCHAR(50) | NOT NULL | 客户姓名 |
| phone | VARCHAR(20) | | 电话 |
| address | VARCHAR(200) | | 常用地址 |
| remark | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 索引

| 索引名 | 表 | 字段 | 类型 | 说明 |
|--------|------|------|------|------|
| idx_users_username | users | username | UNIQUE | 登录查询 |
| idx_orders_order_no | orders | order_no | UNIQUE | 工单编号查询 |
| idx_orders_status | orders | status | NORMAL | 按状态筛选 |
| idx_orders_tech_id | orders | tech_id | NORMAL | 技师查自己工单 |
| idx_orders_created_at | orders | created_at | NORMAL | 按时间排序/筛选 |
| idx_order_remarks_order_id | order_remarks | order_id | NORMAL | 查工单备注 |
| idx_customers_name | customers | name | NORMAL | 按姓名搜索 |
| idx_customers_phone | customers | phone | NORMAL | 按电话搜索 |

## 数据库初始化

使用 SQLite，数据库文件路径：`server/data/app.db`

初始化逻辑在 `server/utils/db.js` 中：
1. 启动时检查 data 目录，不存在则创建
2. 执行建表 SQL（IF NOT EXISTS）
3. 检查是否有 admin 用户，无则插入种子数据
4. 启用 WAL 模式提升并发性能
