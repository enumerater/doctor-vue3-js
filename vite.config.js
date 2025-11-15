import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // 允许访问的主机列表
    allowedHosts: [
      'ec1162721tq84.vicp.fun', // 添加上你的花生壳域名
      // 可选：如果需要允许其他主机，继续添加在这里
    ],
    // 补充：如果需要通过局域网/外部访问，建议同时设置 host 为 0.0.0.0
    host: '0.0.0.0', // 允许所有网络接口访问
    port: 5173, // 你的开发服务器端口（根据实际情况修改）
  },

  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
