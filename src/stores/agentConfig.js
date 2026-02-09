import { defineStore } from 'pinia'
import {
  getAgentConfigs,
  createAgentConfig,
  updateAgentConfig,
  deleteAgentConfig,
  setDefaultConfig,
  duplicateConfig
} from '@/axios/agentConfig'

export const useAgentConfigStore = defineStore('agentConfig', {
  state: () => ({
    // 配置列表
    configs: [],
    // 当前选中的配置ID
    currentConfigId: '',
    // 编辑状态
    editingConfigId: null,
    // UI状态
    isLoading: false,
    error: null,
    showConfigPanel: false,
  }),

  getters: {
    // 当前选中的完整配置
    currentConfig: (state) => {
      return state.configs.find(c => c.id === state.currentConfigId) ||
             state.configs.find(c => c.isDefault) ||
             state.configs[0]
    },

    // 编辑中的配置
    editingConfig: (state) => {
      return state.configs.find(c => c.id === state.editingConfigId)
    },

    // 配置列表（UI展示）
    configList: (state) => {
      return state.configs.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isDefault: c.isDefault,
        isActive: c.id === state.currentConfigId
      }))
    }
  },

  actions: {
    // 获取用户的所有配置
    async fetchConfigs() {
      this.isLoading = true
      try {
        const response = await getAgentConfigs()
        this.configs = response.data || []

        // 自动选中默认配置或第一个
        if (this.configs.length > 0 && !this.currentConfigId) {
          const defaultConfig = this.configs.find(c => c.isDefault)
          this.currentConfigId = defaultConfig?.id || this.configs[0].id
        }
        this.error = null
      } catch (err) {
        this.error = err.message
        console.error('获取Agent配置失败:', err)
      } finally {
        this.isLoading = false
      }
    },

    // 创建新配置
    async createConfig(configData) {
      try {
        const response = await createAgentConfig(configData)
        this.configs.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 更新配置
    async updateConfig(configId, configData) {
      try {
        const response = await updateAgentConfig(configId, configData)
        const index = this.configs.findIndex(c => c.id === configId)
        if (index >= 0) {
          this.configs[index] = response.data
        }
        return response.data
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 删除配置
    async deleteConfig(configId) {
      try {
        await deleteAgentConfig(configId)
        this.configs = this.configs.filter(c => c.id !== configId)

        // 如果删除的是当前配置，切换到其他
        if (this.currentConfigId === configId) {
          this.currentConfigId = this.configs[0]?.id || ''
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 切换配置
    async switchConfig(configId) {
      const config = this.configs.find(c => c.id === configId)
      if (config) {
        this.currentConfigId = configId
      }
    },

    // 设置为默认配置
    async setDefault(configId) {
      try {
        await setDefaultConfig(configId)
        // 更新本地状态
        this.configs.forEach(c => {
          c.isDefault = c.id === configId
        })
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 复制配置
    async duplicate(configId) {
      try {
        const response = await duplicateConfig(configId)
        this.configs.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 设置编辑的配置
    setEditingConfig(configId) {
      this.editingConfigId = configId
    },

    // 清除编辑状态
    clearEditingConfig() {
      this.editingConfigId = null
    },

    // 切换配置面板
    toggleConfigPanel() {
      this.showConfigPanel = !this.showConfigPanel
    },

    // 打开配置面板
    openConfigPanel() {
      this.showConfigPanel = true
    },

    // 关闭配置面板
    closeConfigPanel() {
      this.showConfigPanel = false
    }
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'agent-config-store',
        storage: localStorage,
        paths: ['currentConfigId', 'configs']
      }
    ]
  }
})
