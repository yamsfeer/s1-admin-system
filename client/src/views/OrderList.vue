<template>
  <div class="order-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>工单管理</h2>
      <div class="header-actions">
        <el-button v-if="isAdmin" type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建工单
        </el-button>
        <el-button v-if="isAdmin" type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </div>
    </div>

    <!-- 状态筛选Tab -->
    <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="handleStatusChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待派单" name="pending" />
      <el-tab-pane label="进行中" name="working" />
      <el-tab-pane label="已完工" name="done" />
      <el-tab-pane label="已结算" name="settled" />
    </el-tabs>

    <!-- 搜索框 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索客户姓名、维修地址、问题描述"
        clearable
        style="width: 400px"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 工单表格 -->
    <el-table
      :data="orderList"
      v-loading="loading"
      stripe
      border
      highlight-current-row
      class="order-table"
      :row-class-name="getRowClassName"
      @row-click="handleRowClick"
    >
      <el-table-column prop="order_no" label="工单编号" width="150" />
      <el-table-column prop="customer_name" label="客户姓名" width="120" />
      <el-table-column prop="address" label="维修地址" min-width="180" show-overflow-tooltip />
      <el-table-column prop="description" label="问题描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="tech_name" label="指派技师" width="120">
        <template #default="{ row }">
          <span :class="{ 'text-danger': !row.tech_name }">
            {{ row.tech_name || '未指派' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="维修费用" width="120" align="right">
        <template #default="{ row }">
          {{ row.fee ? `¥${Number(row.fee).toFixed(2)}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { getOrderList, exportOrders } from '@/api/orders';
import StatusTag from '@/components/StatusTag.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isAdmin = computed(() => userStore.isAdmin);

// 状态筛选
const activeStatus = ref(route.query.status || '');

// 搜索关键词
const searchKeyword = ref('');
let searchTimer = null;

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
});

// 数据
const orderList = ref([]);
const loading = ref(false);

// 状态中文映射
const statusLabelMap = {
  pending: '待派单',
  working: '进行中',
  done: '已完工',
  settled: '已结算'
};

// 加载工单列表
async function loadOrders() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    };

    if (activeStatus.value) {
      params.status = activeStatus.value;
    }

    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim();
    }

    const res = await getOrderList(params);
    orderList.value = res.data.list || [];
    pagination.total = res.data.total || 0;
  } catch (error) {
    console.error('加载工单列表失败', error);
  } finally {
    loading.value = false;
  }
}

// 状态切换
function handleStatusChange() {
  pagination.page = 1;
  loadOrders();
}

// 搜索（防抖500ms）
watch(searchKeyword, () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    pagination.page = 1;
    loadOrders();
  }, 500);
});

function handleSearch() {
  pagination.page = 1;
  loadOrders();
}

// 分页变化
function handlePageChange(page) {
  pagination.page = page;
  loadOrders();
}

function handleSizeChange(size) {
  pagination.size = size;
  pagination.page = 1;
  loadOrders();
}

// 点击行跳转详情
function handleRowClick(row) {
  router.push(`/orders/${row.id}`);
}

// 根据状态返回行类名（待派单红色高亮）
function getRowClassName({ row }) {
  if (row.status === 'pending') {
    return 'status-pending';
  }
  return '';
}

// 新建工单
function handleCreate() {
  router.push('/orders/create');
}

// 导出Excel
async function handleExport() {
  try {
    const params = {};
    if (activeStatus.value) {
      params.status = activeStatus.value;
    }
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim();
    }

    const res = await exportOrders(params);

    // 从响应头获取文件名，或使用默认
    const contentDisposition = res.headers['content-disposition'];
    let filename = 'orders.xlsx';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename=([^;]+)/);
      if (match) {
        filename = match[1].trim().replace(/"/g, '');
      }
    }

    // 创建Blob并触发下载
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败', error);
    ElMessage.error('导出失败');
  }
}

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-list-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
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
}

.header-actions {
  display: flex;
  gap: 12px;
}

.status-tabs {
  margin-bottom: 16px;
}

.search-bar {
  margin-bottom: 16px;
}

.order-table {
  margin-bottom: 20px;
}

.order-table :deep(.el-table__row) {
  cursor: pointer;
}

/* 待派单状态红色高亮 */
.order-table :deep(.el-table__row.status-pending) {
  background-color: #fef0f0;
}

.text-danger {
  color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
