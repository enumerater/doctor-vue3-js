import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/diagnosis'

export const useDiagnosisStore = defineStore('diagnosis', () => {
  // ====== 状态 ======
  const records = ref([])
  const currentRecord = ref(null)
  const stats = ref({ total: 0, diseased: 0, healthy: 0, cropDistribution: [], diseaseDistribution: [] })
  const loading = ref(false)
  const filters = ref({
    cropType: '',
    diseaseName: '',
    dateFrom: '',
    dateTo: '',
    hasDisease: '', // '' = 全部, 'true' = 病害, 'false' = 健康
  })

  // ====== 计算属性 ======
  const filteredRecords = computed(() => {
    let list = [...records.value]
    const f = filters.value

    if (f.cropType) {
      list = list.filter((r) => r.cropType === f.cropType)
    }
    if (f.diseaseName) {
      list = list.filter((r) => r.diseaseName && r.diseaseName.includes(f.diseaseName))
    }
    if (f.hasDisease !== '' && f.hasDisease !== null && f.hasDisease !== undefined) {
      const val = f.hasDisease === true || f.hasDisease === 'true'
      list = list.filter((r) => r.hasDisease === val)
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
  const diseasedCount = computed(() => stats.value.diseased)
  const healthyCount = computed(() => stats.value.healthy)

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
      // 更新统计
      stats.value.total++
      if (record.hasDisease) {
        stats.value.diseased++
      } else {
        stats.value.healthy++
      }
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
    const removed = records.value.find((r) => r.id === id)
    records.value = records.value.filter((r) => r.id !== id)
    // 更新统计
    if (removed) {
      stats.value.total--
      if (removed.hasDisease) {
        stats.value.diseased--
      } else {
        stats.value.healthy--
      }
    }
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
      diseaseName: '',
      dateFrom: '',
      dateTo: '',
      hasDisease: '',
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
