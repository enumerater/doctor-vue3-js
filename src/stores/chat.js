import { defineStore } from 'pinia'
import { getMessage } from '@/axios/chat'
import { createSession } from '@/axios/session'
import { useSidebarStore } from './sidebar'
export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '', // 当前选中的会话ID
    chatMessages: [], // 当前会话的消息列表
    currentRobotMsgIndex: -1, // 机器人消息索引
    inputValue: '', // 输入框内容
  }),
  actions: {
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

    async fetchMessages(sessionId) {
      if (!sessionId) return
      this.clearMessages()
      try {
        const res = await getMessage(sessionId)
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data.map((msg) => {
            let messageContent = msg.messageContent || msg.content || ''
            let steps = []

            // 尝试解析历史记录中的 Agent 结构
            // 假设历史记录存的是最终生成的 JSON 字符串或者是特定格式
            try {
              // 如果内容本身就是 JSON，解析它来还原 steps
              const parsed = JSON.parse(messageContent)
              if (parsed.steps) {
                steps = parsed.steps
                messageContent = parsed.finalContent || ''
              }
            } catch (e) {
              /* 普通文本 */
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
      if (this.chatMessages.length === 0 && sessionId && sidebarStore.isAgricultureAgent) {
        try {
          await createSession({
            userId,
            sessionTitle: trimmedContent.substring(0, 20),
            sessionId: fullSessionId,
          })
          const { useSidebarStore } = await import('@/stores/sidebar')
          await useSidebarStore().refreshHistory()
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
        const url = new URL(`http://localhost:8080${apiPath}`)
        url.searchParams.append('prompt', content)
        url.searchParams.append('image', image)
        url.searchParams.append('userId', userId)
        url.searchParams.append('sessionId', sessionId)

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

                  // 推入新状态
                  currentMsg.steps.push({
                    type: 'status',
                    content: data.message,
                    status: data.status, // 后端传来的可能是 'processing' 或 'completed'
                    timestamp: data.timestamp,
                  })
                } else if (data.type) {
                  // ✅ 核心修复：当开始传数据卡片时，之前的状态肯定也完成了
                  currentMsg.steps.forEach((step) => {
                    if (step.status === 'processing') step.status = 'completed'
                  })

                  currentMsg.steps.push({
                    type: data.type,
                    content: data.content,
                    timestamp: data.timestamp,
                  })

                  if (data.type === 'final_result') {
                    currentMsg.messageContent = data.content
                  }
                }
              } catch (e) {
                currentMsg.messageContent += chunk
              }
            }
            // --- 普通模型处理逻辑 ---
            else {
              currentMsg.messageContent += chunk
            }
          }
        }
      } catch (error) {
        console.error('流式异常', error)
        if (this.currentRobotMsgIndex >= 0) {
          this.chatMessages[this.currentRobotMsgIndex].messageContent = '服务响应异常，请稍后重试'
        }
      }
    },

    async sendMessage(content, userId, sessionId, TOKEN) {
      await this.prepareMessage(content, userId, sessionId)
      this.startStreaming(content, userId, sessionId, TOKEN)
    },
  },
})
