import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/knowledge'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // ====== 状态 ======
  const crops = ref([])
  const currentCropDiseases = ref([])
  const currentCropTotal = ref(0)
  const currentDisease = ref(null)
  const searchResults = ref([])
  const searchKeyword = ref('')
  const seasonalRisks = ref([])
  const loading = ref(false)

  // ====== 操作 ======

  async function fetchCrops() {
    loading.value = true
    try {
      crops.value = await api.getCrops()
    } finally {
      loading.value = false
    }
  }

  async function fetchDiseasesByCrop(cropName, page = 1, pageSize = 20) {
    loading.value = true
    try {
      const res = await api.getDiseasesByCrop(cropName, page, pageSize)
      currentCropDiseases.value = res.list || []
      currentCropTotal.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchDiseaseDetail(diseaseId) {
    loading.value = true
    try {
      currentDisease.value = await api.getDiseaseDetail(diseaseId)
    } finally {
      loading.value = false
    }
  }

  async function searchDiseases(keyword) {
    if (!keyword.trim()) {
      searchResults.value = []
      return
    }
    loading.value = true
    searchKeyword.value = keyword
    try {
      searchResults.value = await api.searchDiseases(keyword)
    } finally {
      loading.value = false
    }
  }

  async function fetchSeasonalRisks() {
    try {
      const month = new Date().getMonth() + 1
      seasonalRisks.value = await api.getSeasonalRisks(month)
    } catch {
      seasonalRisks.value = []
    }
  }

  return {
    crops,
    currentCropDiseases,
    currentCropTotal,
    currentDisease,
    searchResults,
    searchKeyword,
    seasonalRisks,
    loading,
    fetchCrops,
    fetchDiseasesByCrop,
    fetchDiseaseDetail,
    searchDiseases,
    fetchSeasonalRisks,
  }
})
