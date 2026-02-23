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

// 发送邮箱验证码（注册和登录共用）
// data: { email: string, type: 'register' | 'login' }
export const sendCode = (data) => {
  return request({ url: '/user/sendCode', method: 'post', data })
}

// 邮箱验证码登录
// data: { email: string, code: string }
export const emailLogin = (data) => {
  return request({ url: '/user/emailLogin', method: 'post', data })
}

// 注册
// data: { email: string, code: string, username: string, password: string }
export const register = (data) => {
  return request({ url: '/user/register', method: 'post', data })
}
