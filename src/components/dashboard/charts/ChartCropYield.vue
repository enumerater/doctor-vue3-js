<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">作物产量</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getCropYield } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getCropYield()
  so({
    grid: { top: 30, bottom: 30, left: 50, right: 20 },
    legend: { top: 2, right: 0, textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: data.quarters,
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '吨',
      axisLabel: { fontSize: 9 },
    },
    series: data.crops.map((crop, i) => ({
      name: crop,
      type: 'bar',
      stack: 'total',
      data: data.data[i],
      barWidth: 20,
      emphasis: { focus: 'series' },
      itemStyle: { borderRadius: i === data.crops.length - 1 ? [4, 4, 0, 0] : 0 },
    })),
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '作物产量', renderFn: render }
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
