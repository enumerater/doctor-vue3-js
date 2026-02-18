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
      path: '/data',
      name: 'data',
      component: () => import('@/views/DataVision.vue'),
      meta: { title: '数据管理' },
    },

    // ====== 病害知识库 ======
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('@/views/knowledge/KnowledgeIndex.vue'),
      meta: { title: '病害知识库' },
    },
    {
      path: '/knowledge/crop/:cropName',
      name: 'knowledgeCrop',
      component: () => import('@/views/knowledge/KnowledgeCropList.vue'),
      meta: { title: '作物病害' },
    },
    {
      path: '/knowledge/disease/:diseaseId',
      name: 'knowledgeDetail',
      component: () => import('@/views/knowledge/KnowledgeDetail.vue'),
      meta: { title: '病害详情' },
    },
    {
      path: '/knowledge/search',
      name: 'knowledgeSearch',
      component: () => import('@/views/knowledge/KnowledgeSearch.vue'),
      meta: { title: '搜索病害' },
    },

    // ====== 农田地块管理 ======
    {
      path: '/farm',
      name: 'farm',
      component: () => import('@/views/farm/FarmIndex.vue'),
      meta: { title: '我的农场' },
    },
    {
      path: '/farm/create',
      name: 'farmCreate',
      component: () => import('@/views/farm/FarmCreate.vue'),
      meta: { title: '创建农场' },
    },
    {
      path: '/farm/:farmId',
      name: 'farmDetail',
      component: () => import('@/views/farm/FarmDetail.vue'),
      meta: { title: '农场详情' },
    },
    {
      path: '/farm/:farmId/plot/create',
      name: 'plotCreate',
      component: () => import('@/views/farm/PlotCreate.vue'),
      meta: { title: '添加地块' },
    },
    {
      path: '/farm/:farmId/plot/:plotId',
      name: 'plotDetail',
      component: () => import('@/views/farm/PlotDetail.vue'),
      meta: { title: '地块详情' },
    },
    {
      path: '/farm/:farmId/plot/:plotId/edit',
      name: 'plotEdit',
      component: () => import('@/views/farm/PlotEdit.vue'),
      meta: { title: '编辑地块' },
    },

    {
      path: '/home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
      name: 'home',

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
        {
          path: 'agent',
          name: 'agent',
          component: () => import('@/views/AgentHomeView.vue'),
          meta: { title: 'Agent小农' },
        },
        {
          path: 'agen/:sessionId',
          name: 'agentDetil',
          component: () => import('@/views/AgentDetil.vue'),
          meta: { title: 'Agent详情' },
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
