import request from '@/utils/requests'

export const upload = (file) => {
  return request({
    url: '/session/page',
    method: 'post',
    data: file,
  })
}
