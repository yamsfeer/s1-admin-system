<template>
  <div class="customer-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>客户管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增客户
      </el-button>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索客户姓名、电话或地址"
        clearable
        prefix-icon="Search"
        style="width: 320px"
        @input="handleSearch"
      />
    </div>

    <!-- 客户表格 -->
    <el-table
      :data="filteredCustomerList"
      v-loading="loading"
      stripe
      border
      class="customer-table"
    >
      <el-table-column prop="name" label="姓名" min-width="120">
        <template #default="{ row }">
          <span>{{ row.name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="电话" min-width="140">
        <template #default="{ row }">
          <span>{{ row.phone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.address || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.remark || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" text @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑客户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑客户' : '新增客户'"
      width="500px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入客户姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入客户电话"
            clearable
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="form.address"
            placeholder="请输入常用地址"
            clearable
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '@/api/customers';

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const customerList = ref([]);
const searchKeyword = ref('');

const formRef = ref();
const form = reactive({
  name: '',
  phone: '',
  address: '',
  remark: ''
});

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ]
};

// 过滤后的客户列表（前端实时搜索）
const filteredCustomerList = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    return customerList.value;
  }
  const lowerKeyword = keyword.toLowerCase();
  return customerList.value.filter(item => {
    const nameMatch = item.name && item.name.toLowerCase().includes(lowerKeyword);
    const phoneMatch = item.phone && item.phone.includes(keyword);
    const addressMatch = item.address && item.address.toLowerCase().includes(lowerKeyword);
    return nameMatch || phoneMatch || addressMatch;
  });
});

// 加载客户列表
async function loadCustomers() {
  loading.value = true;
  try {
    const res = await getCustomers();
    customerList.value = res.data || [];
  } catch (error) {
    console.error('加载客户列表失败', error);
    ElMessage.error('加载客户列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索处理（防抖由 el-input 的 clearable 和实时绑定自然处理）
function handleSearch() {
  // 前端实时过滤，无需发请求
}

// 打开新增弹窗
function handleAdd() {
  isEdit.value = false;
  currentId.value = null;
  resetForm();
  dialogVisible.value = true;
}

// 打开编辑弹窗
function handleEdit(row) {
  isEdit.value = true;
  currentId.value = row.id;
  form.name = row.name || '';
  form.phone = row.phone || '';
  form.address = row.address || '';
  form.remark = row.remark || '';
  dialogVisible.value = true;
}

// 重置表单
function resetForm() {
  form.name = '';
  form.phone = '';
  form.address = '';
  form.remark = '';
  if (formRef.value) {
    formRef.value.resetFields();
  }
}

// 提交表单
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isEdit.value) {
      // 编辑
      await updateCustomer(currentId.value, {
        name: form.name,
        phone: form.phone,
        address: form.address,
        remark: form.remark
      });
      ElMessage.success('修改成功');
    } else {
      // 新增
      await createCustomer({
        name: form.name,
        phone: form.phone,
        address: form.address,
        remark: form.remark
      });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    loadCustomers();
  } catch (error) {
    console.error(isEdit.value ? '修改客户失败' : '新增客户失败', error);
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    submitting.value = false;
  }
}

// 删除客户
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户「${row.name || ''}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await deleteCustomer(row.id);
    ElMessage.success('删除成功');
    loadCustomers();
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除
      return;
    }

    console.error('删除客户失败', error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('删除失败');
    }
  }
}

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
.customer-list-page {
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

.search-bar {
  margin-bottom: 20px;
}

.customer-table {
  margin-bottom: 20px;
}
</style>
