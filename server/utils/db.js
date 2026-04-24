/**
 * SQLite 数据库连接管理 + 建表初始化
 *
 * 职责：
 * - 管理 SQLite 连接（WAL 模式提升并发性能）
 * - 创建 4 张表（users, orders, order_remarks, customers）
 * - 创建索引
 * - 插入种子数据（admin + 2 个技师）
 * - 启动时自动初始化
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

let db = null;

/**
 * 获取数据库连接实例（单例）
 * @returns {Database} better-sqlite3 实例
 */
function getDb() {
  if (!db) {
    throw new Error('数据库尚未初始化，请先调用 initDb()');
  }
  return db;
}

/**
 * 初始化数据库
 * 1. 确保 data 目录存在
 * 2. 创建连接并启用 WAL 模式
 * 3. 执行建表 SQL（IF NOT EXISTS）
 * 4. 创建索引
 * 5. 插入种子数据（仅首次）
 */
function initDb() {
  // 确保 data 目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 创建数据库连接
  db = new Database(DB_PATH);

  // 启用 WAL 模式提升并发性能
  db.pragma('journal_mode = WAL');

  // 启用外键约束
  db.pragma('foreign_keys = ON');

  console.log('[数据库] SQLite 连接已建立，WAL 模式已启用');
  console.log(`[数据库] 文件路径: ${DB_PATH}`);

  // 创建表
  createTables();

  // 创建索引
  createIndexes();

  // 插入种子数据
  seedData();

  console.log('[数据库] 初始化完成');

  return db;
}

/**
 * 创建 4 张表
 * 使用 IF NOT EXISTS 确保可重复执行
 */
function createTables() {
  const statements = [
    // ---- users 用户/技师表 ----
    `CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   VARCHAR(50) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      real_name  VARCHAR(50),
      role       VARCHAR(20) NOT NULL DEFAULT 'tech',
      phone      VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // ---- orders 工单表 ----
    `CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no       VARCHAR(20) UNIQUE NOT NULL,
      customer_name  VARCHAR(50) NOT NULL,
      customer_phone VARCHAR(20),
      address        VARCHAR(200) NOT NULL,
      description    TEXT NOT NULL,
      status         VARCHAR(20) NOT NULL DEFAULT 'pending',
      tech_id        INTEGER REFERENCES users(id),
      fee            DECIMAL(10,2) DEFAULT 0,
      settled_at     DATETIME,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // ---- order_remarks 工单备注表 ----
    `CREATE TABLE IF NOT EXISTS order_remarks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      content    TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // ---- customers 客户表 ----
    `CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       VARCHAR(50) NOT NULL,
      phone      VARCHAR(20),
      address    VARCHAR(200),
      remark     TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  // 使用事务批量执行建表语句，保证原子性
  const transaction = db.transaction(() => {
    for (const sql of statements) {
      db.exec(sql);
    }
  });

  transaction();
  console.log('[数据库] 4 张表创建完成: users, orders, order_remarks, customers');
}

/**
 * 创建索引
 * 使用 IF NOT EXISTS 确保可重复执行
 */
function createIndexes() {
  const indexes = [
    // users 表索引
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',

    // orders 表索引
    'CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no)',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_orders_tech_id ON orders(tech_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',

    // order_remarks 表索引
    'CREATE INDEX IF NOT EXISTS idx_order_remarks_order_id ON order_remarks(order_id)',

    // customers 表索引
    'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
    'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)'
  ];

  const transaction = db.transaction(() => {
    for (const sql of indexes) {
      db.exec(sql);
    }
  });

  transaction();
  console.log('[数据库] 索引创建完成');
}

/**
 * 插入种子数据
 * 仅在 users 表为空时插入，避免重复
 */
function seedData() {
  // 检查是否已有数据
  const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (count.cnt > 0) {
    console.log('[数据库] 种子数据已存在，跳过插入');
    return;
  }

  // bcrypt 加密密码，saltRounds = 10
  const saltRounds = 10;
  const adminPassword = bcrypt.hashSync('123456', saltRounds);
  const zhangsanPassword = bcrypt.hashSync('123456', saltRounds);
  const lisiPassword = bcrypt.hashSync('123456', saltRounds);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, real_name, role, phone)
    VALUES (@username, @password, @real_name, @role, @phone)
  `);

  const transaction = db.transaction(() => {
    // 管理员账号
    insertUser.run({
      username: 'admin',
      password: adminPassword,
      real_name: '管理员',
      role: 'admin',
      phone: '13800000001'
    });

    // 技师1 - 张师傅
    insertUser.run({
      username: 'zhangsan',
      password: zhangsanPassword,
      real_name: '张师傅',
      role: 'tech',
      phone: '13900002222'
    });

    // 技师2 - 李师傅
    insertUser.run({
      username: 'lisi',
      password: lisiPassword,
      real_name: '李师傅',
      role: 'tech',
      phone: '13900003333'
    });
  });

  transaction();
  console.log('[数据库] 种子数据插入完成: admin(admin), zhangsan(tech), lisi(tech)');
}

/**
 * 关闭数据库连接
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('[数据库] 连接已关闭');
  }
}

module.exports = {
  getDb,
  initDb,
  closeDb
};
