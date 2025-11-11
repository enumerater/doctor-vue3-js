import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { setupVant } from './utils/vant.js'

import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia.use(persist))
app.use(router)

// 调用 Vant 插件注册函数
setupVant(app)

app.mount('#app')
