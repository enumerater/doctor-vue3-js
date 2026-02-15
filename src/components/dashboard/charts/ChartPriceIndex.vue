<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">农产品价格趋势</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getPriceIndex } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getPriceIndex(null, store.timeRange)
  const weeks = data[0]?.data.map((_, i) => `第${i + 1}周`) || []
  so({
    grid: { top: 30, bottom: 30, left: 40, right: 20 },
    legend: { top: 2, right: 0, textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: weeks,
      axisLabel: { fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      name: '元/kg',
      axisLabel: { fontSize: 9 },
    },
    series: data.map((crop) => ({
      name: crop.name,
      type: 'line',
      smooth: true,
      data: crop.data,
      lineStyle: { width: 1.5 },
      symbol: 'circle',
      symbolSize: 4,
    })),
    tooltip: { trigger: 'axis' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '农产品价格趋势', renderFn: render }
}

onMounted(render)
watch(() => [store.timeRange, store.dataVersion], render)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;
.chart-card { @include dash-card; display: flex; flex-direction: column; overflow: hidden; }
.chart-card-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 0; flex-shrink: 0; }
.chart-title { font-size: 12px; font-weight: 600; color: $dash-text-secondary; }
.btn-expand { background: none; border: none; color: $dash-text-muted; cursor: pointer; font-size: 14px; &:hover { color: $dash-accent; } }
.chart-el { flex: 1; min-height: 0; }
</style>
