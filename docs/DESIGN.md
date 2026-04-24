# 设计系统

## 颜色方案

| 名称 | 色值 | 用途 |
|------|------|------|
| primary | #409EFF | 主要按钮、导航激活、链接 |
| primary-dark | #337ECC | 主要按钮 hover |
| success | #67C23A | 已完工状态、成功提示 |
| warning | #E6A23C | 进行中状态、待处理提醒 |
| danger | #F56C6C | 待派单状态、错误提示、删除按钮 |
| info | #909399 | 已结算状态、辅助文字 |
| text-primary | #303133 | 主文字 |
| text-regular | #606266 | 常规文字 |
| text-secondary | #909399 | 次要文字 |
| text-placeholder | #C0C4CC | 占位文字 |
| bg-page | #F2F3F5 | 页面背景 |
| bg-card | #FFFFFF | 卡片背景 |
| border | #DCDFE6 | 边框线 |
| border-light | #E4E7ED | 浅边框 |

### 状态颜色映射

| 工单状态 | 颜色 | 色值 | 标签样式 |
|----------|------|------|----------|
| 待派单 (pending) | 红色 | #F56C6C | danger tag，红色高亮提醒 |
| 进行中 (working) | 橙色 | #E6A23C | warning tag |
| 已完工 (done) | 绿色 | #67C23A | success tag |
| 已结算 (settled) | 灰色 | #909399 | info tag |

## 字体规范

- 标题：PingFang SC / Microsoft YaHei, 600 (Semi-Bold)
- 正文：PingFang SC / Microsoft YaHei, 400 (Regular)
- 代码/数字：Monaco / Consolas, 400

### 字号层级

| 场景 | 字号 | 行高 | 字重 |
|------|------|------|------|
| 页面标题 | 20px | 28px | 600 |
| 卡片标题 | 16px | 24px | 600 |
| 正文 | 14px | 22px | 400 |
| 辅助文字 | 12px | 20px | 400 |
| 表格内容 | 14px | - | 400 |

## 间距系统

| 名称 | 值 | 用途 |
|------|------|------|
| xs | 4px | 紧凑间距 |
| sm | 8px | 小间距 |
| md | 16px | 常规间距 |
| lg | 24px | 大间距 |
| xl | 32px | 区块间距 |

## 布局规范

### 整体布局
- 左侧导航栏宽度：220px，折叠后 64px
- 顶部导航栏高度：60px
- 内容区域：左侧导航 + 顶栏 + 主内容区
- 主内容区内边距：24px

### 响应式断点
- 桌面端：≥1200px（主要适配）
- 平板端：768px-1199px（侧边栏可折叠）
- 本项目以桌面端为主，不做移动端适配

## 组件规范

### Button
- Primary: 蓝色背景 #409EFF，白色文字，hover 时 #337ECC
- Danger: 红色背景 #F56C6C，白色文字，用于删除操作
- Default: 白色背景，灰色边框，hover 时边框变蓝
- Text: 无边框无背景，蓝色文字，用于次要操作
- Disabled: 灰色背景 #C0C4CC，不可点击

### Input
- Normal: 白色背景，灰色边框 #DCDFE6，高度 40px
- Focus: 蓝色边框 #409EFF，蓝色阴影
- Error: 红色边框 #F56C6C，下方显示红色错误文字
- Disabled: 灰色背景 #F5F7FA，文字 #C0C4CC

### Table
- 表头：浅灰背景 #FAFAFA，字重 600
- 行高：48px
- 斑马纹：奇数行白色，偶数行 #FAFAFA
- hover 行：#F5F7FA
- 边框：底部 1px #EBEEF5

### Tag (状态标签)
- 待派单：danger 类型，红色
- 进行中：warning 类型，橙色
- 已完工：success 类型，绿色
- 已结算：info 类型，灰色

### Card
- 白色背景，圆角 4px
- 阴影：0 2px 12px rgba(0,0,0,0.06)
- 内边距：20px
- 标题区下方 1px 分隔线

### Dialog
- 圆角 4px
- 标题区：20px 内边距，16px 字号，600 字重
- 内容区：20px 内边距
- 底部按钮区：右对齐，20px 内边距

### 统计卡片（Dashboard 专属）
- 高度 120px
- 左侧数字 + 右侧图标
- 数字：28px 字号，600 字重，对应状态颜色
- 标签：14px 字号，灰色

### ECharts 图表
- 折线图：主色 #409EFF，面积填充 rgba(64,158,255,0.15)
- 饼图：4色分别为 #F56C6C / #E6A23C / #67C23A / #909399 对应4种状态
- 图表区域白色背景，高度 350px
