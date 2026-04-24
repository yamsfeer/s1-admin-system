<template>
  <div class="revenue-card" :style="{ borderLeftColor: color }" @click="$emit('click')">
    <div class="revenue-card__content">
      <div class="revenue-card__amount" :style="{ color: color }">
        <span class="prefix">¥</span>{{ formatAmount(amount) }}
      </div>
      <div class="revenue-card__label">{{ label }}</div>
      <div v-if="trend !== null" class="revenue-card__trend" :class="trend >= 0 ? 'up' : 'down'">
        <el-icon><component :is="trend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        {{ Math.abs(trend) }}%
        <span class="trend-text">较上周期</span>
      </div>
    </div>
    <div class="revenue-card__icon">
      <el-icon :size="36" :style="{ color: color }">
        <component :is="icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
defineProps({
  amount: { type: Number, default: 0 },
  label: { type: String, default: '' },
  color: { type: String, default: '#409EFF' },
  icon: { type: String, default: 'Coin' },
  trend: { type: Number, default: null }
});

defineEmits(['click']);

function formatAmount(val) {
  if (val >= 10000) {
    return (val / 10000).toFixed(2) + '万';
  }
  return val.toFixed(2);
}
</script>

<style scoped>
.revenue-card {
  height: 120px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid;
}

.revenue-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.revenue-card__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.revenue-card__amount {
  font-size: 24px;
  font-weight: 600;
  font-family: Monaco, Consolas, monospace;
  line-height: 1.2;
}

.revenue-card__amount .prefix {
  font-size: 16px;
  margin-right: 2px;
}

.revenue-card__label {
  font-size: 13px;
  color: #909399;
}

.revenue-card__trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.revenue-card__trend.up {
  color: #67C23A;
}

.revenue-card__trend.down {
  color: #F56C6C;
}

.trend-text {
  color: #C0C4CC;
  font-weight: 400;
  margin-left: 4px;
}

.revenue-card__icon {
  opacity: 0.85;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
