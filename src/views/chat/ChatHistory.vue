<template>
  <div class="chat-history-page">
    <div class="history-header">
      <el-button text class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <span class="title">历史记录</span>
      <span class="spacer"></span>
    </div>

    <div class="history-search">
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

    <div class="history-list-wrap">
      <HistoryList />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import HistoryList from '@/components/HistoryList.vue'
import { ArrowLeft, Search, CircleClose } from '@element-plus/icons-vue'

const router = useRouter()
const sidebarStore = useSidebarStore()

onMounted(async () => {
  await sidebarStore.fetchHistoryList()
})

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.chat-history-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;

  .title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  .spacer {
    flex: 1;
  }
}

.back-btn {
  padding: 0 6px;
}

.history-search {
  padding: 10px 12px;
  flex-shrink: 0;
}

.history-list-wrap {
  flex: 1;
  overflow: hidden;
  padding: 0 6px 6px;
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
</style>
