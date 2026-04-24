<template>
  <div class="order-create-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>新建工单</h2>
    </div>

    <!-- 工单表单 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="order-form"
    >
      <el-form-item label="客户姓名" prop="customer_name">
        <el-input
          v-model="form.customer_name"
          placeholder="请输入客户姓名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="客户电话" prop="customer_phone">
        <el-input
          v-model="form.customer_phone"
          placeholder="请输入客户电话"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="维修地址" prop="address">
        <el-input
          v-model="form.address"
          type="textarea"
          :rows="2"
          placeholder="请输入维修地址"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请详细描述故障情况"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="指派技师" prop="tech_id">
        <el-select
          v-model="form.tech_id"
          placeholder="请选择指派技师"
          style="width: 100%"
          @change="handleTechChange"
        >
          <el-option
            label="暂不指派"
            :value="null"
          />
          <el-option
            v-for="tech in technicians"
            :key="tech.id"
            :label="`${tech.real_name} (在单${tech.active_orders}个)`"
            :value="tech.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createOrder } from '@/api/orders';
import { getTechnicians } from '@/api/technicians';

const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);
const technicians = ref([]);

// 表单数据
const form = reactive({
  customer_name: '',
  customer_phone: '',
  address: '',
  description: '',
  tech_id: null
});

// 校验规则
const rules = {
  customer_name: [
    { required: true, message: '此项为必填', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '此项为必填', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '此项为必填', trigger: 'blur' }
  ]
};

// 处理技师选择变化，确保"暂不指派"时 tech_id 为 null
function handleTechChange(val) {
  // el-select 的 el-option :value="null" 选中后 val 为 null
  // 但如果 clearable 导致清空，val 可能为空字符串，需要统一处理
  if (val === '' || val === undefined) {
    form.tech_id = null;
  }
}

// 加载技师列表
async function loadTechnicians() {
  try {
    const res = await getTechnicians();
    technicians.value = res.data || [];
  } catch (error) {
    console.error('加载技师列表失败', error);
    ElMessage.error('加载技师列表失败');
  }
}

// 提交表单
async function handleSubmit() {
  // 前端校验：校验不通过则阻止提交
  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      address: form.address.trim(),
      description: form.description.trim()
    };

    // 只有选择了具体技师才传 tech_id（非 null、非空字符串）
    if (form.tech_id !== null && form.tech_id !== undefined && form.tech_id !== '') {
      payload.tech_id = form.tech_id;
    }

    await createOrder(payload);
    ElMessage.success('创建成功');
    router.push('/orders');
  } catch (error) {
    console.error('创建工单失败', error);
    // 错误已在请求拦截器中统一提示
  } finally {
    submitting.value = false;
  }
}

// 取消
function handleCancel() {
  router.back();
}

onMounted(() => {
  loadTechnicians();
});
</script>

<style scoped>
.order-create-page {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.order-form {
  max-width: 600px;
}
</style>
