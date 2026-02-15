<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">病害日历热力图</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getDiseaseHeatmap } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getDiseaseHeatmap()
  const year = new Date().getFullYear()
  so({
    visualMap: {
      min: 0,
      max: 50,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: { color: '#9CA3AF', fontSize: 9 },
      inRange: {
        color: ['#111827', '#064e3b', '#10B981', '#F59E0B', '#F43F5E'],
      },
      itemWidth: 10,
      itemHeight: 60,
    },
    calendar: {
      top: 20,
      left: 30,
      right: 10,
      bottom: 30,
      cellSize: ['auto', 10],
      range: year,
      itemStyle: {
        borderWidth: 1,
        borderColor: '#1F2937',
      },
      yearLabel: { show: false },
      dayLabel: { color: '#6B7280', fontSize: 8, nameMap: 'ZH' },
      monthLabel: { color: '#9CA3AF', fontSize: 9, nameMap: 'ZH' },
      splitLine: { lineStyle: { color: '#1F2937' } },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
      },
    ],
    tooltip: {
      formatter: (p) => `${p.data[0]}<br/>病害: ${p.data[1]}例`,
    },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '病害日历热力图', renderFn: render }
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
