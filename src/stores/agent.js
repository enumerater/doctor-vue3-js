import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
import { getMessage } from '@/axios/chat'
import { MSG_TYPE, isUserType } from '@/constants/agentProtocol'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    ws: null,
    status: 'disconnected', // 'connected' | 'connecting' | 'disconnected' | 'error'
    messages: [],            // 完整消息列表 { type, content, role, timestamp, steps?, images? }
    currentTurnSteps: [],    // 当前回合累积的步骤
    isThinking: false,       // 是否正在思考
    currentThought: '',      // 当前思考文本（实时展示用）
    activeTool: null,        // 当前正在调用的工具名称
    pendingConfirm: null,    // { content, payload }
    pendingAsk: null,        // { content, userInput: '' }
    sessionId: null,
    reconnectCount: 0,
    maxReconnectAttempts: 5,
    heartbeatTimer: null,
  }),

  actions: {
    // ========================
    // 连接管理
    // ========================
    connect(sessionId = null) {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return

      this.sessionId = sessionId
      const userStore = useUserStore()
      const token = localStorage.getItem('token')
      const userId = userStore.userInfo?.id
      const baseApi = import.meta.env.VITE_APP_BASE_API

      let wsBase
      if (baseApi.startsWith('http')) {
        wsBase = baseApi.replace(/^http/, 'ws')
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        wsBase = `${protocol}//${window.location.host}${baseApi}`
      }

      const wsUrl = `${wsBase}/ws/agent?token=${token}&userId=${userId}${sessionId ? `&sessionId=${sessionId}` : ''}`
      this.status = 'connecting'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.status = 'connected'
        this.reconnectCount = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === MSG_TYPE.HEARTBEAT_PONG) return
          this.handleMessage(data)
        } catch (e) {
          console.error('Agent message parse error:', e)
        }
      }

      this.ws.onclose = () => {
        this.status = 'disconnected'
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.ws.onerror = () => {
        this.status = 'error'
      }
    },

    disconnect() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
      this.status = 'disconnected'
      this.stopHeartbeat()
      this.resetTurnState()
    },

    attemptReconnect() {
      if (this.reconnectCount < this.maxReconnectAttempts) {
        this.reconnectCount++
        setTimeout(() => this.connect(this.sessionId), 3000 * this.reconnectCount)
      }
    },

    // ========================
    // 心跳
    // ========================
    startHeartbeat() {
      this.stopHeartbeat()
      this.heartbeatTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: MSG_TYPE.HEARTBEAT }))
        }
      }, 30000)
    },

    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    },

    // ========================
    // 消息处理核心
    // ========================
    handleMessage(msg) {
      const { type, content, payload, tool, timestamp } = msg
      const ts = timestamp || Date.now()

      switch (type) {
        // --- 思考类 ---
        case MSG_TYPE.THOUGHT:
          this.isThinking = true
          this.currentThought = content || ''
          this.activeTool = null
          break

        case MSG_TYPE.THOUGHT_RESULT:
          this.isThinking = true
          this.currentThought = ''
          this.currentTurnSteps.push({
            type: 'thought_result',
            content: content || '',
            timestamp: ts,
          })
          break

        // --- 工具类 ---
        case MSG_TYPE.TOOL_CALL:
          this.isThinking = true
          this.currentThought = ''
          this.activeTool = tool || null
          this.currentTurnSteps.push({
            type: 'tool',
            tool: tool || 'unknown',
            status: 'calling',
            callContent: content || '',
            resultContent: '',
            payload: payload || null,
            timestamp: ts,
          })
          break

        case MSG_TYPE.TOOL_RESULT: {
          this.activeTool = null
          // 找到最后一个匹配的 calling 状态工具步骤
          const toolStep = [...this.currentTurnSteps]
            .reverse()
            .find(s => s.type === 'tool' && s.tool === (tool || 'unknown') && s.status === 'calling')
          if (toolStep) {
            toolStep.status = 'completed'
            toolStep.resultContent = content || ''
            if (payload) toolStep.resultPayload = payload
          } else {
            // 没找到匹配的 tool_call，作为独立步骤
            this.currentTurnSteps.push({
              type: 'tool',
              tool: tool || 'unknown',
              status: 'completed',
              callContent: '',
              resultContent: content || '',
              payload: payload || null,
              timestamp: ts,
            })
          }
          break
        }

        // --- 交互类 ---
        case MSG_TYPE.CONFIRM:
          this.isThinking = false
          this.pendingConfirm = { content: content || '', payload }
          this.messages.push({
            type: 'confirm',
            content: content || '',
            payload,
            role: 'robot',
            timestamp: ts,
          })
          break

        case MSG_TYPE.ASK:
          this.isThinking = false
          this.pendingAsk = { content: content || '', userInput: '' }
          this.messages.push({
            type: 'ask',
            content: content || '',
            role: 'robot',
            timestamp: ts,
          })
          break

        // --- 结果类 ---
        case MSG_TYPE.ANSWER:
          this.messages.push({
            type: 'answer',
            content: content || '',
            role: 'robot',
            timestamp: ts,
            steps: [...this.currentTurnSteps],
          })
          this.resetTurnState()
          break

        case MSG_TYPE.ERROR:
          this.messages.push({
            type: 'error',
            content: content || '服务异常，请稍后重试',
            role: 'robot',
            timestamp: ts,
            code: payload?.code,
          })
          this.resetTurnState()
          break

        default:
          console.warn('Unknown agent message type:', type)
      }
    },

    resetTurnState() {
      this.isThinking = false
      this.currentThought = ''
      this.activeTool = null
      this.currentTurnSteps = []
    },

    // ========================
    // 发送消息
    // ========================
    userInput(content, images = []) {
      this.resetTurnState()
      const msg = {
        type: MSG_TYPE.USER_INPUT,
        content,
        timestamp: Date.now(),
      }
      if (images?.length) msg.images = images
      this.messages.push({ ...msg, role: 'user' })
      this.sendRaw(msg)
    },

    submitConfirm(confirmed) {
      this.messages.push({
        type: 'user_input',
        content: confirmed ? '确认执行' : '取消执行',
        role: 'user',
        timestamp: Date.now(),
      })
      this.sendRaw({
        type: MSG_TYPE.USER_CONFIRM,
        payload: { confirmed },
        timestamp: Date.now(),
      })
      this.pendingConfirm = null
    },

    submitAnswer(content) {
      this.messages.push({
        type: 'user_input',
        content,
        role: 'user',
        timestamp: Date.now(),
      })
      this.sendRaw({
        type: MSG_TYPE.USER_ANSWER,
        content,
        timestamp: Date.now(),
      })
      this.pendingAsk = null
    },

    sendRaw(data) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data))
      } else {
        console.error('Agent WebSocket is not connected')
        this.connect(this.sessionId)
      }
    },

    // ========================
    // 历史消息加载
    // ========================
    async fetchHistory(sessionId) {
      if (!sessionId) return
      try {
        const res = await getMessage(sessionId)
        if (!Array.isArray(res.data)) return

        this.messages = []
        for (const msg of res.data) {
          const role = msg.messageRole === '0' ? 'user' : 'robot'

          if (role === 'user') {
            this.messages.push({
              type: 'user_input',
              content: msg.messageContent || msg.content || '',
              role: 'user',
              timestamp: msg.messageTime ? new Date(msg.messageTime).getTime() : Date.now(),
            })
            continue
          }

          // 机器人消息：解析 agentData
          let steps = []
          let finalContent = msg.messageContent || msg.content || ''

          if (msg.agentData) {
            try {
              const agentData = typeof msg.agentData === 'string'
                ? JSON.parse(msg.agentData)
                : msg.agentData
              finalContent = agentData.finalContent || finalContent
              steps = this.normalizeHistorySteps(agentData.steps || [])
            } catch (e) {
              console.warn('Agent history parse error:', e)
            }
          }

          this.messages.push({
            type: 'answer',
            content: finalContent,
            role: 'robot',
            timestamp: msg.messageTime ? new Date(msg.messageTime).getTime() : Date.now(),
            steps,
          })
        }
      } catch (err) {
        console.error('Fetch agent history failed:', err)
      }
    },

    /**
     * 将旧版步骤格式规范化为新协议格式
     */
    normalizeHistorySteps(oldSteps) {
      const steps = []
      for (const s of oldSteps) {
        if (s.type === 'status' || s.type === 'final_result') continue
        if (s.type === 'thought' || s.type === 'think' || s.type === 'thought_result') {
          steps.push({
            type: 'thought_result',
            content: s.content || '',
            timestamp: s.timestamp || Date.now(),
          })
        } else if (s.type === 'tool_call' || s.type === 'tool') {
          steps.push({
            type: 'tool',
            tool: s.tool || s.payload?.tool || 'unknown',
            status: 'completed',
            callContent: s.type === 'tool_call' ? (s.content || '') : (s.callContent || ''),
            resultContent: s.resultContent || s.content || '',
            payload: s.payload || null,
            timestamp: s.timestamp || Date.now(),
          })
        }
      }
      return steps
    },

    // ========================
    // 清理
    // ========================
    clearMessages() {
      this.messages = []
      this.resetTurnState()
      this.pendingConfirm = null
      this.pendingAsk = null
    },

    getRoleByType(type) {
      return isUserType(type) ? 'user' : 'robot'
    },
  },
})
