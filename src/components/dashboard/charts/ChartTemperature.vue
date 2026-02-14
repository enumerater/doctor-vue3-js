<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">温度变化</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getTemperatureData } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getTemperatureData()
  setOption({
    grid: { top: 30, bottom: 30, left: 40, right: 20 },
    legend: { top: 2, right: 0, textStyle: { fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLabel: { fontSize: 9, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '°C',
      axisLabel: { fontSize: 9 },
    },
    series: [
      {
        name: '最高温',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.high),
        lineStyle: { width: 2, color: '#F43F5E' },
        itemStyle: { color: '#F43F5E' },
        areaStyle: { color: 'rgba(244,63,94,0.08)' },
      },
      {
        name: '平均温',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.avg),
        lineStyle: { width: 2, color: '#F59E0B' },
        itemStyle: { color: '#F59E0B' },
      },
      {
        name: '最低温',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.low),
        lineStyle: { width: 2, color: '#06B6D4' },
        itemStyle: { color: '#06B6D4' },
        areaStyle: { color: 'rgba(6,182,212,0.08)' },
      },
    ],
    tooltip: { trigger: 'axis' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '温度变化', renderFn: render }
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
