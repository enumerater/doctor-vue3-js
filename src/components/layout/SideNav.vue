<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  ChatDotRound,
  Camera,

  Reading,
  OfficeBuilding,
  Bell,
  Setting,
} from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  collapsed: Boolean,
})

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const allMenuItems = [
  { index: '/workbench', icon: HomeFilled, label: '首页' },
  { index: '/chat', icon: ChatDotRound, label: 'chat小农' },
  { index: '/vision', icon: Camera, label: '图像诊断' },

  { index: '/knowledge', icon: Reading, label: '知识库' },
  { index: '/farm', icon: OfficeBuilding, label: '我的农场' },
  { index: '/notifications', icon: Bell, label: '通知中心', badge: true },
  { index: '/admin', icon: Setting, label: '管理后台', adminOnly: true },
]

const menuItems = computed(() =>
  allMenuItems.filter((item) => !item.adminOnly || userStore.isAdmin)
)

// 子路由 → 父菜单的映射（路由前缀不在 menuItems 中的情况）
const routeAliasMap = {
  '/diagnosis': '/vision',
  '/report': '/vision',
}

const activeMenu = computed(() => {
  const path = route.path
  // 先检查别名映射
  for (const [prefix, menuIndex] of Object.entries(routeAliasMap)) {
    if (path.startsWith(prefix)) return menuIndex
  }
  // 匹配子路由
  const match = allMenuItems.find(
    (item) => path === item.index || (item.index !== '/' && path.startsWith(item.index))
  )
  return match?.index || '/workbench'
})

const handleSelect = (index) => {
  router.push(index)
}
</script>

<template>
  <aside class="side-nav" :class="{ collapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="true"
      @select="handleSelect"
      class="side-menu"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.index"
        :index="item.index"
      >
        <el-badge
          v-if="item.badge && notificationStore.hasUnread"
          :value="notificationStore.unreadCount"
          :max="99"
          class="nav-badge"
        >
          <el-icon><component :is="item.icon" /></el-icon>
        </el-badge>
        <el-icon v-else><component :is="item.icon" /></el-icon>
        <template #title>{{ item.label }}</template>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style lang="scss" scoped>
.side-nav {
  position: fixed;
  left: 0;
  top: $header-height;
  bottom: 0;
  width: $sidebar-width;
  background: #fff;
  border-right: 1px solid $border;
  transition: width 0.3s ease;
  z-index: 900;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.side-menu {
  height: 100%;
  border-right: none;
  padding-top: 12px;

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px 8px;
    border-radius: 10px;
    font-size: 14px;
    color: $text-secondary;
    transition: all 0.2s ease;

    .el-icon {
      font-size: 18px;
    }

    &:hover {
      background: $primary-light;
      color: $primary;
    }

    &.is-active {
      background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.08));
      color: $primary;
      font-weight: 600;

      .el-icon {
        color: $primary;
      }
    }
  }

  // 折叠后的样式
  &.el-menu--collapse {
    :deep(.el-menu-item) {
      margin: 4px;
      padding: 0 !important;
      justify-content: center;
    }
  }
}

.nav-badge {
  :deep(.el-badge__content) {
    transform: scale(0.8) translateY(-4px);
  }
}
</style>
