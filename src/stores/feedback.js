import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/feedback'

export const useFeedbackStore = defineStore('feedback', () => {
  const currentFeedback = ref(null)
  const feedbacks = ref([])
  const stats = ref({ total: 0, correct: 0, partial: 0, incorrect: 0, accuracyRate: 0, avgRating: '0.0' })
  const loading = ref(false)

  async function submitFeedback(data) {
    loading.value = true
    try {
      const result = await api.submitFeedback(data)
      currentFeedback.value = result
      return result
    } finally {
      loading.value = false
    }
  }

  async function fetchByDiagnosis(diagnosisId) {
    const result = await api.getFeedbackByDiagnosis(diagnosisId)
    currentFeedback.value = result
    return result
  }

  async function fetchFeedbacks(params = {}) {
    loading.value = true
    try {
      feedbacks.value = await api.getFeedbacks(params)
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id, status) {
    await api.updateFeedbackStatus(id, status)
    const fb = feedbacks.value.find((f) => f.id === id)
    if (fb) fb.status = status
  }

  async function fetchStats() {
    stats.value = await api.getFeedbackStats()
  }

  function reset() {
    currentFeedback.value = null
  }

  return {
    currentFeedback,
    feedbacks,
    stats,
    loading,
    submitFeedback,
    fetchByDiagnosis,
    fetchFeedbacks,
    updateStatus,
    fetchStats,
    reset,
  }
})
