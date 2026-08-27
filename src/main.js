import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { setupElementPlus } from './utils/element.js'
import { setupVant } from './utils/vant.js'

import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
import { useUserStore } from '@/stores/user'

import * as echarts from 'echarts'
window.echarts = echarts

const pinia = createPinia()

const app = createApp(App)
app.use(pinia.use(persist))
app.use(router)

// Element Plus 全局注册
setupElementPlus(app)

// Vant 仅注册移动端必要组件
setupVant(app)

app.mount('#app')

// 初始化用户 Store（在挂载后进行）
const userStore = useUserStore()
userStore.initUser()
