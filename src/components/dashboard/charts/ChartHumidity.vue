<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">湿度变化</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getHumidityData } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getHumidityData()
  setOption({
    grid: { top: 20, bottom: 30, left: 40, right: 20 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLabel: { fontSize: 9, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '%RH',
      min: 20,
      max: 100,
      axisLabel: { fontSize: 9 },
    },
    series: [
      {
        name: '湿度',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.value),
        lineStyle: { width: 2, color: '#06B6D4' },
        itemStyle: { color: '#06B6D4' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6,182,212,0.25)' },
              { offset: 1, color: 'rgba(6,182,212,0.02)' },
            ],
          },
        },
        markLine: {
          data: [{ yAxis: 60, label: { formatter: '适宜', fontSize: 9 }, lineStyle: { color: '#10B981', type: 'dashed' } }],
        },
      },
    ],
    tooltip: { trigger: 'axis', formatter: '{b}<br/>湿度: {c}%' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '湿度变化', renderFn: render }
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
