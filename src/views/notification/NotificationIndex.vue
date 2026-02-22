<template>
  <div class="notification-center">
    <ContentHeader title="通知中心">
      <template #actions>
        <el-badge :value="store.unreadCount" :hidden="!store.hasUnread" :max="99">
          <span></span>
        </el-badge>
        <el-button size="small" text type="primary" @click="handleMarkAllRead" :disabled="!store.hasUnread">
          全部已读
        </el-button>
      </template>
    </ContentHeader>

    <div class="notification-body">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterType" size="small" @change="loadNotifications">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="disease_alert">病害预警</el-radio-button>
          <el-radio-button value="treatment_remind">施药提醒</el-radio-button>
          <el-radio-button value="safety_interval">安全间隔</el-radio-button>
          <el-radio-button value="weather_alert">天气预警</el-radio-button>
          <el-radio-button value="system">系统通知</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 通知列表 -->
      <div v-loading="store.loading" class="notification-list">
        <div
          v-for="item in store.notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.read }"
          @click="handleClick(item)"
        >
          <div class="ntf-icon" :class="item.type">
            <el-icon :size="20">
              <WarningFilled v-if="item.type === 'disease_alert'" />
              <Clock v-if="item.type === 'treatment_remind'" />
              <CircleCheck v-if="item.type === 'safety_interval'" />
              <Cloudy v-if="item.type === 'weather_alert'" />
              <Bell v-if="item.type === 'system'" />
            </el-icon>
          </div>
          <div class="ntf-content">
            <div class="ntf-header">
              <span class="ntf-title">{{ item.title }}</span>
              <span class="ntf-dot" v-if="!item.read"></span>
            </div>
            <p class="ntf-body">{{ item.content }}</p>
            <span class="ntf-time">{{ formatTime(item.createdAt) }}</span>
          </div>
          <el-button
            class="ntf-delete"
            text
            size="small"
            type="danger"
            @click.stop="handleDelete(item.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <el-empty v-if="!store.loading && store.notifications.length === 0" description="暂无通知" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  WarningFilled, Clock, CircleCheck, Cloudy, Bell, Delete,
} from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const store = useNotificationStore()
const filterType = ref('')

onMounted(() => {
  loadNotifications()
})

const loadNotifications = () => {
  const params = {}
  if (filterType.value) params.type = filterType.value
  store.fetchNotifications(params)
}

const handleClick = async (item) => {
  if (!item.read) {
    await store.markAsRead(item.id)
  }
  if (item.link) {
    router.push(item.link)
  }
}

const handleMarkAllRead = async () => {
  await store.markAllAsRead()
  ElMessage.success('已全部标为已读')
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此通知？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await store.deleteNotification(id)
  } catch {
    // cancelled
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.notification-center {
  padding-bottom: 40px;
}

.notification-body {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.filter-bar {
  margin-bottom: 16px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 4px;

  :deep(.el-radio-button__inner) {
    border-radius: 20px !important;
    border: none !important;
    padding: 6px 14px;
    font-size: 13px;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: none;
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: $shadow-sm;

    .ntf-delete {
      opacity: 1;
    }
  }

  &.unread {
    background: rgba($primary, 0.03);
    border-color: rgba($primary, 0.15);
  }
}

.ntf-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.disease_alert {
    background: rgba(229, 62, 62, 0.1);
    color: #e53e3e;
  }
  &.treatment_remind {
    background: rgba(237, 137, 54, 0.1);
    color: #ed8936;
  }
  &.safety_interval {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
  }
  &.weather_alert {
    background: rgba(66, 153, 225, 0.1);
    color: #4299e1;
  }
  &.system {
    background: rgba(113, 128, 150, 0.1);
    color: #718096;
  }
}

.ntf-content {
  flex: 1;
  min-width: 0;
}

.ntf-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.ntf-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.ntf-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $primary;
  flex-shrink: 0;
}

.ntf-body {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.5;
  margin: 0 0 4px;
  @include text-ellipsis(2);
}

.ntf-time {
  font-size: 12px;
  color: $text-tertiary;
}

.ntf-delete {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
