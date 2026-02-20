import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    token: '',
    username: '',
    id: '',
    sessionId: '',
    tokenExpiry: null,
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
    }

    // 登录成功后，将数据存储到 localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('id', data.id)
    localStorage.setItem('sessionId', data.sessionId)
    localStorage.setItem('tokenExpiry', tokenExpiry.toString())
  }

  // 初始化用户数据（从localStorage加载）
  function initUser() {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const id = localStorage.getItem('id')
    const sessionId = localStorage.getItem('sessionId')
    const tokenExpiry = localStorage.getItem('tokenExpiry')

    if (token && id) {
      user.value = {
        token,
        username,
        id,
        sessionId,
        tokenExpiry: tokenExpiry ? parseInt(tokenExpiry) : null,
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
    }

    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('id')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('tokenExpiry')
  }

  return { user, setUser, initUser, logout, isTokenExpired }
})
