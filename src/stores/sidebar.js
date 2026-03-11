// stores/sidebar.js
import { defineStore } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useAgentStore } from '@/stores/agent'
import { useSkillsStore } from '@/stores/skills'
import router from '@/router/index.js'
import { getAllSession, deleteSession } from '@/axios/session'
import { updateSesssionId, getUser } from '@/axios/user'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showLeft: false,
    sidebarCollapsed: false, // PC端侧边栏折叠状态
    historyList: [],
    refreshTrigger: false,
    searchKeyword: '',
    activeItemId: '',
    isAgricultureAgent: false, // 农业Agent模式开关
    agentImageUploadEnabled: false, // Agent模式下图片上传按钮是否启用（基于skill配置）
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
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    closeLeft() {
      this.showLeft = false
    },
    async fetchHistoryList() {
      try {
        const res = await getAllSession()
        this.historyList = res.data || []
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
    async selectHistoryItem(sessionId, isAgent = false) {
      const chatStore = useChatStore()
      const userId = localStorage.getItem('id')

      const partialSessionId = sessionId.startsWith(userId)
        ? sessionId.substring(userId.length)
        : sessionId

      // 1. 只更新模式状态
      this.isAgricultureAgent = !!isAgent
      this.agentImageUploadEnabled = isAgent ? !!(useSkillsStore().isSkillEnabled('disease-recognition')) : false

      // 2. 立即跳转，由详情页 loadHistory 内部对比 ID 后再决定是否 fetch
      router.push({
        name: 'chatDetail',
        params: { sessionId: sessionId },
      })
    },
    // 准备新对话：只更新 sessionId，不创建会话记录（避免空会话出现在历史记录）
    async prepareConversation() {
      const chatStore = useChatStore()
      const userId = localStorage.getItem('id')

      try {
        // 重置 Agent 模式为普通对话模式（仅在手动创建新对话时）
        this.isAgricultureAgent = false
        this.agentImageUploadEnabled = false

        await updateSesssionId({ userId })

        const userRes = await getUser({ id: userId })
        const partialSessionId = userRes.data.sessionId
        localStorage.setItem('sessionId', partialSessionId)
        // 设置当前会话ID为部分的sessionId，因为还没有完整的sessionId（需要userId前缀）
        const fullSessionId = `${userId}${partialSessionId}`
        chatStore.setCurrentSessionId(fullSessionId)
        chatStore.clearMessages()
      } catch (err) {
        console.error('准备新对话失败：', err)
        throw err
      }
    },
    // 重置对话：只更新sessionId和清空消息，不创建会话记录（会话创建由prepareMessage统一处理）
    async resetConversation() {
      const chatStore = useChatStore()
      const userId = localStorage.getItem('id')

      try {
        // 重置 Agent 模式为普通对话模式
        this.isAgricultureAgent = false
        this.agentImageUploadEnabled = false

        await updateSesssionId({ userId })

        const userRes = await getUser({ id: userId })
        const partialSessionId = userRes.data.sessionId
        localStorage.setItem('sessionId', partialSessionId)
        // 设置当前会话ID为部分的sessionId，因为还没有完整的sessionId（需要userId前缀）
        chatStore.setCurrentSessionId(partialSessionId)

        router.push({ name: 'chatHome' })
        this.closeLeft()
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
    // 切换农业Agent模式
    toggleAgricultureAgent() {
      this.isAgricultureAgent = !this.isAgricultureAgent
      // 如果开启农业Agent模式，检查是否启用了图片检测skill
      if (this.isAgricultureAgent) {
        const chatStore = useChatStore()
        const skillsStore = useSkillsStore()
        const hasImageSkill = skillsStore.isSkillEnabled('disease-recognition')
        this.agentImageUploadEnabled = hasImageSkill
        chatStore.clearMessages()
      } else {
        // 关闭Agent模式时，也关闭图片上传按钮
        this.agentImageUploadEnabled = false
      }
    },
    // 设置农业Agent模式
    setAgricultureAgent(enabled) {
      this.isAgricultureAgent = enabled
    },
    // 设置Agent模式下图片上传按钮是否启用
    setAgentImageUploadEnabled(enabled) {
      this.agentImageUploadEnabled = enabled
    },
    // 从视觉识别/对话结果传递到Agent模式
    async transferToAgent(promptText, imageUrl = null) {
      const chatStore = useChatStore()
      const skillsStore = useSkillsStore()
      try {
        // 1. 开启Agent模式
        this.isAgricultureAgent = true
        // 检查是否启用了图片检测skill
        const hasImageSkill = skillsStore.isSkillEnabled('disease-recognition')
        this.agentImageUploadEnabled = hasImageSkill
        // 2. 准备新会话
        await this.prepareConversation()
        // 3. 设置待发送内容
        chatStore.setInputValue(promptText)
        chatStore.pendingTransferImageUrl = imageUrl || ''
        chatStore.autoSendPending = true
        // 4. 导航到ChatHome（watcher会自动触发发送）
        router.push({ name: 'chatHome' })
      } catch (err) {
        console.error('传递到Agent失败：', err)
        chatStore.clearAutoSend()
        throw err
      }
    },
  },
})
