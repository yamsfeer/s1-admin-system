<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>数据看板</h2>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :span="6">
        <StatCard
          :count="summary.pending"
          label="待派单"
          color="#F56C6C"
          icon="Warning"
          @click="goToOrders('pending')"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          :count="summary.working"
          label="进行中"
          color="#E6A23C"
          icon="Loading"
          @click="goToOrders('working')"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          :count="summary.done"
          label="已完工"
          color="#67C23A"
          icon="CircleCheck"
          @click="goToOrders('done')"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          :count="summary.settled"
          label="已结算"
          color="#909399"
          icon="Wallet"
          @click="goToOrders('settled')"
        />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="chart-row">
      <!-- 折线图：近7天工单趋势 -->
      <el-col :span="14">
        <div class="chart-card">
          <h3 class="chart-title">近7天工单趋势</h3>
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </el-col>

      <!-- 饼图：工单状态分布 -->
      <el-col :span="10">
        <div class="chart-card">
          <h3 class="chart-title">工单状态分布</h3>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { getDashboardStats } from '@/api/dashboard';
import StatCard from '@/components/StatCard.vue';

const router = useRouter();

// 统计数据
const summary = reactive({
  pending: 0,
  working: 0,
  done: 0,
  settled: 0
});

const trend = ref([]);

// 图表 DOM 引用
const lineChartRef = ref(null);
const pieChartRef = ref(null);

// 图表实例
let lineChart = null;
let pieChart = null;

// 状态颜色映射（与设计系统一致）
const STATUS_COLORS = {
  pending: '#F56C6C',
  working: '#E6A23C',
  done: '#67C23A',
  settled: '#909399'
};

// 状态中文名映射
const STATUS_LABELS = {
  pending: '待派单',
  working: '进行中',
  done: '已完工',
  settled: '已结算'
};

// 加载看板统计数据
async function loadStats() {
  try {
    const res = await getDashboardStats();
    const data = res.data;

    // 更新 summary
    if (data.summary) {
      summary.pending = data.summary.pending || 0;
      summary.working = data.summary.working || 0;
      summary.done = data.summary.done || 0;
      summary.settled = data.summary.settled || 0;
    }

    // 更新 trend
    if (data.trend) {
      trend.value = data.trend;
    }

    // 数据加载后渲染图表
    await nextTick();
    renderLineChart();
    renderPieChart();
  } catch (error) {
    console.error('加载看板数据失败', error);
  }
}

// 渲染折线图（近7天工单趋势，面积填充）
function renderLineChart() {
  if (!lineChartRef.value) return;

  // 初始化或复用图表实例
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value);
  }

  const dates = trend.value.map(item => item.date);
  const counts = trend.value.map(item => item.count);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>工单数量：{c}'
    },
    grid: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 50
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        color: '#606266',
        formatter: function(value) {
          // 仅显示月-日
          const parts = value.split('-');
          return parts[1] + '-' + parts[2];
        }
      },
      axisLine: {
        lineStyle: { color: '#DCDFE6' }
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: '#606266'
      },
      axisLine: {
        lineStyle: { color: '#DCDFE6' }
      },
      splitLine: {
        lineStyle: { color: '#EBEEF5' }
      }
    },
    series: [
      {
        name: '工单数量',
        type: 'line',
        data: counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.25)' },
            { offset: 1, color: 'rgba(64,158,255,0.02)' }
          ])
        }
      }
    ]
  };

  lineChart.setOption(option);
}

// 渲染饼图（工单状态分布）
function renderPieChart() {
  if (!pieChartRef.value) return;

  // 初始化或复用图表实例
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value);
  }

  const pieData = [
    { name: STATUS_LABELS.pending, value: summary.pending, itemStyle: { color: STATUS_COLORS.pending } },
    { name: STATUS_LABELS.working, value: summary.working, itemStyle: { color: STATUS_COLORS.working } },
    { name: STATUS_LABELS.done, value: summary.done, itemStyle: { color: STATUS_COLORS.done } },
    { name: STATUS_LABELS.settled, value: summary.settled, itemStyle: { color: STATUS_COLORS.settled } }
  ].filter(item => item.value > 0);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.name}<br/>数量：${params.value}<br/>占比：${params.percent}%`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData.length > 0 ? pieData : [
          { name: '暂无数据', value: 1, itemStyle: { color: '#E4E7ED' } }
        ]
      }
    ]
  };

  pieChart.setOption(option);
}

// 点击统计卡片跳转对应状态工单列表
function goToOrders(status) {
  router.push({ path: '/orders', query: { status } });
}

// 窗口大小变化时自适应图表
function handleResize() {
  lineChart?.resize();
  pieChart?.resize();
}

onMounted(() => {
  loadStats();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 销毁图表实例，防止内存泄漏
  if (lineChart) {
    lineChart.dispose();
    lineChart = null;
  }
  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

/* 统计卡片区域 */
.stat-cards {
  margin-bottom: 24px;
}

/* 图表行 */
.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 350px;
  width: 100%;
}
</style>
