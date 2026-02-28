import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/plot_diagnosis'

export const usePlotDiagnosisStore = defineStore('plotDiagnosis', () => {
  const records = ref([])
  const loading = ref(false)

  async function fetchRecords(plotId) {
    loading.value = true
    try {
      records.value = await api.getPlotDiagnosisList(plotId)
    } finally {
      loading.value = false
    }
  }

  async function bindRecord(data) {
    loading.value = true
    try {
      const res = await api.bindDiagnosisToPlot(data)
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    fetchRecords,
    bindRecord,
  }
})
