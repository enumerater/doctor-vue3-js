// stores/vision.js - 图像识别任务状态管理
import { defineStore } from 'pinia'

export const useVisionStore = defineStore('vision', {
  state: () => ({
    // 当前识别任务
    currentTask: null, // { id, status, startTime, elapsedTime, imageUrl, cropType, result, error }
    // 历史识别结果
    history: [],
  }),

  getters: {
    // 是否有正在进行的任务
    hasActiveTask: (state) => {
      return state.currentTask && state.currentTask.status === 'detecting'
    },

    // 是否有已完成的任务
    hasCompletedTask: (state) => {
      return state.currentTask && state.currentTask.status === 'completed'
    },

    // 任务状态文本
    taskStatusText: (state) => {
      if (!state.currentTask) return ''
      if (state.currentTask.status === 'detecting') {
        return '识别中...'
      }
      if (state.currentTask.status === 'completed') {
        return '识别完成'
      }
      if (state.currentTask.status === 'failed') {
        return '识别失败'
      }
      return ''
    },
  },

  actions: {
    // 创建新任务
    createTask(imageUrl, cropType) {
      const taskId = Date.now().toString()
      this.currentTask = {
        id: taskId,
        status: 'detecting',
        startTime: Date.now(),
        elapsedTime: 0,
        imageUrl,
        cropType,
        result: null,
        error: null,
      }
      return taskId
    },

    // 更新任务状态
    updateTaskStatus(status, result = null, error = null) {
      if (this.currentTask) {
        this.currentTask.status = status
        if (result) {
          this.currentTask.result = result
        }
        if (error) {
          this.currentTask.error = error
        }
        this.currentTask.elapsedTime = Math.floor((Date.now() - this.currentTask.startTime) / 1000)
      }
    },

    // 更新任务已用时间
    updateTaskElapsedTime() {
      if (this.currentTask && this.currentTask.status === 'detecting') {
        this.currentTask.elapsedTime = Math.floor((Date.now() - this.currentTask.startTime) / 1000)
      }
    },

    // 完成任务并保存到历史
    completeTask(result) {
      if (this.currentTask) {
        this.currentTask.status = 'completed'
        this.currentTask.result = result
        this.currentTask.elapsedTime = Math.floor((Date.now() - this.currentTask.startTime) / 1000)

        // 保存到历史记录
        this.history.unshift({
          ...this.currentTask,
          completedAt: Date.now(),
        })

        // 只保留最近10条历史记录
        if (this.history.length > 10) {
          this.history = this.history.slice(0, 10)
        }
      }
    },

    // 任务失败
    failTask(error) {
      if (this.currentTask) {
        this.currentTask.status = 'failed'
        this.currentTask.error = error
        this.currentTask.elapsedTime = Math.floor((Date.now() - this.currentTask.startTime) / 1000)
      }
    },

    // 清除当前任务
    clearCurrentTask() {
      this.currentTask = null
    },

    // 清除历史记录
    clearHistory() {
      this.history = []
    },
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'vision-store',
        storage: localStorage,
        paths: ['currentTask', 'history'],
      },
    ],
  },
})
