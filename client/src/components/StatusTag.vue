<template>
  <el-tag :type="tagType" size="small">
    {{ label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const STATUS_MAP = {
  pending: { label: '待派单', type: 'danger' },
  working: { label: '进行中', type: 'warning' },
  done: { label: '已完工', type: 'success' },
  settled: { label: '已结算', type: 'info' }
};

const label = computed(() => STATUS_MAP[props.status]?.label || props.status);
const tagType = computed(() => STATUS_MAP[props.status]?.type || 'info');
</script>
