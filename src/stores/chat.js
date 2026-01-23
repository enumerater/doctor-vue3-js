// src/stores/chat.js
import { defineStore } from 'pinia'
import { getMessage } from '@/axios/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '', // 当前选中的会话ID
    chatMessages: [], // 当前会话的消息列表
  }),
  actions: {
    // 设置当前会话ID
    setCurrentSessionId(sessionId) {
      this.currentSessionId = sessionId
    },
    // 清空消息列表
    clearMessages() {
      this.chatMessages = []
    },
    // 根据sessionId获取历史消息
    async fetchMessages(sessionId) {
      if (!sessionId) return
      this.clearMessages() // 先清空旧消息
      try {
        console.log('请求历史消息：', sessionId)

        const res = await getMessage({ sessionId: sessionId })
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data // 存入全局状态
        }

        console.log('8451984651984651{}', res)
      } catch (err) {
        console.error('获取历史消息失败：', err)
        this.chatMessages = [{ type: 'robot', content: '获取历史记录失败，请重试' }]
      }
    },
    // 添加用户消息
    addUserMessage(content) {
      this.chatMessages.push({ type: 'user', content })
    },
    // 添加机器人消息（流式拼接）
    addRobotMessage(chunk) {
      // 找到最后一条机器人消息，拼接内容；如果没有则新建
      const lastMsg = this.chatMessages[this.chatMessages.length - 1]
      if (lastMsg && lastMsg.type === 'robot') {
        lastMsg.content += chunk
      } else {
        this.chatMessages.push({ type: 'robot', content: chunk })
      }
    },
    // 初始化机器人消息（流式请求前调用）
    initRobotMessage() {
      this.chatMessages.push({ type: 'robot', content: '' })
    },
  },
})
