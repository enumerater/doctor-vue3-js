<template>
  <div class="history-list-container">
    <div class="history-content">
      <div class="empty-history" v-if="sidebarStore.filteredHistory.length === 0">
        <van-empty description="暂无对话历史记录" icon="clock-o" class="empty-custom" />
      </div>

      <div
        class="history-item"
        :class="{ active: item.id === sidebarStore.activeItemId }"
        v-for="item in sidebarStore.filteredHistory"
        :key="item.id"
        @click="sidebarStore.selectHistoryItem(item.sessionId, item.sessionType)"
      >
        <van-badge dot v-if="item.unread" class="unread-dot" />

        <div class="item-main">
          <h3 class="item-title">{{ item.sessionTitle }}</h3>
          <div class="item-footer">
            <span class="item-time">{{ item.lastChatTime }}</span>
            <van-button
              size="mini"
              type="text"
              icon="delete"
              class="delete-btn"
              @click.stop="sidebarStore.deleteHistoryItem(item.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { onMounted } from 'vue'

const sidebarStore = useSidebarStore()

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

    :deep(.van-empty) {
      .van-empty__description {
        color: $text-secondary;
        font-size: 0.875rem;
      }
      .van-empty__image {
        .van-icon {
          color: $secondary;
          opacity: 0.8;
        }
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

    .unread-dot {
      position: absolute;
      top: 0.75rem;
      right: 1rem;
    }

    .item-main {
      .item-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.9375rem;
        color: $text-primary;
        font-weight: 500;
        line-height: 1.4;
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
