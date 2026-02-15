<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">风向分布</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getWindRose } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getWindRose()
  so({
    angleAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      startAngle: 90,
      axisLabel: { fontSize: 10, color: '#9CA3AF' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    radiusAxis: {
      axisLabel: { fontSize: 8, color: '#6B7280' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { show: false },
    },
    polar: { radius: '65%' },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    series: [
      {
        name: '微风',
        type: 'bar',
        coordinateSystem: 'polar',
        data: data.map((d) => d.gentle),
        stack: 'wind',
        itemStyle: { borderRadius: 2 },
      },
      {
        name: '中风',
        type: 'bar',
        coordinateSystem: 'polar',
        data: data.map((d) => d.moderate),
        stack: 'wind',
        itemStyle: { borderRadius: 2 },
      },
      {
        name: '强风',
        type: 'bar',
        coordinateSystem: 'polar',
        data: data.map((d) => d.strong),
        stack: 'wind',
        itemStyle: { borderRadius: 2 },
      },
    ],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '风向分布', renderFn: render }
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
