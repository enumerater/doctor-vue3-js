import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/diagnosis'

export const useDiagnosisStore = defineStore('diagnosis', () => {
  // ====== 状态 ======
  const records = ref([])
  const currentRecord = ref(null)
  const stats = ref({ total: 0, healthy: 0, diseased: 0, cropDistribution: [] })
  const loading = ref(false)
  
  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalRecords = ref(0)

  const filters = ref({
    cropType: '',
    resultType: '', // 健康/不健康筛选
  })

  // ====== 计算属性 ======
  // 前端不再做复杂过滤，直接返回记录，过滤由后端完成
  const filteredRecords = computed(() => records.value)

  const totalCount = computed(() => totalRecords.value || stats.value.total)
  const diseasedCount = computed(() => stats.value.diseased || 0)
  const healthyCount = computed(() => stats.value.healthy || 0)

  // ====== 操作 ======

  async function fetchRecords() {
    loading.value = true
    try {
      const res = await api.getDiagnoses({
        page: currentPage.value,
        pageSize: pageSize.value,
        cropType: filters.value.cropType,
        resultType: filters.value.resultType
      })
      
      const list = res.list || []
      totalRecords.value = res.total || 0

      // 解析 result 字符串提取 resultType（用于 UI 显示）
      records.value = list.map(r => {
        if (!r.resultType && r.result) {
          try {
            const parsed = typeof r.result === 'string' ? JSON.parse(r.result) : r.result
            r.resultType = parsed.type
          } catch (e) {
            // console.error('Failed to parse result for record:', r.id)
          }
        }
        return r
      })
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
    currentPage.value = 1 // 切换筛选条件时重置页码
    fetchRecords()
  }

  function changePage(page) {
    currentPage.value = page
    fetchRecords()
  }

  function resetFilters() {
    filters.value = {
      cropType: '',
      resultType: '',
    }
    currentPage.value = 1
    fetchRecords()
  }

  return {
    records,
    currentRecord,
    stats,
    loading,
    currentPage,
    pageSize,
    totalRecords,
    filters,
    filteredRecords,
    totalCount,
    diseasedCount,
    healthyCount,
    // Actions
    fetchRecords,
    fetchDetail,
    createDiagnosis,
    updateNotes,
    deleteRecord,
    fetchStats,
    setFilter,
    changePage,
    resetFilters,
    // computed
    cropTypes: computed(() => {
      // 从统计数据或者全量获取（如果后端支持）
      // 这里暂时保留从已有 records 提取逻辑，或者由用户通过 search 指定
      const types = new Set(records.value.map((r) => r.cropType).filter(Boolean))
      return [...types]
    }),
  }
})
