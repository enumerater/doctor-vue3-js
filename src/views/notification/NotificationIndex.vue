<template>
  <div class="notification-center">
    <ContentHeader title="通知中心">
      <template #actions>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索通知内容..."
            prefix-icon="Search"
            size="small"
            clearable
            class="search-input"
            @input="debouncedLoad"
          />
          <el-button 
            size="small" 
            text 
            type="primary" 
            @click="handleMarkAllRead" 
            :disabled="!store.hasUnread"
          >
            全部已读
          </el-button>
          <el-button 
            v-if="selection.length > 0"
            size="small" 
            type="danger" 
            plain
            @click="handleBatchDelete"
          >
            批量删除({{ selection.length }})
          </el-button>
        </div>
      </template>
    </ContentHeader>

    <div class="notification-body">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-group">
          <el-radio-group v-model="filterType" size="small" @change="loadNotifications">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="system">系统通知</el-radio-button>
            <el-radio-button value="disease_alert">病害预警</el-radio-button>
            <el-radio-button value="guide">农事指南</el-radio-button>
            <el-radio-button value="weather_alert">天气预警</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-group">
          <el-select v-model="filterRead" size="small" placeholder="阅读状态" @change="loadNotifications" style="width: 100px">
            <el-option label="全部状态" value="" />
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </div>
      </div>

      <!-- 通知列表容器 -->
      <div v-loading="store.loading" class="notification-container">
        <div v-if="groupedNotifications.length > 0">
          <div v-for="group in groupedNotifications" :key="group.label" class="time-group">
            <div class="group-label">{{ group.label }}</div>
            <div class="notification-list">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="notification-item"
                :class="{ 
                  unread: !item.read, 
                  'is-high': item.priority === 'high',
                  'is-selected': selection.includes(item.id)
                }"
                @click="handleClick(item)"
              >
                <!-- 选择框 -->
                <div class="ntf-checkbox" @click.stop>
                  <el-checkbox 
                    :model-value="selection.includes(item.id)" 
                    @change="(val) => handleToggleSelect(item.id, val)"
                  />
                </div>

                <!-- 图标 -->
                <div class="ntf-icon" :class="item.type">
                  <el-icon :size="20">
                    <WarningFilled v-if="item.type === 'disease_alert'" />
                    <Notebook v-if="item.type === 'guide'" />
                    <Cloudy v-if="item.type === 'weather_alert'" />
                    <Bell v-if="item.type === 'system'" />
                  </el-icon>
                  <span v-if="item.priority === 'high'" class="priority-tag">!</span>
                </div>

                <!-- 内容 -->
                <div class="ntf-content">
                  <div class="ntf-header">
                    <span class="ntf-title">{{ item.title }}</span>
                    <span class="ntf-dot" v-if="!item.read"></span>
                    <span class="ntf-time-sub">{{ formatTimeBrief(item.createdAt) }}</span>
                  </div>
                  <p class="ntf-body">{{ item.content }}</p>
                </div>

                <!-- 操作按钮 -->
                <div class="ntf-actions">
                  <el-button
                    text
                    size="small"
                    type="danger"
                    @click.stop="handleDelete(item.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无通知" :image-size="120" />
        
        <!-- 分页 -->
        <div v-if="store.total > 20" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="20"
            layout="prev, pager, next"
            :total="store.total"
            @current-change="loadNotifications"
          />
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="activeItem?.title"
      width="500px"
      destroy-on-close
      class="ntf-detail-dialog"
    >
      <div v-if="activeItem" class="detail-container">
        <div class="detail-meta">
          <el-tag :type="getTypeTag(activeItem.type)" size="small">{{ getTypeName(activeItem.type) }}</el-tag>
          <span class="detail-time">{{ activeItem.createdAt }}</span>
        </div>
        <div class="detail-content">
          {{ activeItem.content }}
        </div>
        <div v-if="activeItem.link" class="detail-footer">
          <el-button type="primary" @click="handleGoLink(activeItem.link)">立即查看</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  WarningFilled, Clock, CircleCheck, Cloudy, Bell, Delete, Search, Notebook
} from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useNotificationStore } from '@/stores/notification'
import _ from 'lodash'

const router = useRouter()
const store = useNotificationStore()

// 状态
const filterType = ref('')
const filterRead = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const selection = ref([])
const activeItem = ref(null)
const detailVisible = ref(false)

onMounted(() => {
  loadNotifications()
})

// 加载数据
const loadNotifications = () => {
  const params = {
    page: currentPage.value,
    type: filterType.value,
    readStatus: filterRead.value !== '' ? filterRead.value : undefined,
    keyword: searchQuery.value
  }
  store.fetchNotifications(params)
}

