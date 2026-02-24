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
    role: 0,     // 0普通用户 1管理员
    status: 1,   // 0禁用 1正常
  })

  // 计算属性：检查token是否过期
  const isTokenExpired = computed(() => {
    if (!user.value.tokenExpiry) return true
    return Date.now() > user.value.tokenExpiry
  })

  // 计算属性：是否为管理员
  const isAdmin = computed(() => user.value.role === 1)

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
      role: data.role ?? 0,
      status: data.status ?? 1,
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
    localStorage.setItem('role', String(data.role ?? 0))
    localStorage.setItem('status', String(data.status ?? 1))
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
    const role = localStorage.getItem('role')
    const status = localStorage.getItem('status')

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
        role: role ? parseInt(role) : 0,
        status: status ? parseInt(status) : 1,
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
      role: 0,
      status: 1,
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
    localStorage.removeItem('role')
    localStorage.removeItem('status')
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

  return { user, setUser, initUser, logout, isTokenExpired, isAdmin, updateProfile }
})
