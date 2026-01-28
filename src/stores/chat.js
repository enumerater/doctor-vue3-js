// stores/chat.js（扩展后）
import { defineStore } from 'pinia'
import { getMessage } from '@/axios/chat'
import { createSession } from '@/axios/session'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentSessionId: '', // 当前选中的会话ID
    chatMessages: [], // 当前会话的消息列表
    currentRobotMsgIndex: -1, // 机器人消息索引
    inputValue: '', // ✅ 新增：输入框内容（从ChatPage抽离）
  }),
  actions: {
    setCurrentSessionId(sessionId) {
      this.currentSessionId = sessionId
    },
    clearMessages() {
      this.chatMessages = []
      this.currentRobotMsgIndex = -1
    },
    // ✅ 新增：设置输入框内容（供所有组件调用）
    setInputValue(value) {
      this.inputValue = value
    },
    // ✅ 新增：清空输入框（复用）
    clearInputValue() {
      this.inputValue = ''
    },
    // ✅ 新增：处理热门问题点击（集中逻辑）
    handleHotQuestionClick(question) {
      this.setInputValue(question) // 直接赋值到输入框
    },
    async fetchMessages(sessionId) {
      if (!sessionId) return
      this.clearMessages()
      try {
        console.log('请求历史消息：', sessionId)
        const res = await getMessage(sessionId)
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data.map((msg) => {
            // 解析JSON格式的消息内容
            let messageContent = msg.messageContent || msg.content || ''
            let isImageMessage = false

            try {
              const parsedContent = JSON.parse(messageContent)
              if (parsedContent.content) {
                messageContent = parsedContent.content
                // 如果包含图片，则标记为图片消息
                if (parsedContent.images && parsedContent.images.length > 0) {
                  isImageMessage = true
                }
              }
            } catch (e) {
              // 不是JSON格式，直接使用原始内容
            }

            return {
              ...msg,
              messageContent: messageContent,
              messageRole: msg.messageRole || (msg.type === 'user' ? '0' : '1'),
              isImageMessage: isImageMessage,
            }
          })
        }
        console.log('历史消息请求结果：', res)
      } catch (err) {
        console.error('获取历史消息失败：', err)
        this.chatMessages = [
          { type: 'robot', messageContent: '获取历史记录失败，请重试', messageRole: '1' },
        ]
      }
    },
    // 准备消息：添加用户消息和空的机器人消息，立即返回（不等待流式响应）
    async prepareMessage(content, userId, sessionId) {
      const trimmedContent = content.trim()
      if (!trimmedContent) return Promise.reject(new Error('消息内容不能为空'))
      this.clearInputValue()

      // 解析JSON格式的消息数据
      let messageContent = trimmedContent
      let sessionTitle = trimmedContent
      let isImageMessage = false

      try {
        const parsedContent = JSON.parse(trimmedContent)
        // 如果是JSON格式且包含content字段，则使用content作为显示内容
        if (parsedContent.content) {
          messageContent = parsedContent.content
          // 如果包含图片，则标记为图片消息
          if (parsedContent.images && parsedContent.images.length > 0) {
            isImageMessage = true
            // 如果有文本内容，使用文本作为会话标题，否则使用图片消息提示
            sessionTitle = parsedContent.content || '图片消息'
          }
        }
      } catch (e) {
        // 不是JSON格式，直接使用原始内容
        sessionTitle =
          trimmedContent.length > 20 ? trimmedContent.substring(0, 20) + '...' : trimmedContent
      }

      // 如果这是第一条消息且会话尚未创建，则创建会话
      const fullSessionId = `${userId}${sessionId}`

      // 检查是否需要创建会话：
      // 1. 当前没有任何消息（确保是新会话）
      // 2. 有有效的sessionId
      const needsCreateSession = this.chatMessages.length === 0 && sessionId

      if (needsCreateSession) {
        try {
          await createSession({
            userId,
            sessionTitle: sessionTitle,
            sessionId: fullSessionId,
          })
          console.log('创建新会话成功：', fullSessionId)
          // 刷新历史记录（如果 sidebarStore 可用）
          const { useSidebarStore } = await import('@/stores/sidebar')
          const sidebarStore = useSidebarStore()
          await sidebarStore.refreshHistory()
        } catch (err) {
          console.warn('创建会话失败，继续发送消息：', err)
          // 即使创建会话失败，也继续发送消息
        }
      }

      // 添加用户消息
      const userMsg = {
        type: 'user',
        messageContent: messageContent,
        messageRole: '0',
        isImageMessage: isImageMessage,
        originalData: trimmedContent, // 保存原始数据以便后续使用
      }
      this.chatMessages.push(userMsg)
      console.log('添加用户消息：', userMsg)

      // 添加空的机器人消息（等待流式数据填充）
      const robotMsg = {
        type: 'robot',
        messageContent: '',
        messageRole: '1',
      }
      this.chatMessages.push(robotMsg)
      this.currentRobotMsgIndex = this.chatMessages.length - 1
      console.log('初始化机器人消息，索引：', this.currentRobotMsgIndex)

      return Promise.resolve()
    },
    // 启动流式请求：在后台处理流式响应，实时更新消息
    async startStreaming(content, userId, sessionId, TOKEN) {
      const trimmedContent = content.trim()
      if (!trimmedContent) return Promise.reject(new Error('消息内容不能为空'))

      try {
        // 根据是否启用农业Agent选择不同的API路径
        const sidebarStore = (await import('@/stores/sidebar')).useSidebarStore()
        const apiPath = sidebarStore.isAgricultureAgent ? '/chat/agriculture-agent' : '/chat/memory'

        const url = new URL(`http://localhost:8080${apiPath}`)
        url.searchParams.append('prompt', trimmedContent)
        url.searchParams.append('userId', userId)
        url.searchParams.append('sessionId', sessionId)
        // 添加农业Agent模式标记
        if (sidebarStore.isAgricultureAgent) {
          url.searchParams.append('agent_mode', 'agriculture')
        }

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            Authorization: TOKEN,
          },
        })

        if (!response.ok) {
          throw new Error(`请求失败：${response.status} ${response.statusText}`)
        }
        console.log('请求成功，开始读取流式数据')

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('流式数据读取完成')
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const allLines = buffer.split(/\r?\n/)
          buffer = allLines.pop() || ''

          for (const line of allLines) {
            const trimedLine = line.trim()
            if (!trimedLine) continue

            if (trimedLine.startsWith('data:')) {
              const chunk = trimedLine.substring(5).trim()
              if (chunk === '' || chunk === '[DONE]') continue

              console.log('提取到的有效内容：', chunk)
              if (this.currentRobotMsgIndex >= 0) {
                this.chatMessages[this.currentRobotMsgIndex].messageContent += chunk
              }
            }
          }
        }

        return Promise.resolve()
      } catch (error) {
        console.error('流式请求出错：', error)
        if (this.currentRobotMsgIndex >= 0) {
          this.chatMessages[this.currentRobotMsgIndex].messageContent = `请求失败：${error.message}`
        }
        return Promise.reject(error)
      }
    },
    // 兼容旧接口：保持原有 sendMessage 方法，但内部使用新的分离方法
    async sendMessage(content, userId, sessionId, TOKEN) {
      await this.prepareMessage(content, userId, sessionId)
      // 不等待流式响应完成，立即返回
      // 流式响应在后台继续处理
      this.startStreaming(content, userId, sessionId, TOKEN).catch((err) => {
        console.error('后台流式请求失败：', err)
      })
      return Promise.resolve()
    },
    addRobotMessage(chunk) {
      if (this.currentRobotMsgIndex >= 0) {
        this.chatMessages[this.currentRobotMsgIndex].messageContent += chunk
      }
    },
    initRobotMessage() {
      this.chatMessages.push({ type: 'robot', messageContent: '', messageRole: '1' })
      this.currentRobotMsgIndex = this.chatMessages.length - 1
    },
  },
})
