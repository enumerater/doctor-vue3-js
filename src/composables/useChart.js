import { onUnmounted, shallowRef, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// ECharts 全局深色主题色板
const CHART_COLORS = ['#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#F43F5E', '#3B82F6']

const CHART_THEME = {
  backgroundColor: 'transparent',
  textStyle: { color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' },
  title: { textStyle: { color: '#F9FAFB' }, subtextStyle: { color: '#9CA3AF' } },
  legend: { textStyle: { color: '#9CA3AF' } },
  tooltip: {
    backgroundColor: 'rgba(17,24,39,0.95)',
    borderColor: 'rgba(255,255,255,0.08)',
    textStyle: { color: '#F9FAFB', fontSize: 12 },
    extraCssText: 'box-shadow:0 4px 20px rgba(0,0,0,0.4);border-radius:8px;',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
  },
}

// 注册自定义主题
echarts.registerTheme('dashHorizon', CHART_THEME)

/**
 * useChart composable — 管理 ECharts 实例的初始化、resize、销毁
 * @param {import('vue').Ref<HTMLElement|null>} elRef — 图表容器 ref
 * @param {Object} opts — 额外选项
 * @returns {{ chart, setOption, resize }}
 */
export function useChart(elRef, opts = {}) {
  const chart = shallowRef(null)
  let resizeObs = null

  function init() {
    if (!elRef.value) return
    if (chart.value) chart.value.dispose()
    chart.value = echarts.init(elRef.value, 'dashHorizon', {
      renderer: opts.renderer || 'canvas',
    })
  }

  function setOption(option, notMerge = false) {
    if (!chart.value) init()
    if (!chart.value) return
    chart.value.setOption(
      {
        color: CHART_COLORS,
        ...option,
      },
      notMerge,
    )
  }

  function resize() {
    chart.value?.resize({ animation: { duration: 200 } })
  }

  // 监听 DOM 挂载
  watch(
    elRef,
    (el) => {
      if (el) {
        nextTick(() => {
          init()
          // ResizeObserver 替代 window.resize，更精确
          resizeObs = new ResizeObserver(() => resize())
          resizeObs.observe(el)
        })
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    resizeObs?.disconnect()
    chart.value?.dispose()
    chart.value = null
  })

  return { chart, setOption, resize }
}

export { CHART_COLORS }
