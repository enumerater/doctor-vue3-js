import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  base: '/font/',
  server: {
    // allowedHosts: ['ec1162721tq84.vicp.fun'],
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    proxy: {
      '/api/java/ws/chat': {
        target: 'ws://localhost:8080/ws/chat',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/java\/ws\/chat/, ''),
      },
      '/api/java/ws/agent': {
        target: 'ws://localhost:8080/ws/agent',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/java\/ws\/agent/, ''),
      },
      '/api/java': {
        target: 'http://localhost:8080', // 你的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/java/, ''), // 如果后端接口不带 /api/java，请保留此重写
      },
    },
  },

  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
