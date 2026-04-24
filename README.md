# 维修派单管家

> 面向中小维修公司的全流程管理系统 — 报修录入、智能派单、进度追踪、完工结算，一站式闭环。

## 项目背景

中小维修公司常见痛点：微信群里接单 → 电话派工 → 完工对不上账。本系统解决的核心问题：

- **防漏单**：每条报修录入系统，状态全程可追踪
- **防重派**：派单时自动关联技师在单情况，避免重复派工
- **秒对账**：月底一键导出 Excel，结算金额一目了然
- **看数据**：老板随时打开看板，工单趋势、收入统计、技师排名尽在掌握

## 功能概览

| 模块 | 功能 | 说明 |
|------|------|------|
| 工单管理 | 创建 / 派单 / 状态流转 | 待派单 → 进行中 → 已完工 → 已结算 |
| 登录鉴权 | JWT + 角色权限 | 管理员全量操作，技师只看自己工单 |
| 数据看板 | ECharts 折线图 + 饼图 | 近 7 天工单趋势、状态分布、收入统计 |
| 技师管理 | 增删改查 + 在单数 | 派单时下拉选择，显示当前在单量 |
| 完工结算 | 录入费用 / 标记结款 | 已完工 → 已结算，费用必填 |
| 数据导出 | Excel (.xlsx) | 一键导出工单列表 |
| 工单备注 | 追加维修记录 | 支持多次追加，时间线展示 |
| 客户管理 | 常用客户快捷选择 | 报修时自动填充历史客户信息 |

## 技术栈

**前端**

- Vue 3 (Composition API) + Vite 5
- Element Plus 2.6 + Element Plus Icons
- ECharts 5.5 + vue-echarts
- Pinia + Vue Router 4
- Axios

**后端**

- Node.js + Express 4
- better-sqlite3 (SQLite WAL 模式)
- jsonwebtoken + bcryptjs
- exceljs (Excel 导出)
- cors

**部署**

- PM2 进程管理
- Nginx 反向代理

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/yamsfeer/s1-admin-system.git
cd s1-admin-system

# 安装后端依赖
cd server && npm install && cd ..

# 安装前端依赖
cd client && npm install && cd ..
```

### 启动后端

```bash
cd server
npm run dev    # 开发模式，监听端口 8011
```

首次启动会自动创建数据库、建表并插入种子账号。

### 启动前端

```bash
cd client
npm run dev    # 开发模式，监听端口 8012，API 代理到 8011
```

### 访问系统

打开浏览器访问 `http://localhost:8012`

**默认账号：**

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 技师 | zhangsan | 123456 |

## 项目结构

```
s1-admin-system/
├── docs/                        # 设计文档
│   ├── PRD.md                   # 产品需求文档
│   ├── DESIGN.md                # UI/UX 设计系统规范
│   ├── API_CONTRACT.md          # 前后端 API 接口契约
│   ├── DATA_MODEL.md            # 数据库表结构与实体关系
│   ├── UE_FLOW.md               # 用户交互逻辑状态机
│   └── FLOWCHART.md             # 核心业务流程图
├── server/                      # 后端服务
│   ├── app.js                   # Express 入口
│   ├── ecosystem.config.js      # PM2 部署配置
│   ├── seed-demo-data.js        # 演示数据生成脚本
│   ├── data/
│   │   └── app.db               # SQLite 数据库（含演示数据）
│   ├── middleware/
│   │   └── auth.js              # JWT 认证 + 角色权限中间件
│   ├── routes/
│   │   ├── auth.js              # 认证路由
│   │   ├── orders.js            # 工单路由
│   │   ├── technicians.js       # 技师路由
│   │   ├── customers.js         # 客户路由
│   │   └── dashboard.js         # 看板统计路由
│   └── utils/
│       ├── db.js                # 数据库连接 + 建表 + 种子数据
│       ├── response.js          # 统一响应格式
│       └── orderNo.js           # 工单编号生成器
└── client/                      # 前端应用
    ├── vite.config.js           # Vite 配置（端口 + API 代理）
    └── src/
        ├── main.js              # Vue 入口
        ├── App.vue              # 根组件
        ├── router/index.js      # 路由配置 + 守卫
        ├── stores/user.js       # Pinia 用户状态
        ├── api/                 # Axios 封装 + 各模块 API
        ├── layouts/
        │   └── MainLayout.vue   # 侧边栏 + 顶栏布局
        ├── views/               # 页面组件（7 个视图）
        └── components/          # 公共组件
```

## 核心业务流程

```
报修录入 → 待派单 → 派工(选技师) → 进行中 → 完工(填费用) → 已完工 → 结款确认 → 已结算
                ↑                    ↓
                └── 重新派单 ←───────┘
```

## API 概览

所有接口前缀 `/api`，需 Bearer Token 认证（登录接口除外）。

统一响应格式：

```json
{ "code": 0, "data": {}, "message": "success" }
```

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | `POST /api/auth/login` | 登录获取 Token |
| 认证 | `GET /api/auth/me` | 获取当前用户信息 |
| 工单 | `POST /api/orders` | 创建工单 |
| 工单 | `GET /api/orders` | 工单列表（分页 + 筛选） |
| 工单 | `GET /api/orders/export` | 导出 Excel |
| 工单 | `GET /api/orders/:id` | 工单详情 |
| 工单 | `PUT /api/orders/:id/status` | 状态流转 |
| 工单 | `PUT /api/orders/:id` | 更新工单信息 |
| 工单 | `POST /api/orders/:id/remarks` | 添加备注 |
| 看板 | `GET /api/dashboard/stats` | 统计数据 |
| 技师 | `GET /api/technicians` | 技师列表（含在单数） |
| 技师 | `POST /api/technicians` | 创建技师 |
| 客户 | `GET /api/customers` | 客户列表（搜索） |
| 客户 | `POST /api/customers` | 创建客户 |

完整接口文档见 [API 契约](docs/API_CONTRACT.md)。

## 生产部署

### 1. 构建前端

```bash
cd client
npm run build    # 产物输出到 client/dist/
```

### 2. PM2 启动后端

后端 `app.js` 已配置静态文件服务指向 `client/dist`，并包含 SPA 兜底路由。

```bash
cd server
pm2 start ecosystem.config.js
```

### 3. Nginx 反向代理（可选）

如需域名访问和 HTTPS，配置 Nginx 反向代理到后端 8011 端口：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8011;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 演示数据

项目已内置演示数据库 `server/data/app.db`，包含：

- 3 个默认账号（1 管理员 + 2 技师）
- 15 位技师、30 位客户
- 约 200 条工单（覆盖最近 30 天）

如需重新生成演示数据：

```bash
cd server
node seed-demo-data.js
```

## 文档索引

| 文档 | 说明 |
|------|------|
| [PRD](docs/PRD.md) | 完整产品需求文档 |
| [设计系统](docs/DESIGN.md) | UI/UX 规范、颜色、字体、组件 |
| [API 契约](docs/API_CONTRACT.md) | 前后端 API 接口定义 |
| [数据模型](docs/DATA_MODEL.md) | 数据库表结构、实体关系 |
| [UE 流程](docs/UE_FLOW.md) | 用户交互逻辑状态机 |
| [业务流程](docs/FLOWCHART.md) | 核心业务流程图 |

## License

MIT
