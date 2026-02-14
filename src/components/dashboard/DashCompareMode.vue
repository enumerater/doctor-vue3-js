<template>
  <div class="compare-mode panel" v-if="store.compareMode">
    <div class="panel-title">
      <span class="icon">&#8644;</span>
      数据对比
      <button class="btn-close" @click="store.clearCompare">&times;</button>
    </div>
    <div class="compare-info">
      <span class="region-tag a">{{ store.regionName }}</span>
      <span class="vs">VS</span>
      <span class="region-tag b">{{ store.compareRegionName }}</span>
    </div>
    <div class="compare-chart" ref="chartEl"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useChart } from '@/composables/useChart'
import { getRegionCompare } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function loadCompare() {
  if (!store.compareMode) return
  const data = await getRegionCompare(
    store.regionCode,
    store.compareRegionCode,
    store.timeRange,
  )
  setOption({
    radar: {
      indicator: data.dimensions.map((d) => ({ name: d, max: 100 })),
      shape: 'polygon',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        data: [
          { value: data.regionA, name: store.regionName, areaStyle: { opacity: 0.2 } },
          { value: data.regionB, name: store.compareRegionName, areaStyle: { opacity: 0.2 } },
        ],
      },
    ],
    legend: { bottom: 0, data: [store.regionName, store.compareRegionName] },
  })
}

watch(() => store.compareMode, loadCompare)
onMounted(loadCompare)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.panel {
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

  .btn-close {
    margin-left: auto;
    background: none;
    border: none;
    color: $dash-text-muted;
    cursor: pointer;
    font-size: 16px;
    &:hover { color: $dash-danger; }
  }
}

.compare-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.region-tag {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.a { background: rgba($dash-accent, 0.15); color: $dash-accent; }
  &.b { background: rgba($dash-accent-secondary, 0.15); color: $dash-accent-secondary; }
}

.vs {
  font-size: 11px;
  color: $dash-text-muted;
  font-weight: 700;
}

.compare-chart {
  height: 200px;
}
</style>
