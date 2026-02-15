<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-title">作物分布</span>
      <button class="btn-expand" @click="openFullscreen">&#9974;</button>
    </div>
    <div ref="chartEl" class="chart-el"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores/dashboard'
import { getCropDistribution } from '@/axios/dashboard'

const store = useDashboardStore()
const chartEl = ref(null)
const { setOption } = useChart(chartEl)

async function render(targetSetOption) {
  const so = targetSetOption || setOption
  const data = await getCropDistribution(store.regionCode)
  so({
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '55%'],
        data: data,
        label: {
          color: '#9CA3AF',
          fontSize: 10,
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        itemStyle: { borderColor: '#111827', borderWidth: 2 },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
  })
}

function openFullscreen() {
  store.fullscreenChart = { title: '作物分布', renderFn: render }
}

onMounted(render)
watch(() => [store.regionCode, store.dataVersion], render)
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
