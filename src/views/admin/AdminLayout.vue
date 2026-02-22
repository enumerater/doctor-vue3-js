<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="admin-logo">
        <span class="logo-icon">🌿</span>
        <span class="logo-text">管理后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        class="admin-menu"
      >
        <el-menu-item index="/admin">
          <el-icon><DataBoard /></el-icon>
          <span>系统概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/knowledge">
          <el-icon><Reading /></el-icon>
          <span>知识库管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/feedback">
          <el-icon><ChatLineSquare /></el-icon>
          <span>反馈审核</span>
        </el-menu-item>
      </el-menu>
      <div class="admin-back">
        <el-button type="primary" @click="goBack">
          <el-icon><HomeFilled /></el-icon>
          返回主页
        </el-button>
      </div>
    </div>
    <!-- Mobile top bar -->
    <div class="admin-topbar">
      <el-button class="topbar-back" text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回主页
      </el-button>
      <span class="topbar-title">管理后台</span>
    </div>
    <div class="admin-main">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataBoard, User, Reading, ChatLineSquare, ArrowLeft, HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const goBack = () => {
  router.push('/workbench')
}
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: $bg-main;
}

.admin-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid $border;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;

  @include mobile {
    display: none;
  }
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  border-bottom: 1px solid $border;

  .logo-icon {
    font-size: 22px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}

.admin-menu {
  flex: 1;
  border-right: none;
  padding: 12px 8px;

  :deep(.el-menu-item) {
    height: 44px;
    line-height: 44px;
    margin-bottom: 4px;
    border-radius: 10px;
    font-size: 14px;
    color: $text-secondary;

    &:hover {
      background: $primary-light;
      color: $primary;
    }

    &.is-active {
      background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.08));
      color: $primary;
      font-weight: 600;
    }
  }
}

.admin-back {
  padding: 16px;
  border-top: 1px solid $border;

  .el-button {
    width: 100%;
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    color: #fff;
    font-weight: 500;
    border-radius: $radius-sm;
    height: 40px;

    &:hover {
      opacity: 0.9;
    }
  }
}

.admin-topbar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  border-bottom: 1px solid $border;
  align-items: center;
  padding: 0 16px;
  z-index: 100;

  @include mobile {
    display: flex;
  }

  .topbar-back {
    color: $primary;
    font-size: 14px;
    font-weight: 500;
    padding: 0;

    .el-icon {
      margin-right: 4px;
    }
  }

  .topbar-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-right: 60px;
  }
}

.admin-main {
  flex: 1;
  margin-left: 220px;
  padding: 24px;
  min-height: 100vh;

  @include mobile {
    margin-left: 0;
    padding: 66px 16px 16px;
  }
}
</style>
