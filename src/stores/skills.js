import { defineStore } from 'pinia'
import { getSkills, updateSkillStatus, executeSkill } from '@/axios/skills'

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    // 所有可用的skills
    availableSkills: [],
    // 用户启用的skills ID列表
    enabledSkillIds: [],
    // skills执行状态
    executingSkills: new Set(),
    // 最后执行的skill结果
    lastResult: null,
    // UI状态
    isLoading: false,
    error: null,
  }),

  getters: {
    // 已启用的skills列表
    enabledSkills: (state) => {
      return state.availableSkills.filter((skill) => state.enabledSkillIds.includes(skill.id))
    },

    // 根据分类分组的skills
    skillsByCategory: (state) => {
      const grouped = {}
      state.availableSkills.forEach((skill) => {
        const category = skill.category || 'other'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push({
          ...skill,
          enabled: state.enabledSkillIds.includes(skill.id),
        })
      })
      return grouped
    },

    // 某个skill是否正在执行
    isSkillExecuting: (state) => (skillId) => {
      return state.executingSkills.has(skillId)
    },

    // 某个skill是否已启用
    isSkillEnabled: (state) => (skillId) => {
      return state.enabledSkillIds.includes(skillId)
    },
  },

  actions: {
    // 获取所有可用的skills
    async fetchSkills() {
      this.isLoading = true
      try {
        const response = await getSkills()
        console.log('获取Skills成功:', response.data)
        this.availableSkills = response.data?.skills || []
        this.enabledSkillIds = response.data?.enabledSkillIds || []
        this.error = null
      } catch (err) {
        this.error = err.message
        console.error('获取Skills失败:', err)
      } finally {
        this.isLoading = false
      }
    },

    // 切换skill启用状态
    async toggleSkill(skillId) {
      const isEnabled = this.enabledSkillIds.includes(skillId)
      const newStatus = !isEnabled

      try {
        await updateSkillStatus(skillId, newStatus)

        if (newStatus) {
          this.enabledSkillIds.push(skillId)
        } else {
          this.enabledSkillIds = this.enabledSkillIds.filter((id) => id !== skillId)
        }

        this.error = null
      } catch (err) {
        this.error = err.message
        console.error('切换Skill状态失败:', err)
        throw err
      }
    },

    // 批量启用skills
    async enableSkills(skillIds) {
      try {
        for (const skillId of skillIds) {
          if (!this.enabledSkillIds.includes(skillId)) {
            await updateSkillStatus(skillId, true)
            this.enabledSkillIds.push(skillId)
          }
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 批量禁用skills
    async disableSkills(skillIds) {
      try {
        for (const skillId of skillIds) {
          if (this.enabledSkillIds.includes(skillId)) {
            await updateSkillStatus(skillId, false)
            this.enabledSkillIds = this.enabledSkillIds.filter((id) => id !== skillId)
          }
        }
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    // 执行skill
    async executeSkill(skillId, params = {}) {
      const skill = this.availableSkills.find((s) => s.id === skillId)
      if (!skill) {
        throw new Error('Skill不存在')
      }

      if (!this.enabledSkillIds.includes(skillId)) {
        throw new Error('Skill未启用')
      }

      this.executingSkills.add(skillId)
      try {
        const response = await executeSkill(skillId, params)
        this.lastResult = {
          skillId,
          skillName: skill.name,
          result: response.data,
          timestamp: Date.now(),
        }
        return response.data
      } catch (err) {
        this.error = err.message
        console.error('执行Skill失败:', err)
        throw err
      } finally {
        this.executingSkills.delete(skillId)
      }
    },

    // 清除最后的执行结果
    clearLastResult() {
      this.lastResult = null
    },

    // 重置skills状态
    resetSkills() {
      this.availableSkills = []
      this.enabledSkillIds = []
      this.executingSkills.clear()
      this.lastResult = null
      this.error = null
    },
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'skills-store',
        storage: localStorage,
        paths: ['enabledSkillIds'],
      },
    ],
  },
})
