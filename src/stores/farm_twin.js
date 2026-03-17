import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getTwinLayoutData, getTwinIoTData, getTwinWeather, healthToColor } from '@/axios/farm_twin'

export const useFarmTwinStore = defineStore('farmTwin', () => {
  // ====== 状态 ======
  const layoutData = ref(null)
  const iotData = ref({})
  const selectedPlotId = ref(null)
  const loading = ref(false)
  const currentFarmId = ref(null)
  const weatherData = ref(null)

  // ====== 计算属性 ======
  const plots = computed(() => layoutData.value?.plots || [])

  const farmName = computed(() => layoutData.value?.farmName || '')
  const farmLocation = computed(() => layoutData.value?.farmLocation || '')

  const selectedPlot = computed(() => {
    if (!selectedPlotId.value) return null
    const plot = plots.value.find((p) => p.plotId === selectedPlotId.value)
    if (!plot) return null
    const iot = iotData.value[selectedPlotId.value] || null
    return {
      ...plot,
      iot,
      color: healthToColor(plot.healthScore),
      farmId: currentFarmId.value,
    }
  })

  const farmKPIs = computed(() => {
    const p = plots.value
    if (!p.length) return { totalArea: 0, plotCount: 0, avgHealth: 0, cropTypes: 0 }
    const totalArea = p.reduce((s, pl) => s + (pl.area || 0), 0)
    const avgHealth = Math.round(p.reduce((s, pl) => s + pl.healthScore, 0) / p.length)
    const cropTypes = new Set(p.map((pl) => pl.cropType).filter(Boolean)).size
    return { totalArea, plotCount: p.length, avgHealth, cropTypes }
  })

  // ====== 操作 ======
  async function fetchTwinData(farmId) {
    loading.value = true
    currentFarmId.value = farmId
    try {
      const [layout, iot] = await Promise.all([getTwinLayoutData(farmId), getTwinIoTData(farmId)])
      layoutData.value = layout
      iotData.value = iot || {}

      // 获取天气数据
      const location = layout?.farmLocation
      if (location) {
        weatherData.value = await getTwinWeather(location)
      }
    } finally {
      loading.value = false
    }
  }

  async function setFarm(farmId) {
    selectedPlotId.value = null
    await fetchTwinData(farmId)
  }

  function selectPlot(plotId) {
    selectedPlotId.value = selectedPlotId.value === plotId ? null : plotId
  }

  function updateIoTData(data) {
    iotData.value = { ...data }
  }

  return {
    layoutData,
    iotData,
    selectedPlotId,
    loading,
    currentFarmId,
    weatherData,
    plots,
    farmName,
    farmLocation,
    selectedPlot,
    farmKPIs,
    fetchTwinData,
    setFarm,
    selectPlot,
    updateIoTData,
  }
})
