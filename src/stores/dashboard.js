import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', () => {
  // ====== 地区 ======
  const regionCode = ref('100000') // 全国
  const regionName = ref('全国')
  const regionPath = ref([{ code: '100000', name: '全国' }]) // 面包屑

  function setRegion(code, name) {
    regionCode.value = code
    regionName.value = name
    const idx = regionPath.value.findIndex((r) => r.code === code)
    if (idx >= 0) {
      regionPath.value = regionPath.value.slice(0, idx + 1)
    } else {
      regionPath.value.push({ code, name })
    }
  }

  function resetRegion() {
    regionCode.value = '100000'
    regionName.value = '全国'
    regionPath.value = [{ code: '100000', name: '全国' }]
  }

  // ====== 时间范围 ======
  const timeRange = ref('month') // today | week | month | quarter | year | custom
  const customRange = ref([null, null])

  function setTimeRange(range) {
    timeRange.value = range
  }

  // ====== 作物筛选 ======
  const allCrops = [
    '番茄', '黄瓜', '辣椒', '草莓', '白菜',
    '水稻', '小麦', '玉米', '苹果', '葡萄',
  ]
  const selectedCrops = ref([...allCrops])

  function toggleCrop(crop) {
    const idx = selectedCrops.value.indexOf(crop)
    if (idx >= 0) {
      selectedCrops.value.splice(idx, 1)
    } else {
      selectedCrops.value.push(crop)
    }
  }

  function selectAllCrops() {
    selectedCrops.value = [...allCrops]
  }

  // ====== LIVE 模式 ======
  const liveMode = ref(false)

  function toggleLive() {
    liveMode.value = !liveMode.value
  }

  // ====== 对比模式 ======
  const compareMode = ref(false)
  const compareRegionCode = ref('')
  const compareRegionName = ref('')

  function setCompare(code, name) {
    compareMode.value = true
    compareRegionCode.value = code
    compareRegionName.value = name
  }

  function clearCompare() {
    compareMode.value = false
    compareRegionCode.value = ''
    compareRegionName.value = ''
  }

  // ====== 天气图层 ======
  const weatherLayer = ref(false)

  // ====== 底部图表 Tab ======
  const chartTab = ref('disease') // disease | climate | crop | ai

  // ====== 数据刷新标志 ======
  const dataVersion = ref(0)

  function refreshData() {
    dataVersion.value++
  }

  // ====== 全屏图表 ======
  const fullscreenChart = ref(null) // { title, optionFn }

  // ====== 计算属性 ======
  const regionLevel = computed(() => {
    if (regionCode.value === '100000') return 'country'
    if (regionCode.value.endsWith('0000')) return 'province'
    if (regionCode.value.endsWith('00')) return 'city'
    return 'district'
  })

  return {
    // 地区
    regionCode, regionName, regionPath, setRegion, resetRegion, regionLevel,
    // 时间
    timeRange, customRange, setTimeRange,
    // 作物
    allCrops, selectedCrops, toggleCrop, selectAllCrops,
    // LIVE
    liveMode, toggleLive,
    // 对比
    compareMode, compareRegionCode, compareRegionName, setCompare, clearCompare,
    // 图层
    weatherLayer,
    // Tab
    chartTab,
    // 刷新
    dataVersion, refreshData,
    // 全屏
    fullscreenChart,
  }
})
