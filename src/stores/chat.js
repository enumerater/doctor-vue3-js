import { defineStore } from 'pinia'
import { getMessage, saveAgentMessage } from '@/axios/chat'
import { createSession } from '@/axios/session'
import { useSidebarStore } from './sidebar'
export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '', // 当前选中的会话ID
    chatMessages: [], // 当前会话的消息列表
    currentRobotMsgIndex: -1, // 机器人消息索引
    inputValue: '', // 输入框内容
    autoSendPending: false, // 从弹窗传递到Agent时自动发送标志
    pendingTransferImageUrl: '', // 待传递的图片URL
    selectedModel: 'qwen-flash', // 默认模型
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
          this.chatMessages = res.data.map((msg) => {
            let messageContent = msg.messageContent || msg.content || ''
            let steps = []

            // 如果是Agent消息（messageRole为'1'且包含steps数据）
            if (msg.messageRole === '1' && msg.agentData) {
              // 后端返回的Agent消息格式：{ agentData: { steps: [...], finalContent: '...' } }
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
              steps: steps, // 还原历史步骤
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
      // 第一条消息时创建会话记录，区分普通对话和Agent对话
      if (this.chatMessages.length === 0 && sessionId) {
        try {
          await createSession({
            userId,
            sessionTitle: trimmedContent.substring(0, 20),
            sessionId: fullSessionId,
            sessionType: sidebarStore.isAgricultureAgent ? 'agent' : 'chat', // 新增：会话类型
          })

          // 创建会话成功后，立即刷新侧边栏历史记录
          await sidebarStore.refreshHistory()
        } catch (err) {
          console.warn('创建会话失败', err)
        }
      }

      // 用户消息
      this.chatMessages.push({
        type: 'user',
        messageContent: trimmedContent,
        messageRole: '0',
      })

      // ✅ 初始化机器人消息：必须包含 steps 数组
      this.chatMessages.push({
        type: 'robot',
        messageContent: '',
        messageRole: '1',
        steps: [], // 关键：组件 v-for 循环的对象
      })
      this.currentRobotMsgIndex = this.chatMessages.length - 1
      return Promise.resolve()
    },

    async startStreaming(content, image, userId, sessionId, TOKEN) {
      try {
        const sidebarStore = (await import('@/stores/sidebar')).useSidebarStore()

        const apiPath = sidebarStore.isAgricultureAgent
          ? '/agent/agriculture-agent'
          : '/chat/memory'

        // 统一使用环境变量中的 API 基准路径
        const baseApi = import.meta.env.VITE_APP_BASE_API
        // 构造完整的 API 路径，确保如果是相对路径则拼接当前 origin
        const fullApiPath = new URL(
          `${baseApi.startsWith('http') ? '' : window.location.origin}${baseApi}${apiPath}`,
        ).href

        const url = new URL(fullApiPath)
        url.searchParams.append('prompt', content || '') // 处理空值
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

            if (sidebarStore.isAgricultureAgent) {
              try {
                const data = JSON.parse(chunk)

                if (data.status) {
                  // ✅ 核心修复：将之前所有的 processing 状态改为 completed
                  currentMsg.steps.forEach((step) => {
                    if (step.type === 'status' && step.status === 'processing') {
                      step.status = 'completed'
                    }
                  })

                  // 检查是否已经存在相同内容的 status，避免重复
                  const existingStatus = currentMsg.steps.find(
                    (s) => s.type === 'status' && s.content === data.message,
                  )
                  if (existingStatus) {
                    existingStatus.status = data.status
                  } else {
                    // 推入新状态
                    currentMsg.steps.push({
                      type: 'status',
                      content: data.message,
                      status: data.status, // 后端传来的可能是 'processing' 或 'completed'
                      timestamp: data.timestamp,
                    })
                  }
                } else if (data.type) {
                  // ✅ 核心修复：当开始传数据卡片时，之前的状态肯定也完成了
                  currentMsg.steps.forEach((step) => {
                    if (step.status === 'processing') step.status = 'completed'
                  })

                  // 检查是否是当前正在更新的步骤类型
                  const lastStep = currentMsg.steps[currentMsg.steps.length - 1]
                  if (lastStep && lastStep.type === data.type && data.type !== 'status') {
                    // 如果是相同类型的步骤，则更新其内容（支持流式累加或覆盖）
                    // 注意：这里需要根据后端协议决定是 += 还是直接 =
                    // 通常 streaming 会发送增量或者全量。从之前的代码看，这里似乎是覆盖或者新的内容
                    if (data.content !== undefined) {
                      lastStep.content = data.content
                    }
                  } else {
                    currentMsg.steps.push({
                      type: data.type,
                      content: data.content,
                      timestamp: data.timestamp,
                      status: 'processing', // 标记为正在处理
                    })
                  }

                  if (data.type === 'final_result') {
                    currentMsg.messageContent = data.content
                  }
                }
              } catch (e) {
                // 如果 chunk 不是有效的 JSON，则追加到主内容（普通流式或 Agent 的异常情况）
                currentMsg.messageContent += chunk
              }
            }
            // --- 普通模型处理逻辑 ---
            else {
              currentMsg.messageContent += chunk
            }
          }
        }

        // 流式响应结束后，如果是Agent模式，保存完整消息到后端
        if (sidebarStore.isAgricultureAgent && this.currentRobotMsgIndex >= 0) {
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
