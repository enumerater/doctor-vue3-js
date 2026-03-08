import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    ws: null,
    status: 'disconnected', // 'connected', 'connecting', 'disconnected', 'error'
    messages: [], // 格式: { type, content, payload, timestamp }
    isThinking: false,
    currentThought: '',
    currentTool: null,
    pendingConfirm: null, // { content, payload }
    pendingAsk: null, // { content }
    reconnectCount: 0,
    maxReconnectAttempts: 5,
    heartbeatTimer: null,
    sessionId: null,
    currentTurnSteps: [], // 用于存储当前回合的思考步骤
  }),
  actions: {
    connect(sessionId = null) {
      if (
        this.ws &&
        (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
      )
        return

      this.sessionId = sessionId
      const userStore = useUserStore()
      const token = localStorage.getItem('token')
      const userId = userStore.userInfo?.id

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const baseApi = import.meta.env.VITE_APP_BASE_API

      let wsBase
      if (baseApi.startsWith('http')) {
        wsBase = baseApi.replace(/^http/, 'ws')
      } else {
        wsBase = `${protocol}//${host}${baseApi}`
      }

      // 根据需求文档连接地址: ws://[服务器地址]/ws/agent
      const wsUrl = `${wsBase}/ws/agent?token=${token}&userId=${userId}${sessionId ? `&sessionId=${sessionId}` : ''}`

      this.status = 'connecting'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.status = 'connected'
        this.reconnectCount = 0
        this.startHeartbeat()
        console.log('Agent WebSocket connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'heartbeat_pong') return
          this.handleIncomingMessage(data)
        } catch (e) {
          console.error('Failed to parse Agent message:', e)
        }
      }

      this.ws.onclose = () => {
        this.status = 'disconnected'
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.ws.onerror = (err) => {
        this.status = 'error'
        console.error('Agent WebSocket error:', err)
      }
    },

    disconnect() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
      this.status = 'disconnected'
      this.stopHeartbeat()
      this.isThinking = false
      this.currentThought = ''
      this.currentTool = null
    },

    attemptReconnect() {
      if (this.reconnectCount < this.maxReconnectAttempts) {
        this.reconnectCount++
        setTimeout(() => {
          console.log(
            `Attempting to reconnect agent (${this.reconnectCount}/${this.maxReconnectAttempts})...`,
          )
          this.connect(this.sessionId)
        }, 3000 * this.reconnectCount)
      }
    },

    startHeartbeat() {
      this.stopHeartbeat()
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'heartbeat' }))
        }
      }, 30000)
    },

    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    },

    handleIncomingMessage(msg) {
      const { type, content, payload, timestamp } = msg
      const timestampVal = timestamp || Date.now()

      // 统一格式化消息
      const formattedMsg = {
        type,
        content: content || '',
        payload: payload || null,
        timestamp: timestampVal,
        role: this.getRoleByType(type),
      }

      switch (type) {
        case 'thought':
          this.isThinking = true
          this.currentThought = content
          this.currentTool = null // 既然有新思考，说明上一个工具调用可能已结束或处于新阶段
          // 记录到当前消息的步骤中
          this.addToCurrentSteps(formattedMsg)
          break
        case 'tool_call':
          this.isThinking = true
          this.currentTool = payload
          this.addToCurrentSteps(formattedMsg)
          break
        case 'confirm':
          this.isThinking = false
          this.pendingConfirm = { content, payload }
          this.messages.push(formattedMsg)
          break
        case 'ask':
          this.isThinking = false
          this.pendingAsk = { content }
          this.messages.push(formattedMsg)
          break
        case 'final_result':
          this.isThinking = false
          this.currentThought = ''
          this.currentTool = null
          // 将累积的步骤放入最终结果消息中
          formattedMsg.steps = [...this.currentTurnSteps]
          this.messages.push(formattedMsg)
          // 清空当前步骤
          this.currentTurnSteps = []
          // 收到最终结果，保存对话记录（同旧版逻辑）
          this.saveFinishedMessage()
          break
        case 'error':
          this.isThinking = false
          this.messages.push(formattedMsg)
          break
        default:
          this.messages.push(formattedMsg)
      }
    },

    addToCurrentSteps(step) {
      // 如果是 thought，且上一个也是 thought，则更新而不是新增，保持简洁
      const lastStep = this.currentTurnSteps[this.currentTurnSteps.length - 1]
      if (lastStep && lastStep.type === 'thought' && step.type === 'thought') {
        lastStep.content = step.content
        lastStep.timestamp = step.timestamp
      } else {
        this.currentTurnSteps.push(step)
      }
    },

    async saveFinishedMessage() {
      const userStore = useUserStore()
      const userId = userStore.userInfo?.id
      if (!userId || !this.sessionId) return

      // 找到最后一条机器人消息和它之前的最后一条用户消息
      const lastRobotMsg = this.messages.filter(m => m.type === 'final_result').slice(-1)[0]
      const userMessages = this.messages.filter(m => m.type === 'user_input')
      const lastUserMsg = userMessages.slice(-1)[0]
      
      if (!lastRobotMsg || !lastUserMsg) return

      const fullSessionId = this.sessionId.startsWith(userId) 
        ? this.sessionId 
        : `${userId}${this.sessionId}`

      try {
        const { saveAgentMessage } = await import('@/axios/chat')
        await saveAgentMessage({
          sessionId: fullSessionId,
          userMessage: lastUserMsg.content,
          robotMessage: {
            steps: lastRobotMsg.steps || [],
            finalContent: lastRobotMsg.content,
          },
        })
        console.log('Agent消息保存成功')
      } catch (err) {
        console.warn('Agent消息保存失败', err)
      }
    },

    getRoleByType(type) {
      if (['user_input', 'user_confirm', 'user_ask'].includes(type)) return 'user'
      return 'robot'
    },

    updateOrPushMessage(msg) {
      // 对于 thought 和 tool_call，我们可以选择更新最后一条同类型的消息，或者总是 push
      // 按照需求，展示 AI 的思考过程或正在调用的工具名称
      const lastMsg = this.messages[this.messages.length - 1]
      if (lastMsg && lastMsg.type === msg.type && msg.type === 'thought') {
        lastMsg.content = msg.content
        lastMsg.timestamp = msg.timestamp
      } else {
        this.messages.push(msg)
      }
    },

    userInput(content) {
      const msg = {
        type: 'user_input',
        content,
        timestamp: Date.now()
      }
      this.messages.push({ ...msg, role: 'user' })
      this.sendRaw(msg)
    },

    submitConfirm(confirmed) {
      const msg = {
        type: 'user_confirm',
        payload: confirmed,
        timestamp: Date.now(),
      }
      // 添加一条用户展示消息
      this.messages.push({
        type: 'user_input',
        content: confirmed ? '确认执行' : '取消执行',
        role: 'user',
        timestamp: Date.now(),
      })
      this.sendRaw(msg)
      this.pendingConfirm = null
    },

    submitAsk(content) {
      const msg = {
        type: 'user_ask',
        content,
        timestamp: Date.now(),
      }
      this.messages.push({
        type: 'user_input',
        content,
        role: 'user',
        timestamp: Date.now(),
      })
      this.sendRaw(msg)
      this.pendingAsk = null
    },

    sendRaw(data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data))
      } else {
        console.error('Agent WebSocket is not connected')
        // 如果断开了尝试连接并发送 (此处简单处理)
        this.connect(this.sessionId)
      }
    },

    clearMessages() {
      this.messages = []
      this.isThinking = false
      this.currentThought = ''
      this.currentTool = null
      this.pendingConfirm = null
      this.pendingAsk = null
    },
  },
})
