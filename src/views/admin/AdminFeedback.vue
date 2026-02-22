<template>
  <div class="admin-feedback">
    <h2 class="page-title">反馈审核</h2>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总反馈</span>
      </div>
      <div class="stat-item correct">
        <span class="stat-value">{{ stats.correct }}</span>
        <span class="stat-label">诊断正确</span>
      </div>
      <div class="stat-item partial">
        <span class="stat-value">{{ stats.partial }}</span>
        <span class="stat-label">部分正确</span>
      </div>
      <div class="stat-item incorrect">
        <span class="stat-value">{{ stats.incorrect }}</span>
        <span class="stat-label">诊断错误</span>
      </div>
      <div class="stat-item accuracy">
        <span class="stat-value">{{ stats.accuracyRate }}%</span>
        <span class="stat-label">综合准确率</span>
      </div>
      <div class="stat-item rating">
        <span class="stat-value">{{ stats.avgRating }}</span>
        <span class="stat-label">平均评分</span>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterStatus" size="small" @change="loadData">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">已通过</el-radio-button>
        <el-radio-button value="rejected">已拒绝</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 反馈列表 -->
    <div v-loading="feedbackStore.loading" class="feedback-list">
      <div
        v-for="item in feedbackStore.feedbacks"
        :key="item.id"
        class="feedback-card"
      >
        <div class="fb-header">
          <div class="fb-user">
            <el-avatar :size="28">{{ (item.username || '用')[0] }}</el-avatar>
            <span class="fb-username">{{ item.username || '匿名' }}</span>
          </div>
          <div class="fb-badges">
            <el-tag size="small" :type="accuracyType[item.accuracy]">
              {{ accuracyLabel[item.accuracy] }}
            </el-tag>
            <el-tag size="small" :type="statusType[item.status]" effect="plain">
              {{ statusLabel[item.status] }}
            </el-tag>
          </div>
        </div>

        <div class="fb-body">
          <div class="fb-meta">
            <span>作物：{{ item.cropType }}</span>
            <span>AI诊断：{{ item.diagnosedDisease || '-' }}</span>
            <span v-if="item.correctDisease">实际病害：<strong>{{ item.correctDisease }}</strong></span>
          </div>
          <div class="fb-rating">
            <el-rate :model-value="item.rating" disabled size="small" />
          </div>
          <p v-if="item.comment" class="fb-comment">{{ item.comment }}</p>
          <span class="fb-time">{{ formatDate(item.createdAt) }}</span>
        </div>

        <div v-if="item.status === 'pending'" class="fb-actions">
          <el-button size="small" type="success" @click="handleApprove(item)">通过</el-button>
          <el-button size="small" type="danger" plain @click="handleReject(item)">拒绝</el-button>
        </div>
      </div>

      <el-empty v-if="!feedbackStore.loading && feedbackStore.feedbacks.length === 0" description="暂无反馈" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useFeedbackStore } from '@/stores/feedback'

const feedbackStore = useFeedbackStore()
const filterStatus = ref('')

const accuracyLabel = { correct: '诊断正确', partial: '部分正确', incorrect: '诊断错误' }
const accuracyType = { correct: 'success', partial: 'warning', incorrect: 'danger' }
const statusLabel = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusType = { pending: 'info', approved: 'success', rejected: 'danger' }

const stats = computed(() => feedbackStore.stats)

onMounted(() => {
  feedbackStore.fetchStats()
  loadData()
})

const loadData = () => {
  const params = {}
  if (filterStatus.value) params.status = filterStatus.value
  feedbackStore.fetchFeedbacks(params)
}

const handleApprove = async (item) => {
  await feedbackStore.updateStatus(item.id, 'approved')
  ElMessage.success('已通过')
}

const handleReject = async (item) => {
  await feedbackStore.updateStatus(item.id, 'rejected')
  ElMessage.success('已拒绝')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.admin-feedback {
  max-width: 1200px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 24px;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-item {
  @include card-base;
  padding: 16px 20px;
  flex: 1;
  min-width: 100px;
  text-align: center;

  .stat-value {
    display: block;
    font-size: 22px;
    font-weight: 700;
    color: $text-primary;
  }

  .stat-label {
    font-size: 12px;
    color: $text-tertiary;
    margin-top: 2px;
  }

  &.correct .stat-value { color: #48bb78; }
  &.partial .stat-value { color: #ed8936; }
  &.incorrect .stat-value { color: #e53e3e; }
  &.accuracy .stat-value { color: $primary; }
  &.rating .stat-value { color: #f6ad55; }
}

.filter-bar {
  margin-bottom: 16px;

  :deep(.el-radio-button__inner) {
    border-radius: 20px !important;
    border: none !important;
    padding: 6px 14px;
    font-size: 13px;
  }
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.feedback-card {
  @include card-base;
  padding: 16px;
}

.fb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.fb-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fb-username {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}

.fb-badges {
  display: flex;
  gap: 6px;
}

.fb-body {
  padding-left: 36px;
}

.fb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 6px;

  strong {
    color: #e53e3e;
  }
}

.fb-rating {
  margin-bottom: 4px;
}

.fb-comment {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.5;
  background: $bg-main;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 6px 0;
}

.fb-time {
  font-size: 12px;
  color: $text-tertiary;
}

.fb-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid $border;
}
</style>
