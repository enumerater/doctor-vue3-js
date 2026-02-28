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

  async function deleteRecord(id) {
    loading.value = true
    try {
      await api.deletePlotDiagnosis(id)
      records.value = records.value.filter((r) => r.id !== id)
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    fetchRecords,
    bindRecord,
    deleteRecord,
  }
})
