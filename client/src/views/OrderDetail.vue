<template>
  <div class="order-detail-page" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h2>工单详情</h2>
      </div>
      <!-- 状态操作按钮区域 -->
      <div class="header-actions" v-if="order">
        <!-- pending: 显示"指派技师"按钮 -->
        <el-button
          v-if="order.status === 'pending'"
          type="primary"
          @click="showAssignDialog"
        >
          指派技师
        </el-button>

        <!-- working: 显示"标记完工"和"重新派单"按钮 -->
        <el-button
          v-if="order.status === 'working'"
          type="success"
          @click="showCompleteDialog"
        >
          标记完工
        </el-button>
        <el-button
          v-if="order.status === 'working'"
          type="warning"
          @click="handleReassign"
        >
          重新派单
        </el-button>

        <!-- done: 显示"确认结算"按钮 -->
        <el-button
          v-if="order.status === 'done'"
          type="info"
          @click="showSettleDialog"
        >
          确认结算
        </el-button>

        <!-- settled: 无操作按钮 -->
      </div>
    </div>

    <!-- 工单不存在提示 -->
    <el-empty v-if="!loading && !order" description="工单不存在或已被删除">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>

    <!-- 工单基本信息 -->
    <el-card class="info-card" v-if="order">
      <template #header>
        <div class="card-header">
          <span>工单信息</span>
          <StatusTag :status="order.status" />
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号" :span="1">
          {{ order.order_no }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态" :span="1">
          <StatusTag :status="order.status" />
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名" :span="1">
          {{ order.customer_name }}
        </el-descriptions-item>
        <el-descriptions-item label="客户电话" :span="1">
          {{ order.customer_phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="维修地址" :span="2">
          {{ order.address }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">
          {{ order.description }}
        </el-descriptions-item>
        <el-descriptions-item label="指派技师" :span="1">
          <span :class="{ 'text-muted': !order.tech_name }">
            {{ order.tech_name || '未指派' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="维修费用" :span="1">
          <span v-if="order.fee && Number(order.fee) > 0" class="fee-text">
            ¥{{ Number(order.fee).toFixed(2) }}
          </span>
          <span v-else class="text-muted">未录入</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">
          {{ order.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="结算时间" :span="1">
          {{ order.settled_at || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 备注区域 -->
    <el-card class="remarks-card" v-if="order">
      <template #header>
        <span>维修备注</span>
      </template>

      <!-- 添加备注表单 -->
      <div class="add-remark">
        <el-input
          v-model="remarkContent"
          placeholder="请输入备注内容"
          maxlength="500"
          show-word-limit
          @keyup.enter="handleAddRemark"
        />
        <el-button
          type="primary"
          :disabled="!remarkContent.trim()"
          :loading="addingRemark"
          @click="handleAddRemark"
          style="margin-left: 12px"
        >
          添加备注
        </el-button>
      </div>

      <!-- 备注列表 -->
      <div class="remark-list" v-if="order.remarks && order.remarks.length > 0">
        <div
          v-for="remark in order.remarks"
          :key="remark.id"
          class="remark-item"
        >
          <div class="remark-header">
            <span class="remark-author">{{ remark.creator_name || '未知' }}</span>
            <span class="remark-time">{{ remark.created_at }}</span>
          </div>
          <div class="remark-content">{{ remark.content }}</div>
        </div>
      </div>
      <el-empty
        v-else
        description="暂无备注"
        :image-size="60"
      />
    </el-card>

    <!-- 指派技师弹窗 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="指派技师"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="选择技师">
          <el-select
            v-model="assignTechId"
            placeholder="请选择技师"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="tech in technicians"
              :key="tech.id"
              :label="`${tech.real_name} (在单${tech.active_orders}个)`"
              :value="tech.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!assignTechId"
          :loading="submitting"
          @click="handleAssign"
        >
          确认指派
        </el-button>
      </template>
    </el-dialog>

    <!-- 标记完工弹窗（录入费用） -->
    <el-dialog
      v-model="completeDialogVisible"
      title="标记完工"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="维修费用">
          <el-input-number
            v-model="completeFee"
            :min="0"
            :precision="2"
            :step="10"
            placeholder="请输入维修费用"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleComplete"
        >
          确认完工
        </el-button>
      </template>
    </el-dialog>

    <!-- 确认结算弹窗 -->
    <el-dialog
      v-model="settleDialogVisible"
      title="确认结算"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="维修费用">
          <el-input-number
            v-model="settleFee"
            :min="0"
            :precision="2"
            :step="10"
            placeholder="请输入结算费用"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <p class="settle-tip">确认结算后，工单将变为"已结算"状态，不可再更改。</p>
      <template #footer>
        <el-button @click="settleDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSettle"
        >
          确认结算
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderDetail, updateOrderStatus, addRemark } from '@/api/orders';
import { getTechnicians } from '@/api/technicians';
import StatusTag from '@/components/StatusTag.vue';

const router = useRouter();
const route = useRoute();

// 工单数据
const order = ref(null);
const loading = ref(false);

// 技师列表（用于指派弹窗）
const technicians = ref([]);

// 备注相关
const remarkContent = ref('');
const addingRemark = ref(false);

// 指派技师弹窗
const assignDialogVisible = ref(false);
const assignTechId = ref(null);

// 标记完工弹窗
const completeDialogVisible = ref(false);
const completeFee = ref(0);

// 确认结算弹窗
const settleDialogVisible = ref(false);
const settleFee = ref(0);

// 提交中状态
const submitting = ref(false);

/**
 * 加载工单详情
 */
async function loadOrder() {
  loading.value = true;
  try {
    const id = route.params.id;
    if (!id) {
      order.value = null;
      return;
    }
    const res = await getOrderDetail(id);
    order.value = res.data;
  } catch (error) {
    console.error('加载工单详情失败', error);
    order.value = null;
  } finally {
    loading.value = false;
  }
}

/**
 * 加载技师列表（用于指派弹窗）
 */
async function loadTechnicians() {
  try {
    const res = await getTechnicians();
    technicians.value = res.data || [];
  } catch (error) {
    console.error('加载技师列表失败', error);
    ElMessage.error('加载技师列表失败');
  }
}

/**
 * 返回工单列表
 */
function goBack() {
  router.push('/orders');
}

// ========== 状态流转操作 ==========

/**
 * 打开指派技师弹窗
 */
function showAssignDialog() {
  assignTechId.value = null;
  assignDialogVisible.value = true;
  // 加载技师列表
  loadTechnicians();
}

/**
 * 提交指派技师
 */
async function handleAssign() {
  if (!assignTechId.value) {
    ElMessage.warning('请选择技师');
    return;
  }
  submitting.value = true;
  try {
    await updateOrderStatus(order.value.id, {
      status: 'working',
      tech_id: assignTechId.value
    });
    ElMessage.success('指派成功');
    assignDialogVisible.value = false;
    // 重新加载工单详情
    await loadOrder();
  } catch (error) {
    console.error('指派技师失败', error);
  } finally {
    submitting.value = false;
  }
}

/**
 * 打开标记完工弹窗
 */
function showCompleteDialog() {
  // 预填已有费用
  completeFee.value = order.value.fee ? Number(order.value.fee) : 0;
  completeDialogVisible.value = true;
}

/**
 * 提交标记完工
 */
async function handleComplete() {
  submitting.value = true;
  try {
    const payload = { status: 'done' };
    // 录入费用（fee 为可选字段，大于0时传入）
    if (completeFee.value > 0) {
      payload.fee = completeFee.value;
    }
    await updateOrderStatus(order.value.id, payload);
    ElMessage.success('标记完工成功');
    completeDialogVisible.value = false;
    await loadOrder();
  } catch (error) {
    console.error('标记完工失败', error);
  } finally {
    submitting.value = false;
  }
}

/**
 * 重新派单（working → pending）
 */
async function handleReassign() {
  try {
    await ElMessageBox.confirm(
      '重新派单将清除当前技师指派，工单状态变为"待派单"，确认继续？',
      '确认重新派单',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    submitting.value = true;
    await updateOrderStatus(order.value.id, {
      status: 'pending'
    });
    ElMessage.success('已重新派单');
    await loadOrder();
  } catch (error) {
    // 用户取消不提示
    if (error !== 'cancel') {
      console.error('重新派单失败', error);
    }
  } finally {
    submitting.value = false;
  }
}

/**
 * 打开确认结算弹窗
 */
function showSettleDialog() {
  // 预填已有费用
  settleFee.value = order.value.fee ? Number(order.value.fee) : 0;
  settleDialogVisible.value = true;
}

/**
 * 提交确认结算
 */
async function handleSettle() {
  // 结算时费用必须大于0
  if (!settleFee.value || settleFee.value <= 0) {
    ElMessage.warning('请输入结算费用');
    return;
  }
  submitting.value = true;
  try {
    await updateOrderStatus(order.value.id, {
      status: 'settled',
      fee: settleFee.value
    });
    ElMessage.success('结算成功');
    settleDialogVisible.value = false;
    await loadOrder();
  } catch (error) {
    console.error('结算失败', error);
  } finally {
    submitting.value = false;
  }
}

// ========== 备注操作 ==========

/**
 * 添加备注
 */
async function handleAddRemark() {
  const content = remarkContent.value.trim();
  if (!content) {
    return;
  }
  addingRemark.value = true;
  try {
    await addRemark(order.value.id, { content });
    ElMessage.success('备注添加成功');
    remarkContent.value = '';
    // 重新加载工单详情以获取最新备注
    await loadOrder();
  } catch (error) {
    console.error('添加备注失败', error);
  } finally {
    addingRemark.value = false;
  }
}

// 监听路由参数变化，重新加载数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadOrder();
    }
  }
);

// 页面初始化
onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.order-detail-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 工单信息卡片 */
.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.text-muted {
  color: #909399;
}

.fee-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 备注卡片 */
.remarks-card {
  margin-bottom: 20px;
}

.add-remark {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.add-remark .el-input {
  flex: 1;
}

.remark-list {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.remark-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.remark-item:last-child {
  border-bottom: none;
}

.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.remark-author {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.remark-time {
  font-size: 12px;
  color: #909399;
}

.remark-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 结算弹窗提示 */
.settle-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}
</style>
