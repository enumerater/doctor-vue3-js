<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">诊断趋势</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getDiagnosisTrend } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getDiagnosisTrend(store.regionCode, store.timeRange)
  setOption({
    grid: { top: 30, bottom: 30, left: 40, right: 20 },
    legend: { top: 2, right: 0, textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLabel: { fontSize: 9, rotate: 30 },
    },
    yAxis: { type: 'value', axisLabel: { fontSize: 9 } },
    series: [
      {
        name: '总诊断',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.count),
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
      },
      {
        name: 'AI诊断',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.aiCount),
        areaStyle: { opacity: 0.1 },
        lineStyle: { width: 2 },
      },
    ],
    tooltip: { trigger: 'axis' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '诊断趋势', renderFn: render }
}

onMounted(render)
watch(() => [store.regionCode, store.timeRange, store.dataVersion], render)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.chart-card {
  @include dash-card;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 0;
  flex-shrink: 0;
}
.chart-title { font-size: 12px; font-weight: 600; color: $dash-text-secondary; }
.btn-expand { background: none; border: none; color: $dash-text-muted; cursor: pointer; font-size: 14px; &:hover { color: $dash-accent; } }
.chart-el { flex: 1; min-height: 0; }
</style>
