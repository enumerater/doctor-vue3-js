import request from '@/utils/requests'
import { compressImage } from '@/utils/image'

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

// 发送邮箱验证码（登录用）
// data: { email: string, type: 'login' }
export const sendCode = (data) => {
  return request({ url: '/user/sendCode', method: 'post', data })
}

// 邮箱验证码登录
// data: { email: string, code: string }
export const emailLogin = (data) => {
  return request({ url: '/user/emailLogin', method: 'post', data })
}

// 更新个人信息
// data: { username, avatar }
export const updateProfile = (data) => {
  return request({ url: '/user/profile', method: 'put', data })
}

// 修改密码
// data: { oldPassword, newPassword }
export const changePassword = (data) => {
  return request({ url: '/user/password', method: 'put', data })
}

// 上传头像文件，返回 URL
export const uploadAvatar = async (file) => {
  // 如果是图片且大于 2MB，进行压缩
  if (file.type.startsWith('image/')) {
    try {
      file = await compressImage(file, { maxSizeMB: 2 })
    } catch (error) {
      console.error('头像压缩失败:', error)
    }
  }
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/oss/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
