<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>数据看板</h2>
      <span class="page-subtitle">{{ todayStr }}</span>
    </div>

    <!-- 收入统计卡片 -->
    <el-row :gutter="20" class="revenue-row">
      <el-col :span="6">
        <RevenueCard :amount="revenue.today" label="今日收入" color="#67C23A" icon="Money"
          :trend="12.5" />
      </el-col>
      <el-col :span="6">
        <RevenueCard :amount="revenue.month" label="本月收入" color="#409EFF" icon="Wallet"
          :trend="8.3" />
      </el-col>
      <el-col :span="6">
        <RevenueCard :amount="revenue.pending" label="待收金额" color="#E6A23C" icon="Timer" />
      </el-col>
      <el-col :span="6">
        <RevenueCard :amount="revenue.total" label="累计收入" color="#909399" icon="TrendCharts" />
      </el-col>
    </el-row>

    <!-- 工单状态统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <StatCard :count="summary.pending" label="待派单" color="#F56C6C" icon="Warning"
          @click="goToOrders('pending')" />
      </el-col>
      <el-col :span="6">
        <StatCard :count="summary.working" label="进行中" color="#E6A23C" icon="Loading"
          @click="goToOrders('working')" />
      </el-col>
      <el-col :span="6">
        <StatCard :count="summary.done" label="已完工" color="#67C23A" icon="CircleCheck"
          @click="goToOrders('done')" />
      </el-col>
      <el-col :span="6">
        <StatCard :count="summary.settled" label="已结算" color="#909399" icon="Wallet"
          @click="goToOrders('settled')" />
      </el-col>
    </el-row>

    <!-- 第一行图表：趋势 + 状态分布 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="14">
        <div class="chart-card">
          <div class="chart-header">
            <h3>近7天工单趋势</h3>
            <span class="chart-subtitle">共 {{ trendTotal }} 单</span>
          </div>
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="chart-card">
          <div class="chart-header">
            <h3>工单状态分布</h3>
          </div>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：技师排行 + 维修类型 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3>技师工作量排行</h3>
            <span class="chart-subtitle">按已结算工单数</span>
          </div>
          <div ref="techChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3>热门维修类型</h3>
            <span class="chart-subtitle">近30天数据</span>
          </div>
          <div ref="typeChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 最新工单动态 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <div class="chart-card recent-orders">
          <div class="chart-header">
            <h3>最新工单动态</h3>
            <el-button type="primary" link @click="goToOrders('')">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <el-table :data="recentOrders" stripe class="recent-table">
            <el-table-column prop="order_no" label="工单编号" width="150" />
            <el-table-column prop="customer_name" label="客户" width="100" />
            <el-table-column prop="description" label="问题描述" min-width="180" show-overflow-tooltip />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="row.status_color" effect="dark" size="small">
                  {{ row.status_label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="tech_name" label="指派技师" width="120">
              <template #default="{ row }">
                {{ row.tech_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="费用" width="100" align="right">
              <template #default="{ row }">
                {{ row.fee ? `¥${Number(row.fee).toFixed(2)}` : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="160" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getDashboardStats } from '@/api/dashboard';
import StatCard from '@/components/StatCard.vue';
import RevenueCard from '@/components/RevenueCard.vue';

const router = useRouter();
const todayStr = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});

// 数据
const summary = reactive({ pending: 0, working: 0, done: 0, settled: 0 });
const revenue = reactive({ today: 0, month: 0, pending: 0, total: 0 });
const trend = ref([]);
const techRanking = ref([]);
const typeRanking = ref([]);
const recentOrders = ref([]);

const trendTotal = computed(() => trend.value.reduce((sum, item) => sum + item.count, 0));

// 图表引用
const lineChartRef = ref(null);
const pieChartRef = ref(null);
const techChartRef = ref(null);
const typeChartRef = ref(null);
let lineChart = null, pieChart = null, techChart = null, typeChart = null;

const STATUS_COLORS = { pending: '#F56C6C', working: '#E6A23C', done: '#67C23A', settled: '#909399' };
const STATUS_LABELS = { pending: '待派单', working: '进行中', done: '已完工', settled: '已结算' };

async function loadStats() {
  try {
    const res = await getDashboardStats();
    const data = res.data;
    if (data.summary) Object.assign(summary, data.summary);
    if (data.revenue) Object.assign(revenue, data.revenue);
    if (data.trend) trend.value = data.trend;
    if (data.techRanking) techRanking.value = data.techRanking;
    if (data.typeRanking) typeRanking.value = data.typeRanking;
    if (data.recentOrders) recentOrders.value = data.recentOrders;
    await nextTick();
    renderAllCharts();
  } catch (error) {
    console.error('加载看板数据失败', error);
  }
}

function renderAllCharts() {
  renderLineChart();
  renderPieChart();
  renderTechChart();
  renderTypeChart();
}

function renderLineChart() {
  if (!lineChartRef.value) return;
  if (!lineChart) lineChart = echarts.init(lineChartRef.value);
  const dates = trend.value.map(item => item.date.slice(5));
  const counts = trend.value.map(item => item.count);
  lineChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>工单：{c} 单' },
    grid: { top: 30, right: 20, bottom: 30, left: 45 },
    xAxis: {
      type: 'category', data: dates, boundaryGap: false,
      axisLabel: { color: '#606266' }, axisLine: { lineStyle: { color: '#DCDFE6' } }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#EBEEF5' } }
    },
    series: [{
      name: '工单数量', type: 'line', data: counts,
      smooth: true, symbol: 'circle', symbolSize: 8,
      lineStyle: { color: '#409EFF', width: 3 },
      itemStyle: { color: '#409EFF', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.02)' }
        ])
      }
    }]
  });
}

