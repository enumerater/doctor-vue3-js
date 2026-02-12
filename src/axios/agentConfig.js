import request from '@/utils/requests'

// 获取用户的所有Agent配置
export const getAgentConfigs = () => {
  return request({
    url: '/agentConfig/list',
    method: 'get',
  })
}

// 获取单个配置详情
export const getAgentConfigDetail = (configId) => {
  return request({
    url: `/agentConfig/${configId}`,
    method: 'get',
  })
}

// 创建新配置
export const createAgentConfig = (data) => {
  return request({
    url: '/agentConfig',
    method: 'post',
    data,
  })
}

// 更新配置
export const updateAgentConfig = (configId, data) => {
  return request({
    url: `/agentConfig/${configId}`,
    method: 'put',
    data,
  })
}

// 删除配置
export const deleteAgentConfig = (configId) => {
  return request({
    url: `/agentConfig/${configId}`,
    method: 'delete',
  })
}

// 设置为默认配置
export const setDefaultConfig = (configId) => {
  return request({
    url: `/agentConfig/${configId}/setDefault`,
    method: 'put',
  })
}

// 复制配置
export const duplicateConfig = (configId) => {
  return request({
    url: `/agentConfig/${configId}/duplicate`,
    method: 'post',
  })
}

// 为会话设置Agent配置
export const setSessionAgentConfig = (sessionId, configId) => {
  return request({
    url: `/session/${sessionId}/agentConfig`,
    method: 'put',
    data: { configId },
  })
}

export const rename = (configId, name) => {
  return request({
    url: `/agentConfig/rename`,
    method: 'get',
    params: {
      configId: configId,
      name: name,
    },
  })
}
