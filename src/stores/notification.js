import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      notifications.value = await api.getNotifications(params)
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    unreadCount.value = await api.getUnreadCount()
  }

  async function markAsRead(id) {
    await api.markAsRead(id)
    const ntf = notifications.value.find((n) => n.id === id)
    if (ntf && !ntf.read) {
      ntf.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead() {
    await api.markAllAsRead()
    notifications.value.forEach((n) => (n.read = true))
    unreadCount.value = 0
  }

  async function deleteNotification(id) {
    const ntf = notifications.value.find((n) => n.id === id)
    await api.deleteNotification(id)
    notifications.value = notifications.value.filter((n) => n.id !== id)
    if (ntf && !ntf.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
})
