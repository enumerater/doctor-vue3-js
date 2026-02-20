<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useKnowledgeStore } from '@/stores/knowledge'
import { ChatLineSquare, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const sidebarStore = useSidebarStore()
const knowledgeStore = useKnowledgeStore()

// Recent chat sessions (last 3)
const recentChats = computed(() => {
  return (sidebarStore.historyList || []).slice(0, 3)
})

// Seasonal risk alerts
const seasonalAlerts = computed(() => {
  return (knowledgeStore.seasonalRisks || []).slice(0, 2)
})

const hasContent = computed(() => {
  return recentChats.value.length > 0 || seasonalAlerts.value.length > 0
})

function handleChatClick(item) {
  const sessionType = item.sessionType || 'chat'
  sidebarStore.selectHistoryItem(item.sessionId || item.id, sessionType)
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Within 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    if (hours === 0) {
      const minutes = Math.floor(diff / 60000)
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }

  // Within 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // Older
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

onMounted(() => {
  // Fetch history if not already loaded
  if (sidebarStore.historyList.length === 0) {
    sidebarStore.fetchHistoryList().catch(() => {})
  }
  // Fetch seasonal risks
  knowledgeStore.fetchSeasonalRisks().catch(() => {})
})
</script>

<template>
  <el-card class="recent-activity-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="header-title">最近动态</span>
      </div>
    </template>

    <div v-if="!hasContent" class="empty-state">
      <p class="empty-text">暂无最近活动，开始您的第一次对话吧</p>
    </div>

    <el-timeline v-else>
      <!-- Recent chat sessions -->
      <el-timeline-item
        v-for="item in recentChats"
        :key="item.id || item.sessionId"
        :icon="ChatLineSquare"
        color="#4a9b5e"
        :timestamp="formatTime(item.createTime || item.updatedAt)"
        placement="top"
      >
        <div class="activity-item" @click="handleChatClick(item)">
          <span class="activity-title">
            {{ item.sessionTitle || '未命名对话' }}
          </span>
          <el-tag
            v-if="item.sessionType === 'agent'"
            size="small"
            effect="light"
            type="success"
          >
            Agent
          </el-tag>
        </div>
      </el-timeline-item>

      <!-- Seasonal alerts -->
      <el-timeline-item
        v-for="(alert, index) in seasonalAlerts"
        :key="'alert-' + index"
        :icon="Warning"
        color="#ed8936"
        timestamp="当季提醒"
        placement="top"
      >
        <div class="activity-item alert-item">
          <span class="activity-title">{{ alert.diseaseName || alert.name }}</span>
          <el-tag size="small" type="warning" effect="light">
            风险提醒
          </el-tag>
        </div>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style lang="scss" scoped>
.recent-activity-card {
  border: 1px solid $border;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  :deep(.el-card__header) {
    padding: 16px 20px 12px;
    border-bottom: 1px solid $border;
  }

  :deep(.el-card__body) {
    padding: 16px 20px 12px;
  }
}

.card-header {
  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}

.empty-state {
  @include flex-center;
  padding: 24px 0;
}

.empty-text {
  font-size: 13px;
  color: $text-tertiary;
  margin: 0;
}

.activity-item {
  @include flex-between;
  cursor: pointer;
  padding: 4px 0;
  transition: $transition-fast;

  &:hover .activity-title {
    color: $primary;
  }
}

.activity-title {
  font-size: 14px;
  color: $text-primary;
  transition: color 0.2s;
  @include text-ellipsis(1);
  flex: 1;
  margin-right: 8px;
}

.alert-item {
  cursor: default;

  &:hover .activity-title {
    color: $text-primary;
  }
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: $text-tertiary;
}
</style>
