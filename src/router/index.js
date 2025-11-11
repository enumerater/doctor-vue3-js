import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/scan',
      name: 'ScanView',
      component: () => import('@/views/ScanView.vue'),
      meta: { title: '扫描' },
    },
    {
      path: '/',
      component: () => import('@/views/Layout/IndexLayout.vue'),
      redirect: '/home',
      children: [
        { path: '/home', component: () => import('@/views/HomeView.vue'), meta: { title: '首页' } },
        {
          path: '/article',
          component: () => import('@/views/ArticleView.vue'),
          meta: { title: '健康百科' },
        },
        {
          path: '/notify',
          component: () => import('@/views/NotifyView.vue'),
          meta: { title: '消息通知' },
        },
        {
          path: '/user',
          component: () => import('@/views/UserView.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },
    //匹配不到会主页
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

// 访问权限控制
router.beforeEach((to) => {
  // 处理标题
  document.title = `优医问诊-${to.meta.title || ''}`
  // 不需要登录的页面，白名单
  const wihteList = ['/login']
  // 如果没有登录且不在白名单内，去登录
  if (!localStorage.getItem('token') && !wihteList.includes(to.path)) return '/login'
  // 否则不做任何处理
})

export default router
