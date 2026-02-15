<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">地区对比雷达</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getRegionCompare } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getRegionCompare(store.regionCode, '', store.timeRange)
  so({
    legend: { bottom: 0, textStyle: { fontSize: 10, color: '#9CA3AF' } },
    radar: {
      indicator: data.dimensions.map((d) => ({ name: d, max: 100 })),
      shape: 'polygon',
      radius: '60%',
      axisName: { color: '#9CA3AF', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: data.regionA,
            name: store.regionName,
            areaStyle: { opacity: 0.15 },
            lineStyle: { width: 2 },
          },
          {
            value: data.regionB,
            name: '全国平均',
            areaStyle: { opacity: 0.1 },
            lineStyle: { width: 2 },
          },
        ],
      },
    ],
    tooltip: {},
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '地区对比雷达', renderFn: render }
}

onMounted(render)
watch(() => [store.regionCode, store.dataVersion], render)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;
.chart-card { @include dash-card; display: flex; flex-direction: column; overflow: hidden; }
.chart-card-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 0; flex-shrink: 0; }
.chart-title { font-size: 12px; font-weight: 600; color: $dash-text-secondary; }
.btn-expand { background: none; border: none; color: $dash-text-muted; cursor: pointer; font-size: 14px; &:hover { color: $dash-accent; } }
.chart-el { flex: 1; min-height: 0; }
</style>
