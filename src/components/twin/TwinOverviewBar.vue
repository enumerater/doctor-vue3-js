<template>
  <div class="twin-overview-bar">
    <div class="kpi-item" v-for="item in kpis" :key="item.label">
      <span class="kpi-value" :style="{ color: item.color }">{{ item.value }}</span>
      <span class="kpi-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { healthToColor } from '@/axios/farm_twin'

const props = defineProps({
  kpis: { type: Object, default: () => ({}) },
})

const kpis = computed(() => [
  { label: '总面积(亩)', value: props.kpis.totalArea || 0, color: undefined },
  { label: '地块数', value: props.kpis.plotCount || 0, color: undefined },
  { label: '平均健康分', value: props.kpis.avgHealth || 0, color: healthToColor(props.kpis.avgHealth || 0) },
  { label: '作物种类', value: props.kpis.cropTypes || 0, color: undefined },
])
</script>

<style lang="scss" scoped>
.twin-overview-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 24px;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: $radius-lg;
  border: 1px solid rgba($border, 0.6);
  box-shadow: $shadow-md;

  @include mobile {
    gap: 12px;
    padding: 10px 16px;
    max-width: calc(100vw - 32px);
    overflow-x: auto;
    &::-webkit-scrollbar { display: none; }
  }
}

.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  line-height: 1;

  @include mobile {
    font-size: 18px;
  }
}

.kpi-label {
  font-size: 11px;
  color: $text-tertiary;
  font-weight: 500;
  margin-top: 4px;
  white-space: nowrap;
}
</style>
