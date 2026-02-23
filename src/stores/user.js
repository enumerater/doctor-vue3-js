import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { updateProfile as updateProfileApi } from '@/axios/user'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    token: '',
    username: '',
    id: '',
    sessionId: '',
    tokenExpiry: null,
    avatar: '',
    email: '',
    hasPassword: false,
  })

  // 计算属性：检查token是否过期
  const isTokenExpired = computed(() => {
    if (!user.value.tokenExpiry) return true
    return Date.now() > user.value.tokenExpiry
  })

  // 登录
  function setUser(data) {
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
    user.value = {
      token: data.token,
      username: data.username,
      id: data.id,
      sessionId: data.sessionId,
      tokenExpiry,
      avatar: data.avatar || '',
      email: data.email || '',
      hasPassword: !!data.hasPassword,
    }

    // 登录成功后，将数据存储到 localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('id', data.id)
    localStorage.setItem('sessionId', data.sessionId)
    localStorage.setItem('tokenExpiry', tokenExpiry.toString())
    localStorage.setItem('avatar', data.avatar || '')
    localStorage.setItem('email', data.email || '')
    localStorage.setItem('hasPassword', data.hasPassword ? '1' : '0')
  }

  // 初始化用户数据（从localStorage加载）
  function initUser() {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const id = localStorage.getItem('id')
    const sessionId = localStorage.getItem('sessionId')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    const avatar = localStorage.getItem('avatar')
    const email = localStorage.getItem('email')
    const hasPassword = localStorage.getItem('hasPassword')

    if (token && id) {
      user.value = {
        token,
        username,
        id,
        sessionId,
        tokenExpiry: tokenExpiry ? parseInt(tokenExpiry) : null,
        avatar: avatar || '',
        email: email || '',
        hasPassword: hasPassword === '1',
      }
    }
  }

  // 登出
  function logout() {
    user.value = {
      token: '',
      username: '',
      id: '',
      sessionId: '',
      tokenExpiry: null,
      avatar: '',
      email: '',
      hasPassword: false,
    }

    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('id')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('avatar')
    localStorage.removeItem('email')
    localStorage.removeItem('hasPassword')
  }

  // 更新个人信息（调用API + 同步本地状态）
  async function updateProfile(data) {
    const res = await updateProfileApi(data)
    if (data.username !== undefined) {
      user.value.username = data.username
      localStorage.setItem('username', data.username)
    }
    if (data.avatar !== undefined) {
      user.value.avatar = data.avatar
      localStorage.setItem('avatar', data.avatar)
    }
    return res
  }

  return { user, setUser, initUser, logout, isTokenExpired, updateProfile }
})
