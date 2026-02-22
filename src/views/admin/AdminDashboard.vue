<template>
  <div class="admin-dashboard">
    <h2 class="page-title">系统概览</h2>

    <!-- KPI 卡片 -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpiList" :key="kpi.label">
        <div class="kpi-icon" :style="{ background: kpi.bg, color: kpi.color }">
          <el-icon :size="24"><component :is="kpi.icon" /></el-icon>
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-grid">
        <div class="action-card" @click="$router.push('/admin/users')">
          <el-icon :size="28" color="#4299e1"><User /></el-icon>
          <span>管理用户</span>
        </div>
        <div class="action-card" @click="$router.push('/admin/knowledge')">
          <el-icon :size="28" color="#48bb78"><Reading /></el-icon>
          <span>管理知识库</span>
        </div>
        <div class="action-card" @click="$router.push('/admin/feedback')">
          <el-icon :size="28" color="#ed8936"><ChatLineSquare /></el-icon>
          <span>审核反馈</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { User, Reading, ChatLineSquare, UserFilled, Histogram, Document, Star } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()

onMounted(() => {
  store.fetchSystemStats()
})

const kpiList = computed(() => [
  {
    label: '总用户数',
    value: store.systemStats.totalUsers,
    icon: UserFilled,
    bg: 'rgba(66, 153, 225, 0.1)',
    color: '#4299e1',
  },
  {
    label: '今日活跃',
    value: store.systemStats.activeToday,
    icon: User,
    bg: 'rgba(72, 187, 120, 0.1)',
    color: '#48bb78',
  },
  {
    label: '总诊断量',
    value: store.systemStats.totalDiagnoses,
    icon: Histogram,
    bg: 'rgba(159, 122, 234, 0.1)',
    color: '#9f7aea',
  },
  {
    label: '今日诊断',
    value: store.systemStats.diagnosesToday,
    icon: Document,
    bg: 'rgba(237, 137, 54, 0.1)',
    color: '#ed8936',
  },
  {
    label: 'AI准确率',
    value: store.systemStats.avgAccuracy + '%',
    icon: Star,
    bg: 'rgba(246, 173, 85, 0.1)',
    color: '#f6ad55',
  },
  {
    label: '知识库词条',
    value: store.systemStats.knowledgeEntries,
    icon: Reading,
    bg: 'rgba(72, 187, 120, 0.1)',
    color: '#48bb78',
  },
  {
    label: '反馈总数',
    value: store.systemStats.feedbackCount,
    icon: ChatLineSquare,
    bg: 'rgba(66, 153, 225, 0.1)',
    color: '#4299e1',
  },
  {
    label: '待审核反馈',
    value: store.systemStats.feedbackPending,
    icon: ChatLineSquare,
    bg: 'rgba(229, 62, 62, 0.1)',
    color: '#e53e3e',
  },
])
</script>

<style lang="scss" scoped>
.admin-dashboard {
  max-width: 1200px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 24px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.kpi-card {
  @include card-base;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.2;
}

.kpi-label {
  font-size: 13px;
  color: $text-tertiary;
  margin-top: 2px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.action-card {
  @include card-base;
  @include card-hover;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  span {
    font-size: 14px;
    color: $text-secondary;
    font-weight: 500;
  }
}
</style>
