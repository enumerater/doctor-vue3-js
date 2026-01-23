import request from '@/utils/requests'

export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'get',
    params: data,
  })
}

export const updateSesssionId = (data) => {
  return request({
    url: '/user',
    method: 'put',
    data,
  })
}

export const getUser = (id) => {
  return request({
    url: '/user/getById',
    method: 'get',
    params: id,
  })
}
