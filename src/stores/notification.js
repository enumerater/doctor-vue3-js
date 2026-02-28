import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const total = ref(0)
  const unreadCount = ref(0)
  const unreadSummary = ref({ total: 0, types: {} })
  const loading = ref(false)

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      const res = await api.getNotifications({
        page: 1,
        pageSize: 20,
        ...params
      })
      notifications.value = res.list
      total.value = res.total
      unreadCount.value = res.unreadTotal
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadSummary() {
    const res = await api.getUnreadSummary()
    unreadSummary.value = res
    unreadCount.value = res.total
  }

  async function fetchUnreadCount() {
    await fetchUnreadSummary()
  }

  async function markAsRead(ids) {
    const idList = Array.isArray(ids) ? ids : [ids]
    await api.markNotificationsRead(idList)
    
    // 更新本地状态
    notifications.value.forEach(n => {
        if (idList.includes(n.id)) n.read = true
    })
    await fetchUnreadSummary()
  }

  async function markAllAsRead() {
    await api.markNotificationsRead('all')
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
    unreadSummary.value = { total: 0, types: {} }
  }

  async function deleteNotifications(ids) {
    const idList = Array.isArray(ids) ? ids : [ids]
    await api.deleteNotifications(idList)
    notifications.value = notifications.value.filter(n => !idList.includes(n.id))
    await fetchUnreadSummary()
  }

  return {
    notifications,
    total,
    unreadCount,
    unreadSummary,
    loading,
    hasUnread,
    fetchNotifications,
    fetchUnreadSummary,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
  }
})
