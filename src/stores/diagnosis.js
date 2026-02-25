import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/diagnosis'

export const useDiagnosisStore = defineStore('diagnosis', () => {
  // ====== 状态 ======
  const records = ref([])
  const currentRecord = ref(null)
  const stats = ref({ total: 0, cropDistribution: [] })
  const loading = ref(false)
  const filters = ref({
    cropType: '',
    dateFrom: '',
    dateTo: '',
  })

  // ====== 计算属性 ======
  const filteredRecords = computed(() => {
    let list = [...records.value]
    const f = filters.value

    if (f.cropType) {
      list = list.filter((r) => r.cropType === f.cropType)
    }
    if (f.dateFrom) {
      list = list.filter((r) => r.createdAt >= f.dateFrom)
    }
    if (f.dateTo) {
      const to = f.dateTo + (f.dateTo.length === 10 ? 'T23:59:59.999Z' : '')
      list = list.filter((r) => r.createdAt <= to)
    }

    return list
  })

  const totalCount = computed(() => stats.value.total)
  const diseasedCount = computed(() => stats.value.diseased || 0)
  const healthyCount = computed(() => stats.value.healthy || 0)
  const nonCropCount = computed(() => stats.value.nonCrop || 0)

  const cropTypes = computed(() => {
    const types = new Set(records.value.map((r) => r.cropType).filter(Boolean))
    return [...types]
  })

  // ====== 操作 ======

  async function fetchRecords() {
    loading.value = true
    try {
      records.value = await api.getDiagnoses()
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id) {
    loading.value = true
    try {
      currentRecord.value = await api.getDiagnosisDetail(id)
    } finally {
      loading.value = false
    }
  }

  async function createDiagnosis(data) {
    const record = await api.createDiagnosis(data)
    if (record) {
      records.value.unshift(record)
      stats.value.total++
    }
    return record
  }

  async function updateNotes(id, notes) {
    const record = await api.updateDiagnosis(id, { notes })
    if (record && currentRecord.value && currentRecord.value.id === id) {
      currentRecord.value.notes = notes
    }
    // 同步列表中的记录
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx >= 0) {
      records.value[idx].notes = notes
    }
    return record
  }

  async function deleteRecord(id) {
    await api.deleteDiagnosis(id)
    records.value = records.value.filter((r) => r.id !== id)
    stats.value.total = Math.max(0, stats.value.total - 1)
  }

  async function fetchStats() {
    stats.value = await api.getDiagnosisStats()
  }

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function resetFilters() {
    filters.value = {
      cropType: '',
      dateFrom: '',
      dateTo: '',
    }
  }

  return {
    records,
    currentRecord,
    stats,
    loading,
    filters,
    filteredRecords,
    totalCount,
    diseasedCount,
    healthyCount,
    nonCropCount,
    cropTypes,
    fetchRecords,
    fetchDetail,
    createDiagnosis,
    updateNotes,
    deleteRecord,
    fetchStats,
    setFilter,
    resetFilters,
  }
})
