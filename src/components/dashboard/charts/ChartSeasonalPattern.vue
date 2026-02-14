<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">季节性病害趋势</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getSeasonalPattern } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getSeasonalPattern()
  setOption({
    grid: { top: 30, bottom: 30, left: 40, right: 20 },
    legend: { top: 2, right: 0, textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: data.months,
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      name: '发病数',
      axisLabel: { fontSize: 9 },
    },
    series: data.series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 4,
    })),
    tooltip: { trigger: 'axis' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '季节性病害趋势', renderFn: render }
}

onMounted(render)
watch(() => store.dataVersion, render)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;
.chart-card { @include dash-card; display: flex; flex-direction: column; overflow: hidden; }
.chart-card-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 0; flex-shrink: 0; }
.chart-title { font-size: 12px; font-weight: 600; color: $dash-text-secondary; }
.btn-expand { background: none; border: none; color: $dash-text-muted; cursor: pointer; font-size: 14px; &:hover { color: $dash-accent; } }
.chart-el { flex: 1; min-height: 0; }
</style>
