import { defineStore } from 'pinia'
import { getMessage } from '@/axios/chat'
import { createSession } from '@/axios/session'
import { useSidebarStore } from './sidebar'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '',
    chatMessages: [],
    currentRobotMsgIndex: -1,
    inputValue: '',
    autoSendPending: false,
    pendingTransferImageUrl: '',
    selectedModel: 'qwen-flash',
  }),
  actions: {
    setSelectedModel(model) {
      this.selectedModel = model
    },
    setCurrentSessionId(sessionId) {
      this.currentSessionId = sessionId
    },
    clearMessages() {
      this.chatMessages = []
      this.currentRobotMsgIndex = -1
    },
    setInputValue(value) {
      this.inputValue = value
    },
    clearInputValue() {
      this.inputValue = ''
    },
    handleHotQuestionClick(question) {
      this.setInputValue(question)
    },
    clearAutoSend() {
      this.autoSendPending = false
      this.pendingTransferImageUrl = ''
    },

    async fetchMessages(sessionId) {
      if (!sessionId) return
      this.clearMessages()
      try {
        const res = await getMessage(sessionId)
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data.map((msg) => ({
            ...msg,
            messageContent: msg.messageContent || msg.content || '',
            messageRole: msg.messageRole || (msg.type === 'user' ? '0' : '1'),
            isImageMessage: false,
          }))
        }
      } catch (err) {
        console.error('获取历史消息失败：', err)
      }
    },

    async prepareMessage(content, userId, sessionId) {
      const trimmedContent = content.trim()
      if (!trimmedContent) return Promise.reject(new Error('消息内容不能为空'))
      this.clearInputValue()
      const sidebarStore = useSidebarStore()
      const fullSessionId = `${userId}${sessionId}`

      if (this.chatMessages.length === 0 && sessionId) {
        try {
          await createSession({
            userId,
            sessionTitle: trimmedContent.substring(0, 20),
            sessionId: fullSessionId,
            agent: sidebarStore.isAgricultureAgent, // 使用布尔值字段
          })
          await sidebarStore.refreshHistory()
        } catch (err) {
          console.warn('创建会话失败', err)
        }
      }

      this.chatMessages.push({
        type: 'user',
        messageContent: trimmedContent,
        messageRole: '0',
      })

      this.chatMessages.push({
        type: 'robot',
        messageContent: '',
        messageRole: '1',
      })
      this.currentRobotMsgIndex = this.chatMessages.length - 1
      return Promise.resolve()
    },

    async startStreaming(content, image, userId, sessionId, TOKEN) {
      try {
        const apiPath = '/chat/memory'
        const baseApi = import.meta.env.VITE_APP_BASE_API
        const fullApiPath = new URL(
          `${baseApi.startsWith('http') ? '' : window.location.origin}${baseApi}${apiPath}`,
        ).href

        const url = new URL(fullApiPath)
        url.searchParams.append('prompt', content || '')
        url.searchParams.append('image', image || '')
        url.searchParams.append('userId', userId || '')
        url.searchParams.append('sessionId', sessionId || '')
        url.searchParams.append('model', this.selectedModel || 'qwen-flash')

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'text/event-stream', Authorization: TOKEN },
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()

          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const chunk = line.replace('data:', '').trim()
            if (!chunk || chunk === '[DONE]') continue
            const currentMsg = this.chatMessages[this.currentRobotMsgIndex]
            if (currentMsg) currentMsg.messageContent += chunk
          }
        }
      } catch (error) {
        console.error('流式异常', error)
        if (this.currentRobotMsgIndex >= 0) {
          this.chatMessages[this.currentRobotMsgIndex].messageContent = '服务响应异常，请稍后重试'
        }
      }
    },

    async sendMessage(content, image, userId, sessionId, TOKEN) {
      await this.prepareMessage(content, userId, sessionId)
      this.startStreaming(content, image, userId, sessionId, TOKEN)
    },
  },
})
