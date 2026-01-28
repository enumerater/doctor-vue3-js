import request from '@/utils/requests'

export const memoryChat = (data) => {
  return request({
    url: '/chat/memory',
    method: 'get',
    params: data,
  })
}

export const getMessage = (sessionId) => {
  return request({
    url: '/message',
    method: 'get',
    params: sessionId,
  })
}

export const imageChat = (params) => {
  // 解构参数，兜底空值
  const { url = '', cropType = '' } = params || {}
  return request({
    url: '/vision',
    method: 'get',
    params: {
      url: url,
      cropType: cropType,
    },
    timeout: 60000, // 图像识别接口超时时间设置为1分钟
  })
}
