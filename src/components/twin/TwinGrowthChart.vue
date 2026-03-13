<template>
  <div class="growth-chart-wrap">
    <div ref="chartRef" class="growth-chart"></div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useChart } from '@/composables/useChart'

const props = defineProps({
  cropType: { type: String, default: '' },
  currentStage: { type: String, default: '' },
})

const stageMap = {
  小麦: ['播种', '出苗期', '分蘖期', '越冬期', '返青期', '拔节期', '抽穗期', '灌浆期', '成熟期', '收获'],
  水稻: ['播种', '秧苗期', '移栽', '分蘖期', '拔节期', '抽穗期', '灌浆期', '成熟期', '收获'],
  玉米: ['播种', '出苗期', '拔节期', '大喇叭口期', '抽雄期', '吐丝期', '灌浆期', '成熟期', '收获'],
  番茄: ['育苗', '定植', '缓苗期', '开花期', '结果期', '膨大期', '转色期', '采收期'],
  黄瓜: ['育苗', '定植', '缓苗期', '抽蔓期', '开花期', '结瓜期', '盛果期', '采收期'],
  辣椒: ['育苗', '定植', '缓苗期', '开花期', '结果期', '膨大期', '采收期'],
  草莓: ['定植', '缓苗期', '花芽分化期', '开花期', '结果期', '膨大期', '采收期'],
  苹果: ['休眠期', '萌芽期', '花期', '坐果期', '膨大期', '着色期', '成熟期', '采收'],
  葡萄: ['休眠期', '萌芽期', '展叶期', '花期', '坐果期', '膨大期', '转色期', '成熟期', '采收'],
  白菜: ['播种', '出苗期', '莲座期', '包心期', '收获'],
}
const defaultStages = ['播种', '苗期', '生长期', '花期', '结果期', '成熟期', '收获']

const chartRef = ref(null)
const { setOption } = useChart(chartRef)

const stages = computed(() => stageMap[props.cropType] || defaultStages)

function buildOption() {
  const stageList = stages.value
  const currentIdx = stageList.indexOf(props.currentStage)

  const data = stageList.map((name, i) => {
    const isCurrent = i === currentIdx
    const isPast = currentIdx >= 0 && i < currentIdx
    return {
      value: 1,
      name,
      itemStyle: {
        color: isCurrent ? '#4a9b5e' : isPast ? '#a3e635' : '#e5ede8',
        borderRadius: [0, 4, 4, 0],
      },
      label: {
        color: isCurrent ? '#fff' : isPast ? '#2c3e35' : '#8b9a91',
        fontWeight: isCurrent ? 800 : 500,
      },
    }
  })

  setOption({
    grid: { left: 80, right: 20, top: 8, bottom: 8 },
    xAxis: {
      type: 'value',
      show: false,
      max: 1,
    },
    yAxis: {
      type: 'category',
      data: stageList.map((s) => s).reverse(),
      inverse: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#5f6f65',
        fontSize: 12,
        fontWeight: 600,
      },
    },
    series: [
      {
        type: 'bar',
        data: data.reverse(),
        barWidth: 18,
        label: {
          show: true,
          position: 'insideRight',
          formatter: (params) => {
            if (params.dataIndex === stageList.length - 1 - currentIdx && currentIdx >= 0) return '当前'
            return ''
          },
          fontSize: 10,
        },
      },
    ],
    tooltip: { show: false },
    animation: true,
    animationDuration: 600,
  }, true)
}

watch([() => props.cropType, () => props.currentStage], buildOption, { immediate: true })
</script>

<style lang="scss" scoped>
.growth-chart-wrap {
  width: 100%;
}

.growth-chart {
  width: 100%;
  height: 240px;
}
</style>
