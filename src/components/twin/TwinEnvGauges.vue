<template>
  <div class="gauge-grid">
    <div v-for="(sensor, key) in sensors" :key="key" class="gauge-cell">
      <div ref="chartRefs" class="gauge-chart" :data-key="key"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useChart } from '@/composables/useChart'

const props = defineProps({
  sensors: { type: Object, default: () => ({}) },
})

// 每个 gauge 一个 chart 实例
const chartInstances = {}
const chartRefs = ref([])

const GAUGE_COLORS = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  light: '#f59e0b',
  soilMoisture: '#06b6d4',
  soilFertility: '#8b5cf6',
}

function buildGaugeOption(key, sensor) {
  const color = GAUGE_COLORS[key] || '#10B981'
  return {
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '90%',
        startAngle: 210,
        endAngle: -30,
        min: sensor.min,
        max: sensor.max,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, '#67e8f9'],
              [0.7, color],
              [1, '#ef4444'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: {
          length: '55%',
          width: 4,
          itemStyle: { color },
        },
        anchor: {
          show: true,
          size: 8,
          itemStyle: { borderColor: color, borderWidth: 2 },
        },
        title: {
          offsetCenter: [0, '75%'],
          fontSize: 11,
          color: '#8b9a91',
          fontWeight: 600,
        },
        detail: {
          offsetCenter: [0, '40%'],
          fontSize: 16,
          fontWeight: 800,
          color: '#2c3e35',
          formatter: (val) => {
            if (key === 'light') return Math.round(val).toLocaleString()
            return val.toFixed(1)
          },
        },
        data: [{ value: sensor.value, name: `${sensor.label}(${sensor.unit})` }],
        animationDuration: 1000,
      },
    ],
  }
}

function initCharts() {
  nextTick(() => {
    const els = chartRefs.value
    if (!els || !els.length) return

    els.forEach((el) => {
      const key = el.getAttribute('data-key')
      if (!key || chartInstances[key]) return

      const elRef = ref(el)
      const { setOption } = useChart(elRef)
      chartInstances[key] = setOption

      const sensor = props.sensors[key]
      if (sensor) setOption(buildGaugeOption(key, sensor))
    })
  })
}

function updateCharts() {
  Object.entries(props.sensors).forEach(([key, sensor]) => {
    const setOption = chartInstances[key]
    if (setOption) setOption(buildGaugeOption(key, sensor))
  })
}

onMounted(initCharts)

watch(() => props.sensors, () => {
  if (Object.keys(chartInstances).length === 0) {
    initCharts()
  } else {
    updateCharts()
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gauge-cell {
  aspect-ratio: 1;
  min-height: 0;
}

.gauge-chart {
  width: 100%;
  height: 100%;
  min-height: 100px;
}
</style>
