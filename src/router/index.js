import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', noLayout: true },
    },

    // ====== 主布局（AppShell） ======
    {
      path: '/',
      component: () => import('@/layouts/AppShell.vue'),
      redirect: '/workbench',
      children: [
        // 工作台首页
        {
          path: 'workbench',
          name: 'workbench',
          component: () => import('@/views/WorkbenchView.vue'),
          meta: { title: '首页' },
        },

        // ====== 对话 ======
        {
          path: 'chat',
          component: () => import('@/views/chat/ChatLayout.vue'),
          meta: { title: 'AI对话' },
          children: [
            {
              path: '',
              name: 'chatHome',
              component: () => import('@/views/chat/ChatHome.vue'),
              meta: { title: 'AI对话' },
            },
            {
              path: ':sessionId',
              name: 'chatDetail',
              component: () => import('@/views/chat/ChatDetail.vue'),
              meta: { title: '对话详情' },
            },
          ],
        },
        // Agent routes redirect to unified chat
        {
          path: 'agent',
          redirect: '/chat',
        },
        {
          path: 'agent/:sessionId',
          redirect: (to) => `/chat/${to.params.sessionId}`,
        },

        // ====== 图像诊断 ======
        {
          path: 'vision',
          name: 'vision',
          component: () => import('@/views/VisionView.vue'),
          meta: { title: '智能诊断' },
        },

        // ====== 诊断历史（已合并到图像诊断页） ======
        {
          path: 'diagnosis',
          redirect: '/vision',
        },
        {
          path: 'diagnosis/:diagnosisId',
          name: 'diagnosisDetail',
          component: () => import('@/views/diagnosis/DiagnosisDetail.vue'),
          meta: { title: '诊断详情' },
        },

        // ====== 报告预览 ======
        {
          path: 'report/:diagnosisId',
          name: 'reportPreview',
          component: () => import('@/views/report/ReportPreview.vue'),
          meta: { title: '诊断报告' },
        },

        // ====== 病害知识库 ======
        {
          path: 'knowledge',
          name: 'knowledge',
          component: () => import('@/views/knowledge/KnowledgeIndex.vue'),
          meta: { title: '病害知识库' },
        },
        {
          path: 'knowledge/crop/:cropName',
          name: 'knowledgeCrop',
          component: () => import('@/views/knowledge/KnowledgeCropList.vue'),
          meta: { title: '作物病害' },
        },
        {
          path: 'knowledge/disease/:diseaseId',
          name: 'knowledgeDetail',
          component: () => import('@/views/knowledge/KnowledgeDetail.vue'),
          meta: { title: '病害详情' },
        },
        {
          path: 'knowledge/search',
          name: 'knowledgeSearch',
          component: () => import('@/views/knowledge/KnowledgeSearch.vue'),
          meta: { title: '搜索病害' },
        },

        // ====== 农田地块管理 ======
        {
          path: 'farm',
          name: 'farm',
          component: () => import('@/views/farm/FarmIndex.vue'),
          meta: { title: '我的农场' },
        },
        {
          path: 'farm/create',
          name: 'farmCreate',
          component: () => import('@/views/farm/FarmCreate.vue'),
          meta: { title: '创建农场' },
        },
        {
          path: 'farm/:farmId',
          name: 'farmDetail',
          component: () => import('@/views/farm/FarmDetail.vue'),
          meta: { title: '农场详情' },
        },
        {
          path: 'farm/:farmId/plot/create',
          name: 'plotCreate',
          component: () => import('@/views/farm/PlotCreate.vue'),
          meta: { title: '添加地块' },
        },
        {
          path: 'farm/:farmId/plot/:plotId',
          name: 'plotDetail',
          component: () => import('@/views/farm/PlotDetail.vue'),
          meta: { title: '地块详情' },
        },
        {
          path: 'farm/:farmId/plot/:plotId/edit',
          name: 'plotEdit',
          component: () => import('@/views/farm/PlotEdit.vue'),
          meta: { title: '编辑地块' },
        },

        // ====== 通知中心 ======
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/notification/NotificationIndex.vue'),
          meta: { title: '通知中心' },
        },
      ],
    },

    // ====== 管理后台 ======
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { title: '管理后台', requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'adminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
          meta: { title: '系统概览' },
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('@/views/admin/AdminUsers.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'knowledge',
          name: 'adminKnowledge',
          component: () => import('@/views/admin/AdminKnowledge.vue'),
          meta: { title: '知识库管理' },
        },
        {
          path: 'feedback',
          name: 'adminFeedback',
          component: () => import('@/views/admin/AdminFeedback.vue'),
          meta: { title: '反馈审核' },
        },
      ],
    },

    // 兼容旧路由：重定向到新路径
    { path: '/home/begin', redirect: '/workbench' },
    { path: '/home/chat/:sessionId', redirect: (to) => `/chat/${to.params.sessionId}` },
    { path: '/home/agent', redirect: '/agent' },
    { path: '/home/agen/:sessionId', redirect: (to) => `/agent/${to.params.sessionId}` },
    { path: '/home', redirect: '/workbench' },
    // 通配符路由
    { path: '/:pathMatch(.*)*', redirect: '/workbench' },
  ],
})

// 访问权限控制
router.beforeEach((to) => {
  document.title = `智慧农业诊断-${to.meta.title || ''}`
  const whiteList = ['/login']
  if (!localStorage.getItem('token') && !whiteList.includes(to.path)) {
    return '/login'
  }
})

export default router
