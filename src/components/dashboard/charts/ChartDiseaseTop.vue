<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">病害 TOP10</span>
      <button class="btn-expand" @click="openFullscreen" title="全屏">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getDiseaseTop } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getDiseaseTop()
  setOption({
    grid: { top: 10, bottom: 10, left: '35%', right: '10%' },
    xAxis: { show: false },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLabel: { fontSize: 10, color: '#9CA3AF' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.value),
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#06B6D4' },
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          color: '#9CA3AF',
          fontSize: 10,
          formatter: '{c}例',
        },
      },
    ],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '病害 TOP10', renderFn: render }
}

onMounted(render)
watch(() => store.dataVersion, render)
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

.chart-title {
  font-size: 12px;
  font-weight: 600;
  color: $dash-text-secondary;
}

.btn-expand {
  background: none;
  border: none;
  color: $dash-text-muted;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  &:hover { color: $dash-accent; }
}

.chart-el {
  flex: 1;
  min-height: 0;
}
</style>
