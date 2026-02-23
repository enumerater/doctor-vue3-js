<template>
  <div class="chat-layout">
    <!-- PC: persistent sidebar -->
    <div class="chat-sidebar" :class="{ collapsed: sidebarStore.sidebarCollapsed }" v-if="!isMobile">
      <div class="sidebar-top">
        <button v-show="!sidebarStore.sidebarCollapsed" class="new-chat-btn" @click="handleNewChat">
          <el-icon><Plus /></el-icon>
          <span>新建对话</span>
        </button>
        <button class="collapse-btn" @click="sidebarStore.toggleSidebar()" :title="sidebarStore.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <el-icon><component :is="sidebarStore.sidebarCollapsed ? Expand : Fold" /></el-icon>
        </button>
      </div>
      <div class="sidebar-search" v-show="!sidebarStore.sidebarCollapsed">
        <div class="search-box">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="sidebarStore.searchKeyword"
            placeholder="搜索对话..."
            class="search-input"
          />
          <el-icon
            v-if="sidebarStore.searchKeyword"
            class="clear-icon"
            @click="sidebarStore.searchKeyword = ''"
          ><CircleClose /></el-icon>
        </div>
      </div>
      <div class="history-list" v-show="!sidebarStore.sidebarCollapsed">
        <HistoryList />
      </div>
    </div>

    <!-- Mobile: history drawer -->
    <el-drawer
      v-if="isMobile"
      v-model="showHistory"
      direction="ltr"
      size="75%"
      :show-close="false"
    >
      <template #header>
        <button class="new-chat-btn mobile" @click="handleNewChat">
          <el-icon><Plus /></el-icon>
          <span>新建对话</span>
        </button>
      </template>
      <div class="drawer-search">
        <div class="search-box">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="sidebarStore.searchKeyword"
            placeholder="搜索对话..."
            class="search-input"
          />
          <el-icon
            v-if="sidebarStore.searchKeyword"
            class="clear-icon"
            @click="sidebarStore.searchKeyword = ''"
          ><CircleClose /></el-icon>
        </div>
      </div>
      <HistoryList />
    </el-drawer>

    <!-- Main content -->
    <div class="chat-main">

      <!-- Mobile: toolbar -->
      <div class="mobile-toolbar" v-if="isMobile">
        <el-button text @click="showHistory = true">
          <el-icon><List /></el-icon>
          历史记录
        </el-button>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import HistoryList from '@/components/HistoryList.vue'
import { Plus, Search, CircleClose, List, Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()

const isMobile = ref(window.innerWidth <= 768)
const showHistory = ref(false)

// Provide showHistory and isMobile to child components
provide('showHistory', showHistory)
provide('isMobile', isMobile)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await sidebarStore.fetchHistoryList()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleNewChat = async () => {
  sidebarStore.isAgricultureAgent = false
  sidebarStore.agentImageUploadEnabled = false
  await sidebarStore.prepareConversation()
  chatStore.clearMessages()
  showHistory.value = false
  router.push({ name: 'chatHome' })
}
</script>

<style lang="scss" scoped>
.chat-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.chat-sidebar {
  width: 280px;
  background: $bg-main;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid $border;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.collapsed {
    width: 48px;

    .sidebar-top {
      justify-content: center;
      padding: 12px 8px;
    }
  }

  .sidebar-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid $border;

    .new-chat-btn {
      flex: 1;
      min-width: 0;
    }

    .collapse-btn {
      flex-shrink: 0;
    }
  }

  .sidebar-search {
    padding: 12px 14px;
  }

  .history-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 6px;
  }
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $border;
  border-radius: $radius-sm;
  background: $bg-card;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $primary;
    border-color: $primary;
    background: $primary-light;
  }

  .el-icon {
    font-size: 16px;
  }
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, $primary, $secondary);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-fast;
  box-shadow: 0 2px 8px rgba(74, 155, 94, 0.25);

  &:hover {
    box-shadow: 0 4px 14px rgba(74, 155, 94, 0.35);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(74, 155, 94, 0.2);
  }

  .el-icon {
    font-size: 18px;
  }

  &.mobile {
    padding: 8px 14px;
    font-size: 14px;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid $border;
  border-radius: $radius-sm;
  transition: $transition-fast;

  &:focus-within {
    border-color: $primary;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(74, 155, 94, 0.1);
  }

  .search-icon {
    color: $text-tertiary;
    font-size: 16px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: $text-primary;
    min-width: 0;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  .clear-icon {
    color: $text-tertiary;
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    transition: $transition-fast;

    &:hover {
      color: $text-secondary;
    }
  }
}

.drawer-search {
  padding: 0 12px 12px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.mobile-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid $border;
  background: #fff;
}
</style>
