import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { setupVant } from './utils/vant.js'

import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useUserStore } from '@/stores/user'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia.use(persist))
app.use(router)

// 调用 Vant 插件注册函数
setupVant(app)

app.mount('#app')

// 初始化用户 Store（在挂载后进行）
const userStore = useUserStore()
userStore.initUser()

// 初始化 Agent 配置 Store（在挂载后进行）
const agentConfigStore = useAgentConfigStore()
agentConfigStore.fetchConfigs()
