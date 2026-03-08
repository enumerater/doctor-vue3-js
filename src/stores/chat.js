import { defineStore } from 'pinia'
import { getMessage, saveAgentMessage } from '@/axios/chat'
import { createSession } from '@/axios/session'
import { useSidebarStore } from './sidebar'
import { ElMessageBox } from 'element-plus'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '', // 当前选中的会话ID
    chatMessages: [], // 当前会话的消息列表
    currentRobotMsgIndex: -1, // 机器人消息索引
    inputValue: '', // 输入框内容
    autoSendPending: false, // 从弹窗传递到Agent时自动发送标志
    pendingTransferImageUrl: '', // 待传递的图片URL
    selectedModel: 'qwen-flash', // 默认模型
    socket: null, // WebSocket 实例
    isConnected: false, // 是否已连接
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

    // --- WebSocket 管理 ---
    connectWebSocket(userId, sessionId, TOKEN) {
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return
      }

      const baseApi = import.meta.env.VITE_APP_BASE_API
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      
      // 处理 baseApi 是完整 URL 还是相对路径的情况
      let wsBase;
      if (baseApi.startsWith('http')) {
        wsBase = baseApi.replace(/^http/, 'ws');
      } else {
        wsBase = `${wsProtocol}//${window.location.host}${baseApi}`;
      }

      // 后端路径为 /ws/chat，此处拼接后经过代理会转发到后端 /ws/chat
      const wsUrl = `${wsBase}/ws/chat?token=${TOKEN}&userId=${userId}&sessionId=${sessionId}`
      
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('WebSocket Connected')
        this.isConnected = true
      }

      this.socket.onmessage = (event) => {
        this.handleSocketMessage(event.data, userId, sessionId)
      }

      this.socket.onclose = () => {
        console.log('WebSocket Disconnected')
        this.isConnected = false
        this.socket = null
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error)
      }
    },

    disconnectWebSocket() {
      if (this.socket) {
        this.socket.close()
        this.socket = null
        this.isConnected = false
      }
    },

    handleSocketMessage(rawData, userId, sessionId) {
      const sidebarStore = useSidebarStore()
      const currentMsg = this.chatMessages[this.currentRobotMsgIndex]
      if (!currentMsg) return

      try {
        const data = JSON.parse(rawData)

        // 1. 处理交互请求 (type: interaction)
        if (data.type === 'interaction') {
          const actionId = data.actionId; // 获取后端传来的 actionId
          
          ElMessageBox.confirm(data.content || data.prompt || '检测到需要您的确认，是否继续？', '系统提示', {
            confirmButtonText: '同意',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              this.sendSocketMessage({
                type: 'interaction_response',
                actionId: actionId, // 必须带上刚才存的那个 ID
                data: {
                  confirmed: true // 后端是通过 data.confirmed 来判断的
                },
              })
            })
            .catch(() => {
              this.sendSocketMessage({
                type: 'interaction_response',
                actionId: actionId,
                data: {
                  confirmed: false
                },
              })
            })
          return
        }

        // 2. 处理流式消息
        if (data.status) {
          // 将之前所有的 processing 状态改为 completed
          currentMsg.steps.forEach((step) => {
            if (step.type === 'status' && step.status === 'processing') {
              step.status = 'completed'
            }
          })

          const existingStatus = currentMsg.steps.find(
            (s) => s.type === 'status' && s.content === data.message,
          )
          if (existingStatus) {
            existingStatus.status = data.status
          } else {
            currentMsg.steps.push({
              type: 'status',
              content: data.message,
              status: data.status,
              timestamp: data.timestamp,
            })
          }
        } else if (data.type) {
          currentMsg.steps.forEach((step) => {
            if (step.status === 'processing') step.status = 'completed'
          })

          const lastStep = currentMsg.steps[currentMsg.steps.length - 1]
          if (lastStep && lastStep.type === data.type && data.type !== 'status') {
            if (data.content !== undefined) {
              lastStep.content = data.content
            }
          } else {
            currentMsg.steps.push({
              type: data.type,
              content: data.content,
              timestamp: data.timestamp,
              status: 'processing',
            })
          }

          if (data.type === 'final_result') {
            currentMsg.messageContent = data.content
            // 收到最终结果，保存消息
            this.saveFinishedMessage(userId, sessionId)
          }
        }
      } catch (e) {
        // 非 JSON 数据追加到主内容
        currentMsg.messageContent += rawData
      }
    },

    sendSocketMessage(data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data))
      } else {
        console.error('WebSocket is not open')
      }
    },

    async saveFinishedMessage(userId, sessionId) {
      const robotMsg = this.chatMessages[this.currentRobotMsgIndex]
      const userMsg = this.chatMessages[this.currentRobotMsgIndex - 1]
      const fullSessionId = `${userId}${sessionId}`

      try {
        await saveAgentMessage({
          sessionId: fullSessionId,
          userMessage: userMsg.messageContent,
          robotMessage: {
            steps: robotMsg.steps,
            finalContent: robotMsg.messageContent,
          },
        })
        console.log('Agent消息保存成功')
      } catch (err) {
        console.warn('Agent消息保存失败', err)
      }
    },

    async fetchMessages(sessionId) {
      if (!sessionId) return
      this.clearMessages()
      try {
        const res = await getMessage(sessionId)
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data.map((msg) => {
            let messageContent = msg.messageContent || msg.content || ''
            let steps = []

            if (msg.messageRole === '1' && msg.agentData) {
              try {
                if (typeof msg.agentData === 'string') {
                  const parsed = JSON.parse(msg.agentData)
                  steps = parsed.steps || []
                  messageContent = parsed.finalContent || ''
                } else {
                  steps = msg.agentData.steps || []
                  messageContent = msg.agentData.finalContent || ''
                }
              } catch (e) {
                console.warn('解析Agent数据失败', e)
              }
            }

            return {
              ...msg,
              messageContent: messageContent,
              messageRole: msg.messageRole || (msg.type === 'user' ? '0' : '1'),
              steps: steps,
              isImageMessage: false,
            }
          })
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
            sessionType: sidebarStore.isAgricultureAgent ? 'agent' : 'chat',
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
        steps: [],
      })
      this.currentRobotMsgIndex = this.chatMessages.length - 1
      return Promise.resolve()
    },

    async startStreaming(content, image, userId, sessionId, TOKEN) {
      const sidebarStore = useSidebarStore()
      
      // 如果是农业智能体，使用 WebSocket
      if (sidebarStore.isAgricultureAgent) {
        this.connectWebSocket(userId, sessionId, TOKEN)
        
        // 等待连接建立后发送消息（简单处理，实际可增加重试逻辑）
        const sendWhenReady = () => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.sendSocketMessage({
              type: 'chat', // 必须加这个，后端靠这个判断业务类型
              content: content, // 后端 AgentWorkflowService 接收的是 content 字段
              prompt: content, // 保留原字段以防万一
              image: image,
              model: this.selectedModel
            })
          } else {
            setTimeout(sendWhenReady, 100)
          }
        }
        sendWhenReady()
        return
      }

      // 普通聊天仍然使用 fetch SSE
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
            currentMsg.messageContent += chunk
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

