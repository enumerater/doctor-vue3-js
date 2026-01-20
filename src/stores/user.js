import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    token: '',
    username: '',
    id: '',
  })
  // 登录
  function setUser(data) {
    user.value = {
      token: data.token,
      username: data.username,
      id: data.id,
    }
    // 登录成功后，将 token 存储到 localStorage
    localStorage.setItem('token', data.token)
    // 登录成功后，将 username 存储到 localStorage
    localStorage.setItem('username', data.username)
    // 登录成功后，将 id 存储到 localStorage
    localStorage.setItem('id', data.id)
  }

  return { user, setUser }
})
