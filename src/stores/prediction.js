import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/prediction'

export const usePredictionStore = defineStore('prediction', () => {
  const accumulatedTemp = ref(null)
  const prediction = ref(null)
  const loading = ref(false)

  async function fetchAccumulatedTemp(plotId, params) {
    loading.value = true
    try {
      const res = await api.getAccumulatedTemp(plotId, params)
      accumulatedTemp.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchAccumulatedTempPrediction(plotId, params) {
    loading.value = true
    try {
      const res = await api.getAccumulatedTempPrediction(plotId, params)
      prediction.value = res.data
    } finally {
      loading.value = false
    }
  }

  return {
    accumulatedTemp,
    prediction,
    loading,
    fetchAccumulatedTemp,
    fetchAccumulatedTempPrediction
  }
})
