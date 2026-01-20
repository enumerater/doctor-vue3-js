import request from '@/utils/requests'

export const getAllSession = () => {
  return request({
    url: '/session/page',
    method: 'get',
  })
}