const debouncedLoad = _.debounce(loadNotifications, 300)

// 分组逻辑
const groupedNotifications = computed(() => {
  if (!store.notifications.length) return []
  
  const groups = {
    '今天': [],
    '昨天': [],
    '更早': []
  }

  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = today - 86400000

  store.notifications.forEach(item => {
    const d = new Date(item.createdAt).getTime()
    if (d >= today) groups['今天'].push(item)
    else if (d >= yesterday) groups['昨天'].push(item)
    else groups['更早'].push(item)
  })

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }))
})

// 交互操作
const handleClick = async (item) => {
  activeItem.value = item
  detailVisible.value = true
  if (!item.read) {
    await store.markAsRead(item.id)
  }
}

const handleToggleSelect = (id, val) => {
  if (val) {
    selection.value.push(id)
  } else {
    selection.value = selection.value.filter(i => i !== id)
  }
}

const handleMarkAllRead = async () => {
  await store.markAllAsRead()
  ElMessage.success('已全部标为已读')
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 条通知？`, '批量删除', {
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await store.deleteNotifications(selection.value)
    selection.value = []
    ElMessage.success('删除成功')
  } catch {}
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此通知？', '提示', { type: 'warning' })
    await store.deleteNotifications([id])
    selection.value = selection.value.filter(i => i !== id)
  } catch {}
}

const handleGoLink = (link) => {
  detailVisible.value = false
  router.push(link)
}

// 辅助函数
const formatTimeBrief = (dateStr) => {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getTypeName = (type) => {
  const map = {
    system: '系统通知',
    disease_alert: '病害预警',
    guide: '农事指南',
    weather_alert: '天气预警'
  }
  return map[type] || '通知'
}

const getTypeTag = (type) => {
  const map = {
    system: 'info',
    disease_alert: 'danger',
    guide: 'success',
    weather_alert: 'primary'
  }
  return map[type] || ''
}
</script>

<style lang="scss" scoped>
.notification-center {
  padding-bottom: 40px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;

  .search-input {
    width: 200px;
    @include mobile { width: 140px; }
  }
}

.notification-body {
  padding: 0 24px;
  @include mobile { padding: 0 16px; }
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .filter-group {
    display: flex;
    gap: 8px;
  }

  :deep(.el-radio-button__inner) {
    border-radius: 20px !important;
    border: 1px solid $border !important;
    padding: 6px 14px;
    margin-right: 8px;
    background: transparent;
  }
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: $primary !important;
    border-color: $primary !important;
  }
}

.time-group {
  margin-bottom: 24px;
  
  .group-label {
    font-size: 13px;
    color: $text-tertiary;
    font-weight: 600;
    margin-bottom: 12px;
    padding-left: 4px;
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: $primary-light;
    transform: translateY(-1px);
    box-shadow: $shadow-sm;

    .ntf-actions { opacity: 1; }
  }

  &.unread {
    background: linear-gradient(to right, rgba($primary, 0.04), transparent);
    border-left: 3px solid $primary;
  }

  &.is-high::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 20px 20px 0;
    border-color: transparent $danger transparent transparent;
  }

  &.is-selected {
    background: rgba($primary, 0.08);
    border-color: $primary;
  }
}

.ntf-checkbox {
  padding: 0 4px;
}

.ntf-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  &.disease_alert { background: rgba($danger, 0.1); color: $danger; }
  &.guide { background: rgba($primary, 0.1); color: $primary; }
  &.weather_alert { background: rgba(#4299e1, 0.1); color: #4299e1; }
  &.system { background: rgba($text-secondary, 0.1); color: $text-secondary; }

  .priority-tag {
    position: absolute;
    top: -4px;
    right: -4px;
    background: $danger;
    color: white;
    font-size: 10px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
  }
}

.ntf-content {
  flex: 1;
  min-width: 0;
}

.ntf-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ntf-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
}

.ntf-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $primary;
}

.ntf-time-sub {
  margin-left: auto;
  font-size: 12px;
  color: $text-tertiary;
}

.ntf-body {
  font-size: 13.5px;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
  @include text-ellipsis(1);
}

.ntf-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.detail-container {
  .detail-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid $border;

    .detail-time {
      font-size: 12px;
      color: $text-tertiary;
    }
  }

  .detail-content {
    font-size: 15px;
    line-height: 1.8;
    color: $text-primary;
    white-space: pre-wrap;
    margin-bottom: 24px;
  }

  .detail-footer {
    display: flex;
    justify-content: flex-end;
  }
}

:deep(.ntf-detail-dialog) {
  border-radius: $radius-lg;
  .el-dialog__header { margin-right: 0; padding-bottom: 10px; }
  .el-dialog__title { font-weight: 700; }
}
</style>
