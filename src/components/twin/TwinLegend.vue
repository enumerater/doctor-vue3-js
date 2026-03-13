<template>
  <div class="twin-legend">
    <div class="legend-title">健康指数</div>
    <div class="legend-items">
      <div class="legend-item" v-for="level in HEALTH_LEVELS" :key="level.label">
        <span class="legend-color" :style="{ background: level.color }"></span>
        <span class="legend-text">{{ level.label }}</span>
        <span class="legend-range">{{ level.range }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HEALTH_LEVELS } from '@/axios/farm_twin'
</script>

<style lang="scss" scoped>
.twin-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: $radius-md;
  border: 1px solid rgba($border, 0.6);
  box-shadow: $shadow-sm;

  @include mobile {
    bottom: 12px;
    right: 12px;
    padding: 10px 14px;
  }
}

.legend-title {
  font-size: 12px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 12px;
  color: $text-primary;
  font-weight: 600;
  min-width: 28px;
}

.legend-range {
  font-size: 11px;
  color: $text-tertiary;
}
</style>
