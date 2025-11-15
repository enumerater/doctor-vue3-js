import request from '@/utils/requests'

export const chat = (data) => {
  return request({
    url: '/chat',
    method: 'post',
    data,
  })
}

export const UploadImage = (data) => {
  return request({
    url: '/upload',
    method: 'post',
    data,
  })
}

export const chatVis = (data) => {
  return request({
    url: '/scan/chat',
    method: 'post',
    data,
  })
}
