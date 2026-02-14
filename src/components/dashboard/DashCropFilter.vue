<template>
  <div class="crop-filter">
    <div class="panel-title">
      <span class="icon">&#9752;</span>
      作物筛选
      <button class="btn-all" @click="store.selectAllCrops">全选</button>
    </div>
    <div class="chips">
      <span
        v-for="crop in store.allCrops"
        :key="crop"
        class="chip"
        :class="{ active: store.selectedCrops.includes(crop) }"
        @click="store.toggleCrop(crop)"
      >
        {{ crop }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.crop-filter {
  @include dash-card;
  padding: 12px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: $dash-accent;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;

  .icon { font-size: 12px; }

  .btn-all {
    margin-left: auto;
    font-size: 11px;
    color: $dash-text-muted;
    background: none;
    border: none;
    cursor: pointer;
    &:hover { color: $dash-accent; }
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 20px;
  border: 1px solid $dash-border;
  color: $dash-text-secondary;
  cursor: pointer;
  transition: $dash-transition-fast;
  user-select: none;

  &:hover {
    border-color: rgba($dash-accent, 0.3);
    color: $dash-text-primary;
  }

  &.active {
    background: rgba($dash-accent, 0.15);
    border-color: $dash-accent;
    color: $dash-accent;
    font-weight: 500;
  }
}
</style>
