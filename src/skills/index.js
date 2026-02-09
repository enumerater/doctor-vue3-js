/**
 * Skills注册中心
 * 管理所有可用的skills
 */

import diseaseRecognition from './diseaseRecognition'
import fertilizerCalculator from './fertilizerCalculator'
import weatherForecast from './weatherForecast'
import priceQuery from './priceQuery'

// 注册所有skills
export const registeredSkills = [
  diseaseRecognition,
  fertilizerCalculator,
  weatherForecast,
  priceQuery
]

// Skill分类
export const skillCategories = {
  diagnosis: {
    name: '诊断识别',
    icon: '🔍',
    description: '病害诊断、图片识别等'
  },
  management: {
    name: '田间管理',
    icon: '🌾',
    description: '施肥、浇水、除草等管理建议'
  },
  information: {
    name: '信息查询',
    icon: '📊',
    description: '天气、价格、市场信息等'
  },
  other: {
    name: '其他',
    icon: '🔧',
    description: '其他功能'
  }
}

// 根据ID获取skill
export const getSkillById = (skillId) => {
  return registeredSkills.find(skill => skill.id === skillId)
}

// 根据分类获取skills
export const getSkillsByCategory = (category) => {
  return registeredSkills.filter(skill => skill.category === category)
}

// 解析@命令
export const parseSkillCommand = (text) => {
  // 检查是否包含@命令
  if (!text.includes('@')) {
    return null
  }

  // 遍历所有skills，查找匹配的trigger
  for (const skill of registeredSkills) {
    if (!skill.triggers) continue

    for (const trigger of skill.triggers) {
      if (text.includes(trigger)) {
        // 提取@命令后的参数
        const commandIndex = text.indexOf(trigger)
        const afterCommand = text.substring(commandIndex + trigger.length).trim()

        return {
          skillId: skill.id,
          skill,
          trigger,
          params: afterCommand,
          originalText: text
        }
      }
    }
  }

  return null
}

// 验证skill参数
export const validateSkillParams = (skill, params) => {
  if (typeof skill.validate === 'function') {
    return skill.validate(params)
  }

  // 默认验证：检查必填参数
  for (const param of skill.params || []) {
    if (param.required && !params[param.name]) {
      return {
        valid: false,
        error: `缺少必填参数: ${param.description || param.name}`
      }
    }
  }

  return { valid: true }
}

// 执行skill
export const executeSkill = async (skillId, params, context) => {
  const skill = getSkillById(skillId)

  if (!skill) {
    throw new Error(`Skill不存在: ${skillId}`)
  }

  // 验证参数
  const validation = validateSkillParams(skill, params)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 执行skill
  if (typeof skill.execute !== 'function') {
    throw new Error('Skill没有实现execute方法')
  }

  return await skill.execute(params, context)
}

export default {
  registeredSkills,
  skillCategories,
  getSkillById,
  getSkillsByCategory,
  parseSkillCommand,
  validateSkillParams,
  executeSkill
}
