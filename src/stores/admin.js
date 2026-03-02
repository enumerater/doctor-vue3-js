import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/admin'
import * as knowledgeApi from '@/axios/knowledge'

export const useAdminStore = defineStore('admin', () => {
  const systemStats = ref({
    totalUsers: 0,
    activeToday: 0,
    totalDiagnoses: 0,
    diagnosesToday: 0,
    avgAccuracy: 0,
    knowledgeEntries: 0,
    feedbackCount: 0,
    feedbackPending: 0,
  })
  const users = ref([])
  const usersTotal = ref(0)
  const knowledgeList = ref([])
  const knowledgeTotal = ref(0)
  const loading = ref(false)

  // 日志相关状态
  const logs = ref([])
  const logsTotal = ref(0)
  const logStatusStats = ref({})
  const logTrendStats = ref([])

  async function fetchSystemStats() {
    systemStats.value = await api.getSystemStats()
  }

  async function fetchLogPage(params = {}) {
    loading.value = true
    try {
      const res = await api.getLogPage(params)
      if (res && res.code === 200) {
        logs.value = res.data.records
        logsTotal.value = res.data.total
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchLogStatusStats() {
    const res = await api.getLogStatusStats()
    if (res && res.code === 200) {
      logStatusStats.value = res.data
    }
  }

  async function fetchLogTrendStats(params = {}) {
    const res = await api.getLogTrendStats(params)
    if (res && res.code === 200) {
      logTrendStats.value = res.data
    }
  }

  async function fetchUsers(params = {}) {
    loading.value = true
    try {
      const res = await api.getUsers(params)
      users.value = res.list.map((u) => ({
        ...u,
        status: u.status == 1 ? 'active' : u.status === 'active' ? 'active' : 'disabled',
        role: u.role == 1 ? 'admin' : u.role === 'admin' ? 'admin' : 'user',
      }))
      usersTotal.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function toggleUserStatus(id) {
    await api.toggleUserStatus(id)
    const user = users.value.find((u) => u.id === id)
    if (user) user.status = user.status === 'active' ? 'disabled' : 'active'
  }

  async function fetchKnowledge(params = {}) {
    loading.value = true
    try {
      const res = await knowledgeApi.getDiseaseList(params)
      const list = res.records || res.list || []
      // pics 是后端 JSON 字符串，解析为数组方便前端使用
      knowledgeList.value = list.map((item) => ({
        ...item,
        parsedPics: parsePics(item.pics),
      }))
      knowledgeTotal.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function parsePics(pics) {
    if (!pics) return []
    if (Array.isArray(pics)) return pics
    try {
      const arr = JSON.parse(pics)
      return Array.isArray(arr) ? arr : []
    } catch {
      return pics.split(',').filter(Boolean)
    }
  }

  async function deleteKnowledge(id) {
    await knowledgeApi.deleteDisease(id)
    knowledgeList.value = knowledgeList.value.filter((k) => k.id !== id)
    knowledgeTotal.value = Math.max(0, knowledgeTotal.value - 1)
  }

  async function createKnowledge(data) {
    const result = await knowledgeApi.createDisease(data)
    if (result) knowledgeList.value.unshift(result)
    return result
  }

  async function updateKnowledge(id, data) {
    const result = await knowledgeApi.updateDisease(id, data)
    const idx = knowledgeList.value.findIndex((k) => k.id === id)
    if (idx >= 0 && result) knowledgeList.value[idx] = result
    return result
  }

  return {
    systemStats,
    users,
    usersTotal,
    knowledgeList,
    knowledgeTotal,
    loading,
    logs,
    logsTotal,
    logStatusStats,
    logTrendStats,
    fetchSystemStats,
    fetchLogPage,
    fetchLogStatusStats,
    fetchLogTrendStats,
    fetchUsers,
    toggleUserStatus,
    fetchKnowledge,
    deleteKnowledge,
    createKnowledge,
    updateKnowledge,
  }
})
