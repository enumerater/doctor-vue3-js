import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  // 基于Vite的base路径（/font/），路由路径会自动拼接这个前缀
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 路径相对base，实际访问路径为 /font/login（base + path）
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/vision',
      name: 'vision',
      component: () => import('@/views/VisionView.vue'),
      meta: { title: '智能诊断' },
    },
    {
      path: '/home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },

      children: [
        {
          path: 'chat/:sessionId',
          component: () => import('@/views/ChatDetail.vue'),
          name: 'chatDetail',
        },
        {
          path: 'begin',
          component: () => import('@/views/ChatContentBeginView.vue'),
          name: 'chatBegin',
        },
      ],
    },

    // 通配符路由：匹配不到时重定向到 /font/home（基于base）
    { path: '/:pathMatch(.*)*', redirect: '/home/begin' },
  ],
})

// 访问权限控制（修正白名单路径）
router.beforeEach((to) => {
  document.title = `智慧农业诊断-${to.meta.title || ''}`
  // 白名单路径基于base，实际对应 /font/login（与路由path一致）
  const whiteList = ['/login']
  // 判断当前路径是否在白名单内（to.path是相对base的路径，如'/login'）
  if (!localStorage.getItem('token') && !whiteList.includes(to.path)) {
    return '/login' // 重定向到 /font/login（基于base）
  }
})

export default router
