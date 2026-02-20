<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  ChatDotRound,
  Camera,
  DataAnalysis,
  Reading,
  OfficeBuilding,
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: Boolean,
})

const route = useRoute()
const router = useRouter()

const menuItems = [
  { index: '/workbench', icon: HomeFilled, label: '工作台' },
  { index: '/chat', icon: ChatDotRound, label: 'AI 对话' },
  { index: '/vision', icon: Camera, label: '图像诊断' },
  { index: '/dashboard', icon: DataAnalysis, label: '数据看板' },
  { index: '/knowledge', icon: Reading, label: '知识库' },
  { index: '/farm', icon: OfficeBuilding, label: '我的农场' },
]

const activeMenu = computed(() => {
  const path = route.path
  // 匹配子路由
  const match = menuItems.find(
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
        <el-icon><component :is="item.icon" /></el-icon>
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
</style>
