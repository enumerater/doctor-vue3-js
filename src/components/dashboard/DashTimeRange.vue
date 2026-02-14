<template>
  <div class="time-range">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="seg-btn"
      :class="{ active: store.timeRange === opt.value }"
      @click="store.setTimeRange(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()

const options = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '全年', value: 'year' },
]
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.time-range {
  display: flex;
  background: $dash-bg-base;
  border: 1px solid $dash-border;
  border-radius: $dash-radius-sm;
  overflow: hidden;
}

.seg-btn {
  padding: 5px 12px;
  font-size: 12px;
  color: $dash-text-secondary;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: $dash-transition-fast;
  white-space: nowrap;

  &:hover {
    color: $dash-text-primary;
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    color: $dash-accent;
    background: rgba($dash-accent, 0.12);
    font-weight: 600;
  }
}

@media screen and (max-width: $dash-bp-mobile) {
  .seg-btn { padding: 4px 8px; font-size: 11px; }
}
</style>
