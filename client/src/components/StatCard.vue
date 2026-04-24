<template>
  <div class="stat-card" :style="{ borderLeftColor: color }" @click="$emit('click')">
    <div class="stat-card__content">
      <div class="stat-card__number" :style="{ color: color }">{{ count }}</div>
      <div class="stat-card__label">{{ label }}</div>
    </div>
    <div class="stat-card__icon">
      <el-icon :size="40" :style="{ color: color }">
        <component :is="icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** 统计数字 */
  count: {
    type: Number,
    default: 0
  },
  /** 卡片标签文字 */
  label: {
    type: String,
    default: ''
  },
  /** 卡片主题颜色 */
  color: {
    type: String,
    default: '#409EFF'
  },
  /** 图标组件名 */
  icon: {
    type: String,
    default: 'Document'
  }
});

defineEmits(['click']);
</script>

<style scoped>
.stat-card {
  height: 120px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.3s;
  border-left: 4px solid;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-card__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card__number {
  font-size: 28px;
  font-weight: 600;
  font-family: Monaco, Consolas, monospace;
  line-height: 1.2;
}

.stat-card__label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.stat-card__icon {
  opacity: 0.85;
}
</style>
