import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
})

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 初始化用户数据（确保isTokenExpired计算属性能正确获取tokenExpiry）
    userStore.initUser()

    // 检查token是否过期
    if (userStore.isTokenExpired) {
      // token过期，清除用户数据
      userStore.logout()
      // 可以在这里添加重定向到登录页的逻辑
      console.warn('Token has expired, please login again')
    } else {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // 可以在这里添加重定向到登录页的逻辑
      console.warn('Unauthorized, please login again')
    }
    return Promise.reject(error)
  },
)

export default request
