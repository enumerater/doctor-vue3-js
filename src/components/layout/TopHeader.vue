<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar, ElIcon, ElBadge } from 'element-plus'
import { Menu, User, SwitchButton, Bell } from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: Boolean,
  isMobile: Boolean,
})

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const username = computed(() => userStore.user.username || '用户')

onMounted(() => {
  notificationStore.fetchUnreadCount()
})

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

const goHome = () => {
  router.push('/workbench')
}

const goNotifications = () => {
  router.push('/notifications')
}
</script>

<template>
  <header class="top-header">
    <div class="header-left">
      <el-icon class="menu-toggle" @click="emit('toggle-sidebar')" :size="20">
        <Menu />
      </el-icon>
      <div class="logo" @click="goHome">
        <span class="logo-icon">🌿</span>
        <span class="logo-text">小农</span>
      </div>
    </div>

    <div class="header-right">
      <!-- 通知铃铛 -->
      <div class="notification-bell" @click="goNotifications">
        <el-badge :value="notificationStore.unreadCount" :hidden="!notificationStore.hasUnread" :max="99">
          <el-icon :size="20"><Bell /></el-icon>
        </el-badge>
      </div>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-area">
          <el-avatar :size="32" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username" v-show="!isMobile">{{ username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" :icon="SwitchButton">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $header-height;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 1px 8px rgba(74, 155, 94, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  cursor: pointer;
  color: $text-secondary;
  transition: color 0.2s;
  padding: 6px;
  border-radius: 8px;

  &:hover {
    color: $primary;
    background: $primary-light;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 1px;
    background: linear-gradient(135deg, $primary, #2d7a3a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-bell {
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: $text-secondary;
  transition: all 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    color: $primary;
    background: $primary-light;
  }
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background 0.2s;

  &:hover {
    background: $primary-light;
  }

  .user-avatar {
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
  }

  .username {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
  }
}
</style>
