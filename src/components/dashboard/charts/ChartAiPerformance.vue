<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">AI 性能仪表盘</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getAiPerformance } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render() {
  const data = await getAiPerformance()
  setOption({
    series: [
      {
        type: 'gauge',
        center: ['30%', '55%'],
        radius: '65%',
        startAngle: 200,
        endAngle: -20,
        min: 80,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.5, '#F43F5E'],
              [0.75, '#F59E0B'],
              [1, '#10B981'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { width: 4, length: '60%', itemStyle: { color: '#10B981' } },
        detail: {
          formatter: '{value}%',
          color: '#F9FAFB',
          fontSize: 18,
          fontWeight: 'bold',
          offsetCenter: [0, '80%'],
        },
        title: { show: true, offsetCenter: [0, '100%'], color: '#9CA3AF', fontSize: 11 },
        data: [{ value: data.accuracy, name: '准确率' }],
      },
      {
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        barWidth: 12,
        data: data.dailyTrend.map((d) => d.latency),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#06B6D4' },
              { offset: 1, color: 'rgba(6,182,212,0.2)' },
            ],
          },
        },
      },
    ],
    xAxis: [{
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLabel: { fontSize: 8, color: '#6B7280' },
      axisLine: { show: false },
      axisTick: { show: false },
      gridIndex: 0,
    }],
    yAxis: [{
      type: 'value',
      name: 'ms',
      axisLabel: { fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      gridIndex: 0,
      show: false,
    }],
    grid: [{ left: '55%', right: 10, top: 20, bottom: 30 }],
    tooltip: { trigger: 'axis', formatter: (p) => p[0] ? `${p[0].name}<br/>延迟: ${p[0].value}ms` : '' },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: 'AI 性能仪表盘', renderFn: render }
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
