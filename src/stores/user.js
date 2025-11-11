import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    token: '',
    username: '',
  })
  // 登录
  function setUser(data) {
    user.value = {
      token: data.token,
      username: data.username,
    }
    // 登录成功后，将 token 存储到 localStorage
    localStorage.setItem('token', data.token)
  }

  return { user, setUser }
})
