import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/farm'

export const useFarmStore = defineStore('farm', () => {
  // ====== 状态 ======
  const farms = ref([])
  const currentFarm = ref(null)
  const currentPlot = ref(null)
  const loading = ref(false)

  // ====== 计算属性 ======
  const allPlots = computed(() => farms.value.flatMap((f) => (f.plots || []).map((p) => ({ ...p, farmId: f.id, farmName: f.name }))))

  const totalArea = computed(() => farms.value.reduce((sum, f) => sum + (f.area || 0), 0))

  // ====== 操作 ======

  async function fetchFarms() {
    loading.value = true
    try {
      farms.value = await api.getFarms()
    } finally {
      loading.value = false
    }
  }

  async function createFarm(data) {
    loading.value = true
    try {
      const farm = await api.createFarm(data)
      if (farm) farms.value.push(farm)
      return farm
    } finally {
      loading.value = false
    }
  }

  async function fetchFarmDetail(farmId) {
    loading.value = true
    try {
      currentFarm.value = await api.getFarmDetail(farmId)
    } finally {
      loading.value = false
    }
  }

  async function deleteFarm(farmId) {
    loading.value = true
    try {
      await api.deleteFarm(farmId)
      farms.value = farms.value.filter((f) => f.id !== farmId)
    } finally {
      loading.value = false
    }
  }

  async function createPlot(farmId, data) {
    loading.value = true
    try {
      const plot = await api.createPlot(farmId, data)
      if (currentFarm.value && currentFarm.value.id === farmId) {
        currentFarm.value.plots.push(plot)
        currentFarm.value.plotCount = currentFarm.value.plots.length
      }
      return plot
    } finally {
      loading.value = false
    }
  }

  async function fetchPlotDetail(farmId, plotId) {
    loading.value = true
    try {
      currentPlot.value = await api.getPlotDetail(farmId, plotId)
    } finally {
      loading.value = false
    }
  }

  async function updatePlot(farmId, plotId, data) {
    loading.value = true
    try {
      const plot = await api.updatePlot(farmId, plotId, data)
      if (currentFarm.value) {
        const idx = currentFarm.value.plots.findIndex((p) => p.id === plotId)
        if (idx >= 0) currentFarm.value.plots[idx] = plot
      }
      return plot
    } finally {
      loading.value = false
    }
  }

  async function deletePlot(farmId, plotId) {
    loading.value = true
    try {
      await api.deletePlot(farmId, plotId)
      if (currentFarm.value) {
        currentFarm.value.plots = currentFarm.value.plots.filter((p) => p.id !== plotId)
        currentFarm.value.plotCount = currentFarm.value.plots.length
      }
    } finally {
      loading.value = false
    }
  }

  async function updateGrowthStage(farmId, plotId, data) {
    loading.value = true
    try {
      const plot = await api.updateGrowthStage(farmId, plotId, data)
      if (currentPlot.value && currentPlot.value.id === plotId) {
        currentPlot.value = plot
      }
      return plot
    } finally {
      loading.value = false
    }
  }

  return {
    farms,
    currentFarm,
    currentPlot,
    loading,
    allPlots,
    totalArea,
    fetchFarms,
    createFarm,
    fetchFarmDetail,
    deleteFarm,
    createPlot,
    fetchPlotDetail,
    updatePlot,
    deletePlot,
    updateGrowthStage,
  }
})
