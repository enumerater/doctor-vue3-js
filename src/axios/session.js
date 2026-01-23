import request from '@/utils/requests'

export const getAllSession = () => {
  return request({
    url: '/session/page',
    method: 'get',
  })
}

export const createSession = (data) => {
  return request({
    url: '/session',
    method: 'post',
    data,
  })
}

export const deleteSession = (id) => {
  return request({
    url: '/session',
    method: 'delete',
    params: {
      id,
    },
  })
}
