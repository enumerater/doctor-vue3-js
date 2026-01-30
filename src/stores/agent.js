import { defineStore } from 'pinia'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    chatMessages: [], // 格式: { id, messageRole, messageContent, steps: [], messageTime }
    currentSessionId: null,
  }),
  actions: {
    // 处理从 SSE 接收到的原始事件流并更新到对应的消息中
    handleAgentEvent(sessionId, eventData) {
      // 1. 查找或创建当前的机器人消息对象
      let robotMsg = this.chatMessages.find((m) => m.id === sessionId && m.messageRole === '1')

      if (!robotMsg) {
        robotMsg = {
          id: sessionId,
          messageRole: '1',
          messageContent: '',
          steps: [],
          messageTime: new Date().getTime(),
        }
        this.chatMessages.push(robotMsg)
      }

      // 2. 根据事件类型解析数据
      const { event, data } = eventData // 假设 eventData 是解析后的 {event, data} 对象
      const payload = typeof data === 'string' ? JSON.parse(data) : data

      if (event === 'status') {
        // 更新或增加状态步骤
        robotMsg.steps.push({
          type: 'status',
          status: payload.status,
          content: payload.message,
          timestamp: payload.timestamp,
        })
      } else if (event === 'data') {
        // 增加具体的内容卡片
        robotMsg.steps.push({
          type: payload.type, // 'safe_notice', 'pesticide', etc.
          content: payload.content,
          timestamp: payload.timestamp,
        })

        // 如果是最终结果，也同步更新到主内容字段
        if (payload.type === 'final_result') {
          robotMsg.messageContent = payload.content
        }
      }
    },
  },
})