function renderPieChart() {
  if (!pieChartRef.value) return;
  if (!pieChart) pieChart = echarts.init(pieChartRef.value);
  const pieData = [
    { name: STATUS_LABELS.pending, value: summary.pending, itemStyle: { color: STATUS_COLORS.pending } },
    { name: STATUS_LABELS.working, value: summary.working, itemStyle: { color: STATUS_COLORS.working } },
    { name: STATUS_LABELS.done, value: summary.done, itemStyle: { color: STATUS_COLORS.done } },
    { name: STATUS_LABELS.settled, value: summary.settled, itemStyle: { color: STATUS_COLORS.settled } }
  ].filter(item => item.value > 0);

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: p => `${p.name}<br/>数量：${p.value}<br/>占比：${p.percent}%`
    },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#606266' } },
    series: [{
      name: '工单状态', type: 'pie', radius: ['38%', '68%'], center: ['38%', '50%'],
      avoidLabelOverlap: true,
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      labelLine: { show: true },
      data: pieData.length > 0 ? pieData : [{ name: '暂无数据', value: 1, itemStyle: { color: '#E4E7ED' } }]
    }]
  });
}

function renderTechChart() {
  if (!techChartRef.value) return;
  if (!techChart) techChart = echarts.init(techChartRef.value);
  const names = techRanking.value.map(t => t.name);
  const counts = techRanking.value.map(t => t.settled_count);
  const amounts = techRanking.value.map(t => t.settled_amount);

  techChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const d = techRanking.value[params[0].dataIndex];
        return `${d.name}<br/>已结算：${d.settled_count} 单<br/>金额：¥${d.settled_amount}<br/>进行中：${d.working_count} 单`;
      }
    },
    grid: { top: 20, right: 30, bottom: 30, left: 80 },
    xAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#EBEEF5' } }
    },
    yAxis: {
      type: 'category', data: names.reverse(),
      axisLabel: { color: '#606266', fontSize: 13 },
      axisLine: { lineStyle: { color: '#DCDFE6' } }
    },
    series: [{
      name: '已结算工单', type: 'bar', data: counts.reverse(),
      barWidth: 24,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#66b1ff' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: { show: true, position: 'right', color: '#606266', fontSize: 12 }
    }]
  });
}

function renderTypeChart() {
  if (!typeChartRef.value) return;
  if (!typeChart) typeChart = echarts.init(typeChartRef.value);
  const data = typeRanking.value.slice(0, 6);

  typeChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 20, right: 20, bottom: 30, left: 100 },
    xAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#EBEEF5' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name).reverse(),
      axisLabel: { color: '#606266', fontSize: 12 },
      axisLine: { lineStyle: { color: '#DCDFE6' } }
    },
    series: [{
      name: '工单数', type: 'bar', data: data.map(d => d.count).reverse(),
      barWidth: 20,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#67C23A' },
          { offset: 1, color: '#95d475' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: { show: true, position: 'right', color: '#606266', fontSize: 12 }
    }]
  });
}

function goToOrders(status) {
  router.push({ path: '/orders', query: status ? { status } : undefined });
}

function handleResize() {
  lineChart?.resize();
  pieChart?.resize();
  techChart?.resize();
  typeChart?.resize();
}

onMounted(() => {
  loadStats();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  [lineChart, pieChart, techChart, typeChart].forEach(c => { if (c) { c.dispose(); } });
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.page-subtitle {
  font-size: 13px;
  color: #909399;
}

.revenue-row {
  margin-bottom: 16px;
}

.stat-row {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.chart-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-subtitle {
  font-size: 12px;
  color: #909399;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.recent-orders {
  padding-bottom: 10px;
}

.recent-table {
  font-size: 13px;
}

.recent-table :deep(.el-table__cell) {
  padding: 8px 0;
}
</style>
