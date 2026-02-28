<template>
  <div class="history-list-container">
    <div class="history-content">
      <div class="empty-history" v-if="sidebarStore.filteredHistory.length === 0">
        <el-empty description="暂无对话历史记录" :image-size="80" class="empty-custom" />
      </div>

      <div class="history-item" :class="{
        active: item.sessionId === route.params.sessionId,
        'is-agent': item.sessionType === 'agent'
      }" v-for="item in sidebarStore.filteredHistory" :key="item.id"
        @click="handleSelectItem(item.sessionId, item.sessionType)">
        <el-badge is-dot v-if="item.unread" class="unread-dot" />

        <!-- Agent标识图标 -->
        <el-icon v-if="item.sessionType === 'agent'" class="agent-badge">
          <Sunny />
        </el-icon>

        <div class="item-main">
          <h3 class="item-title">{{ item.sessionTitle }}</h3>
          <div class="item-footer">
            <span class="item-time">{{ item.lastChatTime }}</span>
            <el-button size="small" text :icon="Delete" class="delete-btn"
              @click.stop="sidebarStore.deleteHistoryItem(item.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { Sunny, Delete } from '@element-plus/icons-vue'

const sidebarStore = useSidebarStore()
const route = useRoute()
const showHistory = inject('showHistory', null)

const handleSelectItem = (sessionId, sessionType) => {
  sidebarStore.selectHistoryItem(sessionId, sessionType)
  if (showHistory) showHistory.value = false
}

onMounted(() => {
  sidebarStore.fetchHistoryList()
})
</script>

<style lang="scss" scoped>
.history-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0;

  .empty-history {
    padding: 2rem 0;

    :deep(.el-empty) {
      .el-empty__description p {
        color: $text-secondary;
        font-size: 0.875rem;
      }

      .el-empty__image svg {
        color: $secondary;
        opacity: 0.8;
      }
    }
  }

  .history-item {
    padding: 0.75rem 1rem;
    margin: 0 0 0.25rem 0;
    border-radius: $radius-md;
    position: relative;
    cursor: pointer;
    transition: $transition;
    border: 1px solid transparent;

    &:hover {
      background-color: $primary-light;
    }

    &.active {
      background-color: $primary-light;
      border-color: rgba(56, 142, 60, 0.2);
      box-shadow: $shadow-sm;
    }

    // Agent对话样式
    &.is-agent {
      border-left: 3px solid #34c759;
      background: linear-gradient(to right, rgba(52, 199, 89, 0.05), transparent);

      &:hover {
        background: linear-gradient(to right, rgba(52, 199, 89, 0.1), rgba(232, 245, 233, 0.5));
      }

      &.active {
        background: linear-gradient(to right, rgba(52, 199, 89, 0.12), $primary-light);
        border-color: rgba(52, 199, 89, 0.4);
      }

      .item-title {
        color: #2e7d32;
      }
    }

    .unread-dot {
      position: absolute;
      top: 0.75rem;
      right: 1rem;
    }

    .agent-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.5rem;
      font-size: 1rem;
      color: #34c759;
      filter: drop-shadow(0 0 3px rgba(52, 199, 89, 0.3));
    }

    .item-main {
      padding-left: 0;

      .item-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.9375rem;
        color: $text-primary;
        font-weight: 500;
        line-height: 1.4;
      }
    }

    // Agent模式时，给标题留出空间
    &.is-agent .item-main {
      padding-left: 1.5rem;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-time {
        font-size: 0.75rem;
        color: $text-tertiary;
      }

      .delete-btn {
        color: $text-tertiary;
        transition: $transition-fast;

        &:hover {
          color: #e53e3e;
        }
      }
    }
  }
}


.history-content::-webkit-scrollbar {
  width: 4px;
}

.history-content::-webkit-scrollbar-track {
  background: transparent;
}

.history-content::-webkit-scrollbar-thumb {
  background: $secondary;
  border-radius: 2px;
  opacity: 0.6;
}
</style>
