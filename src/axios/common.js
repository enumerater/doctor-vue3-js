import request from '@/utils/requests'

export const upload = (data) => {
  return request({
    url: '/upload',
    method: 'post',
    data,
  })
}
