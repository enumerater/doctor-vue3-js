import request from '@/utils/requests'

export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}
