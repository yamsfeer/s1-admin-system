/**
 * 维修派单管家 - 演示数据生成脚本（增强版）
 * 生成逼真的工单、客户、备注数据，覆盖30天，15位技师
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'app.db');

// ========== 数据模板 ==========

const firstNames = ['李', '王', '张', '刘', '陈', '赵', '孙', '周', '吴', '郑', '钱', '冯', '杨', '朱', '马', '郭', '林', '何', '罗', '梁', '谢', '宋', '唐', '许', '韩'];
const lastNames = ['阿姨', '大爷', '叔叔', '姐', '哥', '女士', '先生', '奶奶', '爷爷', '师傅', '老师', '医生', '大姐', '大哥', '小姐'];

const complexes = [
  '阳光小区', '恒大花园', '万科城', '锦绣家园', '绿地国际',
  '中海名都', '保利心语', '碧桂园', '幸福里', '龙湖湾',
  '金茂府', '融创壹号院', '龙湖天街', '华润悦府', '金地格林',
  '招商蛇口', '中铁建', '绿城玫瑰园', '仁恒滨江', '星河湾'
];

const descriptions = [
  { text: '厨房水管漏水', type: '水管维修', fee: [80, 350] },
  { text: '卫生间马桶堵塞', type: '疏通', fee: [80, 200] },
  { text: '客厅电路跳闸', type: '电路维修', fee: [100, 300] },
  { text: '主卧空调不制冷', type: '空调维修', fee: [150, 500] },
  { text: '阳台门窗关不紧', type: '门窗维修', fee: [60, 200] },
  { text: '次卧墙面渗水', type: '防水维修', fee: [200, 800] },
  { text: '厨房下水道堵塞', type: '疏通', fee: [80, 250] },
  { text: '卫生间热水器不出热水', type: '热水器维修', fee: [120, 400] },
  { text: '客厅插座没电', type: '电路维修', fee: [60, 180] },
  { text: '卧室灯闪得厉害', type: '灯具维修', fee: [50, 150] },
  { text: '卫生间水管破裂喷水', type: '水管维修', fee: [150, 450] },
  { text: '厨房龙头滴水', type: '龙头维修', fee: [50, 200] },
  { text: '煤气灶打不着火', type: '灶具维修', fee: [80, 250] },
  { text: '油烟机开了没吸力', type: '油烟机维修', fee: [100, 350] },
  { text: '客厅地板泡水', type: '地板维修', fee: [300, 1200] },
  { text: '浴室花洒出水小', type: '卫浴维修', fee: [50, 200] },
  { text: '大门门锁坏了', type: '门锁维修', fee: [80, 300] },
  { text: '窗户玻璃裂了', type: '门窗维修', fee: [200, 600] },
  { text: '客厅天花板渗水', type: '防水维修', fee: [250, 900] },
  { text: '厨房水槽下面漏水', type: '水管维修', fee: [80, 250] },
  { text: '卫生间地漏返臭', type: '疏通', fee: [100, 280] },
  { text: '阳台晾衣架掉了', type: '五金维修', fee: [80, 200] },
  { text: '厨房瓷砖脱落', type: '瓷砖维修', fee: [150, 500] },
  { text: '卫生间镜子碎了', type: '玻璃维修', fee: [100, 300] },
  { text: '客厅吊灯不亮', type: '灯具维修', fee: [80, 250] },
  { text: '主卧窗户关不上', type: '门窗维修', fee: [60, 200] },
  { text: '厨房台面裂缝', type: '台面维修', fee: [300, 800] },
  { text: '卫生间排风扇不转', type: '电路维修', fee: [80, 220] },
  { text: '客厅网线不通', type: '弱电维修', fee: [100, 300] },
  { text: '阳台排水管堵了', type: '疏通', fee: [120, 350] }
];

const remarks = [
  '客户说下午3点以后在家',
  '角阀老化，需要更换新的',
  '已跟客户确认费用，客户同意',
  '需要带密封胶过来',
  '客户说明天上午在家等',
  '拍照留档，发给客户确认',
  '顺便帮客户检查了其他位置',
  '材料费85元，人工费120元',
  '客户要求开发票',
  '老客户，费用打个折',
  '已经完工，等客户验收',
  '客户不在家，电话沟通了情况',
  '需要用梯子，阳台比较高',
  '配件需要定制，约下周再来',
  '跟物业联系过，可以进弱电井',
  '客户提到隔壁邻居也有同样问题',
  '发现是楼上漏水导致的',
  '客户满意，给了好评',
  '建议客户定期做管道保养',
  '加急单，客户说很急'
];

// 15个技师
const TECHNICIANS = [
  { username: 'zhangsan', real_name: '张师傅', phone: '13900002222' },
  { username: 'lisi', real_name: '李师傅', phone: '13900003333' },
  { username: 'wangwu', real_name: '王师傅', phone: '13900004444' },
  { username: 'zhaoliu', real_name: '赵师傅', phone: '13900005555' },
  { username: 'liuqi', real_name: '刘师傅', phone: '13900006666' },
  { username: 'chenba', real_name: '陈师傅', phone: '13900007777' },
  { username: 'yangjiu', real_name: '杨师傅', phone: '13900008888' },
  { username: 'huangshi', real_name: '黄师傅', phone: '13900009999' },
  { username: 'zhouyi', real_name: '周师傅', phone: '13900001010' },
  { username: 'wuer', real_name: '吴师傅', phone: '13900002020' },
  { username: 'xusan', real_name: '徐师傅', phone: '13900003030' },
  { username: 'suns', real_name: '孙师傅', phone: '13900004040' },
  { username: 'mawu', real_name: '马师傅', phone: '13900005050' },
  { username: 'zhulin', real_name: '朱师傅', phone: '13900006060' },
  { username: 'hushi', real_name: '胡师傅', phone: '13900007070' }
];

// ========== 辅助函数 ==========

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max) { return Math.round((min + Math.random() * (max - min)) * 10) / 10; }

function randomPhone() {
  const prefixes = ['138', '139', '136', '137', '135', '150', '158', '159', '186', '188', '130', '132', '155', '156', '189'];
  return randomPick(prefixes) + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

function formatOrderNo(date, seq) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `WO${y}${m}${d}${String(seq).padStart(3, '0')}`;
}

// ========== 生成数据 ==========

function generateData() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('[种子] 开始生成演示数据（增强版）...');

  // ---- 1. 清空旧数据（保留 admin）----
  db.exec('DELETE FROM order_remarks');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM customers');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('orders', 'customers', 'order_remarks')");

  // 删除旧的 tech 用户（保留 admin）
  db.exec("DELETE FROM users WHERE role = 'tech'");
  console.log('[种子] 已清空旧数据');

  // ---- 2. 插入15个技师 ----
  const insertUser = db.prepare(`
    INSERT INTO users (username, password, real_name, role, phone)
    VALUES (@username, @password, @real_name, 'tech', @phone)
  `);

  const saltRounds = 10;
  const techPassword = bcrypt.hashSync('123456', saltRounds);

  for (const tech of TECHNICIANS) {
    insertUser.run({
      username: tech.username,
      password: techPassword,
      real_name: tech.real_name,
      phone: tech.phone
    });
  }

  // 获取所有技师ID
  const techRows = db.prepare("SELECT id FROM users WHERE role = 'tech' ORDER BY id").all();
  const techIds = techRows.map(r => r.id);
  const allCreatorIds = [1, ...techIds]; // admin + all techs
  console.log(`[种子] 生成 ${techIds.length} 位技师`);

  // ---- 3. 生成客户（30位）----
  const customerInsert = db.prepare(`
    INSERT INTO customers (name, phone, address, remark, created_at)
    VALUES (@name, @phone, @address, @remark, @created_at)
  `);

  const customers = [];
  const usedNames = new Set();

  for (let i = 0; i < 30; i++) {
    let name;
    do {
      name = randomPick(firstNames) + randomPick(lastNames);
    } while (usedNames.has(name));
    usedNames.add(name);

    const phone = randomPhone();
    const complex = complexes[i % complexes.length];
    const building = randomRange(1, 20);
    const unit = randomRange(1, 4);
    const floor = randomRange(1, 30);
    const room = String(randomRange(1, 4)).padStart(2, '0');
    const address = `${complex}${building}栋${unit}单元${floor}${room}`;
    const remark = Math.random() > 0.6 ? randomPick(remarks) : '';
    const daysAgo = randomRange(1, 45);
    const createdAt = formatDate(new Date(Date.now() - daysAgo * 86400000));

    customerInsert.run({ name, phone, address, remark, created_at: createdAt });
    customers.push({ name, phone, address });
  }
  console.log(`[种子] 生成 ${customers.length} 位客户`);

  // ---- 4. 生成工单（约200条，覆盖最近30天）----
  const orderInsert = db.prepare(`
    INSERT INTO orders (order_no, customer_name, customer_phone, address, description, status, tech_id, fee, settled_at, created_at, updated_at)
    VALUES (@order_no, @customer_name, @customer_phone, @address, @description, @status, @tech_id, @fee, @settled_at, @created_at, @updated_at)
  `);

  let totalOrders = 0;
  const today = new Date('2026-04-24T00:00:00');

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const baseDate = new Date(today);
    baseDate.setDate(baseDate.getDate() - dayOffset);
    const dayOfWeek = baseDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let dailyCount = randomRange(3, isWeekend ? 10 : 7);
    if (dayOffset <= 2) dailyCount += randomRange(2, 4);
    if (dayOffset >= 20) dailyCount = Math.max(2, dailyCount - 2);

    let seq = 1;

    for (let i = 0; i < dailyCount; i++) {
      const customer = randomPick(customers);
      const descTemplate = randomPick(descriptions);
      const orderNo = formatOrderNo(baseDate, seq++);

      const hour = randomRange(7, 21);
      const minute = randomRange(0, 59);
      const createdAt = new Date(baseDate);
      createdAt.setHours(hour, minute, randomRange(0, 59));

      let status;
      const ageRatio = dayOffset / 30;
      const rand = Math.random();
      if (ageRatio > 0.8) {
        status = rand < 0.85 ? 'settled' : (rand < 0.95 ? 'done' : 'working');
      } else if (ageRatio > 0.5) {
        status = rand < 0.7 ? 'settled' : (rand < 0.9 ? 'done' : 'working');
      } else if (ageRatio > 0.2) {
        status = rand < 0.5 ? 'settled' : (rand < 0.75 ? 'done' : (rand < 0.9 ? 'working' : 'pending'));
      } else {
        status = rand < 0.3 ? 'settled' : (rand < 0.55 ? 'done' : (rand < 0.8 ? 'working' : 'pending'));
      }

      let fee = 0;
      if (status === 'done' || status === 'settled') {
        const [minFee, maxFee] = descTemplate.fee;
        fee = randomFloat(minFee, maxFee);
      }

      let updatedAt = new Date(createdAt);
      let settledAt = null;

      if (status === 'working') {
        updatedAt = new Date(createdAt.getTime() + randomRange(1, 4) * 3600000);
      } else if (status === 'done') {
        updatedAt = new Date(createdAt.getTime() + randomRange(3, 24) * 3600000);
      } else if (status === 'settled') {
        const doneTime = new Date(createdAt.getTime() + randomRange(3, 48) * 3600000);
        updatedAt = new Date(doneTime.getTime() + randomRange(1, 72) * 3600000);
        settledAt = formatDate(updatedAt);
      }

      const techId = status === 'pending' ? null : randomPick(techIds);

      orderInsert.run({
        order_no: orderNo,
        customer_name: customer.name,
        customer_phone: customer.phone,
        address: customer.address,
        description: descTemplate.text,
        status,
        tech_id: techId,
        fee,
        settled_at: settledAt,
        created_at: formatDate(createdAt),
        updated_at: formatDate(updatedAt)
      });

      totalOrders++;
    }
  }

  console.log(`[种子] 生成 ${totalOrders} 条工单`);

  // ---- 5. 生成备注 ----
  const remarkInsert = db.prepare(`
    INSERT INTO order_remarks (order_id, content, created_by, created_at)
    VALUES (@order_id, @content, @created_by, @created_at)
  `);

  const allOrders = db.prepare('SELECT id, created_at, status FROM orders').all();
  let totalRemarks = 0;

  allOrders.forEach(order => {
    if (Math.random() > 0.35) {
      const remarkCount = randomRange(1, 4);
      const orderCreated = new Date(order.created_at);

      for (let i = 0; i < remarkCount; i++) {
        const remarkTime = new Date(orderCreated.getTime() + randomRange(1, 36) * 3600000);
        remarkInsert.run({
          order_id: order.id,
          content: randomPick(remarks),
          created_by: randomPick(allCreatorIds),
          created_at: formatDate(remarkTime)
        });
        totalRemarks++;
      }
    }
  });

  console.log(`[种子] 生成 ${totalRemarks} 条备注`);

  // ---- 6. 统计汇总 ----
  const stats = db.prepare(`SELECT status, COUNT(*) as cnt FROM orders GROUP BY status`).all();
  console.log('\n[种子] ====== 工单状态汇总 ======');
  stats.forEach(s => console.log(`  ${s.status}: ${s.cnt} 条`));

  const trend = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as cnt FROM orders
    GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7
  `).all();
  console.log('\n[种子] ====== 近7天工单趋势 ======');
  trend.forEach(t => console.log(`  ${t.date}: ${t.cnt} 条`));

  const totalFee = db.prepare(`SELECT COALESCE(SUM(fee), 0) as total FROM orders WHERE status = 'settled'`).get();
  console.log(`\n[种子] 已结算总额: ¥${totalFee.total.toFixed(2)}`);

  db.close();
  console.log('\n[种子] 演示数据生成完成！');
}

generateData();
