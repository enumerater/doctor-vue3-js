// stores/chat.js（扩展后）
import { defineStore } from 'pinia'
import { getMessage } from '@/axios/chat'

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
        const res = await getMessage({ sessionId: sessionId })
        if (Array.isArray(res.data)) {
          this.chatMessages = res.data.map((msg) => ({
            ...msg,
            messageContent: msg.messageContent || msg.content,
            messageRole: msg.messageRole || (msg.type === 'user' ? '0' : '1'),
          }))
        }
        console.log('历史消息请求结果：', res)
      } catch (err) {
        console.error('获取历史消息失败：', err)
        this.chatMessages = [
          { type: 'robot', messageContent: '获取历史记录失败，请重试', messageRole: '1' },
        ]
      }
    },
    async sendMessage(content, userId, sessionId, TOKEN) {
      const trimmedContent = content.trim()
      if (!trimmedContent) return Promise.reject(new Error('消息内容不能为空'))
      this.clearInputValue()

      try {
        // 改用store的inputValue（可选，也可以继续传参）
        const userMsg = {
          type: 'user',
          messageContent: trimmedContent,
          messageRole: '0',
        }
        this.chatMessages.push(userMsg)
        console.log('添加用户消息：', userMsg)

        const robotMsg = {
          type: 'robot',
          messageContent: '',
          messageRole: '1',
        }
        this.chatMessages.push(robotMsg)
        this.currentRobotMsgIndex = this.chatMessages.length - 1
        console.log('初始化机器人消息，索引：', this.currentRobotMsgIndex)

        const url = new URL('http://localhost:8080/chat/memory')
        url.searchParams.append('prompt', trimmedContent)
        url.searchParams.append('userId', userId)
        url.searchParams.append('sessionId', sessionId)

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
