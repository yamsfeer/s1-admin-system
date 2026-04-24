<template>
  <div class="technician-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>技师管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增技师
      </el-button>
    </div>

    <!-- 技师表格 -->
    <el-table
      :data="technicianList"
      v-loading="loading"
      stripe
      border
      class="technician-table"
    >
      <el-table-column prop="real_name" label="姓名" min-width="120">
        <template #default="{ row }">
          <span>{{ row.real_name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机" min-width="140">
        <template #default="{ row }">
          <span>{{ row.phone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="active_orders" label="在单数" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.active_orders > 0" type="warning">{{ row.active_orders }}</el-tag>
          <span v-else>0</span>
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

    <!-- 新增/编辑技师弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑技师' : '新增技师'"
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
        <el-form-item v-if="!isEdit" label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="姓名" prop="real_name">
          <el-input
            v-model="form.real_name"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            clearable
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician
} from '@/api/technicians';

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const technicianList = ref([]);

const formRef = ref();
const form = reactive({
  username: '',
  password: '',
  real_name: '',
  phone: ''
});

// 表单校验规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

// 加载技师列表
async function loadTechnicians() {
  loading.value = true;
  try {
    const res = await getTechnicians();
    technicianList.value = res.data || [];
  } catch (error) {
    console.error('加载技师列表失败', error);
    ElMessage.error('加载技师列表失败');
  } finally {
    loading.value = false;
  }
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
  form.username = '';
  form.password = '';
  form.real_name = row.real_name || '';
  form.phone = row.phone || '';
  dialogVisible.value = true;
}

// 重置表单
function resetForm() {
  form.username = '';
  form.password = '';
  form.real_name = '';
  form.phone = '';
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
      await updateTechnician(currentId.value, {
        real_name: form.real_name,
        phone: form.phone
      });
      ElMessage.success('修改成功');
    } else {
      // 新增
      await createTechnician({
        username: form.username,
        password: form.password,
        real_name: form.real_name,
        phone: form.phone
      });
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    loadTechnicians();
  } catch (error) {
    console.error(isEdit.value ? '修改技师失败' : '新增技师失败', error);
    // 错误信息由拦截器处理，如果后端返回特定错误则显示
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    submitting.value = false;
  }
}

// 删除技师
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除技师「${row.real_name || row.username}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await deleteTechnician(row.id);
    ElMessage.success('删除成功');
    loadTechnicians();
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除
      return;
    }

    console.error('删除技师失败', error);

    // 后端返回 400 表示有进行中工单
    if (error.response?.status === 400) {
      const msg = error.response?.data?.message || '该技师有进行中的工单，无法删除';
      ElMessage.error(msg);
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('删除失败');
    }
  }
}

onMounted(() => {
  loadTechnicians();
});
</script>

<style scoped>
.technician-list-page {
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

.technician-table {
  margin-bottom: 20px;
}
</style>
