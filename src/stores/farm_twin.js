import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getTwinLayoutData, getTwinIoTData, healthToColor } from '@/axios/farm_twin'

export const useFarmTwinStore = defineStore('farmTwin', () => {
  // ====== 状态 ======
  const layoutData = ref(null)
  const iotData = ref({})
  const selectedPlotId = ref(null)
  const loading = ref(false)

  // ====== 计算属性 ======
  const plots = computed(() => layoutData.value?.plots || [])

  const selectedPlot = computed(() => {
    if (!selectedPlotId.value) return null
    const plot = plots.value.find((p) => p.plotId === selectedPlotId.value)
    if (!plot) return null
    const iot = iotData.value[selectedPlotId.value] || null
    return { ...plot, iot, color: healthToColor(plot.healthScore) }
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
    try {
      const [layout, iot] = await Promise.all([
        getTwinLayoutData(farmId),
        getTwinIoTData(farmId),
      ])
      layoutData.value = layout
      iotData.value = iot || {}
    } finally {
      loading.value = false
    }
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
    plots,
    selectedPlot,
    farmKPIs,
    fetchTwinData,
    selectPlot,
    updateIoTData,
  }
})
