// stores/sidebar.js
import { defineStore } from 'pinia'
import { useChatStore } from '@/stores/chat'
import router from '@/router/index.js'
import { getAllSession, deleteSession, createSession } from '@/axios/session'
import { updateSesssionId, getUser } from '@/axios/user'

export const useNetStore = defineStore('net', {
  state: () => ({
    ifNet: false,
    historyList: [],
    refreshTrigger: false,
    searchKeyword: '',
    activeItemId: '',
  }),
  getters: {
    filteredHistory: (state) => {
      if (!state.searchKeyword.trim()) return state.historyList
      return state.historyList.filter((item) => item.sessionTitle?.includes(state.searchKeyword))
    },
  },
  actions: {
    toggleLeft(visible) {
      this.showLeft = visible ?? !this.showLeft
    },
    closeLeft() {
      this.showLeft = false
    },
    async fetchHistoryList() {
      try {
        const res = await getAllSession()
        this.historyList = res.data || []
        console.log('历史记录加载成功：', res.data)
        return res.data
      } catch (err) {
        console.error('加载历史记录失败：', err)
        this.historyList = []
        throw err
      }
    },
    async refreshHistory() {
      this.refreshTrigger = true
      await this.fetchHistoryList()
      this.refreshTrigger = false
    },
    async deleteHistoryItem(id) {
      try {
        await deleteSession(id)
        this.historyList = this.historyList.filter((item) => item.id !== id)
        if (this.activeItemId === id) {
          this.activeItemId = this.historyList[0]?.id || ''
        }
        console.log('删除历史记录成功')
      } catch (err) {
        console.error('删除历史记录失败：', err)
        throw err
      }
    },
    async selectHistoryItem(sessionId) {
      const chatStore = useChatStore()

      // 1. 更新会话ID并加载消息
      chatStore.setCurrentSessionId(sessionId)
      await chatStore.fetchMessages(sessionId)

      router.push({
        name: 'chatDetail',
        params: { sessionId: sessionId },
      })
      this.closeLeft()
    },
    async resetConversation() {
      const chatStore = useChatStore()
      const userId = localStorage.getItem('id')

      try {
        await updateSesssionId({ userId })

        const userRes = await getUser({ id: userId })
        const newSessionId = userRes.data.sessionId
        localStorage.setItem('sessionId', newSessionId)
        chatStore.setCurrentSessionId(newSessionId)

        const fullSessionId = `${userId}${newSessionId}`
        await createSession({
          userId,
          sessionTitle: '新会话',
          sessionId: fullSessionId,
        })

        router.push({ name: 'chatBegin' })
        this.closeLeft()
        await this.refreshHistory()
        chatStore.clearMessages()
      } catch (err) {
        console.error('创建新对话失败：', err)
        throw err
      }
    },
    handleGetMessage(sessionId) {
      const chatStore = useChatStore()
      chatStore.setCurrentSessionId(sessionId)
      router.push({ name: 'chatDetail', params: { sessionId } })
    },
  },
})
