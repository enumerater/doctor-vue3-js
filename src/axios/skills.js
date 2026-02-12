import request from '@/utils/requests'

/**
 * 获取所有可用的Skills
 * @returns {Promise}
 */
export const getSkills = () => {
  return request({
    url: '/skills',
    method: 'get',
  })
}

/**
 * 更新Skill启用状态
 * @param {string} skillId - Skill ID
 * @param {boolean} enabled - 是否启用
 * @returns {Promise}
 */
export const updateSkillStatus = (skillId, enabled) => {
  return request({
    url: `/skills/${skillId}/status`,
    method: 'put',
    data: { enabled },
  })
}

/**
 * 执行Skill
 * @param {string} skillId - Skill ID
 * @param {object} params - 执行参数
 * @returns {Promise}
 */
export const executeSkill = (skillId, params) => {
  return request({
    url: `/skills/${skillId}/execute`,
    method: 'post',
    data: params,
  })
}

/**
 * 获取Skill执行历史
 * @param {string} skillId - Skill ID
 * @param {number} limit - 返回数量限制
 * @returns {Promise}
 */
export const getSkillHistory = (skillId, limit = 10) => {
  return request({
    url: `/skills/${skillId}/history`,
    method: 'get',
    params: { limit },
  })
}
