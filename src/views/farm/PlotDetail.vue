<template>
  <div class="plot-detail-page">
    <ContentHeader :title="store.currentPlot?.name || '地块详情'" :showBack="true">
      <template #actions>
        <el-button text class="action-btn" @click="goEdit">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button text class="action-btn danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
      </template>
    </ContentHeader>

    <div class="plot-detail" v-if="store.currentPlot">
      <!-- 基本信息 -->
      <div class="info-card">
        <div class="info-header">
          <span class="crop-icon">{{ cropIcon }}</span>
          <div class="info-main">
            <h2 class="plot-name">{{ store.currentPlot.name }}</h2>
            <span class="stage-badge">{{ store.currentPlot.growthStage || '未设置' }}</span>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">作物类型</span>
            <span class="info-value">{{ store.currentPlot.cropType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">面积</span>
            <span class="info-value">{{ store.currentPlot.area }}亩</span>
          </div>
          <div class="info-item">
            <span class="info-label">播种日期</span>
            <span class="info-value">{{ store.currentPlot.sowingDate || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">土壤类型</span>
            <span class="info-value">{{ store.currentPlot.soilType || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 更新生长阶段 -->
      <div class="stage-section">
        <div class="section-header">
          <h3 class="section-title">生长阶段</h3>
          <el-button type="primary" text size="small" @click="showStageDialog = true">
            更新阶段
          </el-button>
        </div>

        <!-- 生长阶段时间线 -->
        <div class="stage-timeline" v-if="store.currentPlot.stageHistory?.length > 0">
          <div
            v-for="(record, i) in store.currentPlot.stageHistory"
            :key="i"
            class="timeline-item"
            :class="{ current: i === store.currentPlot.stageHistory.length - 1 }"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-stage">{{ record.stage }}</span>
              <span class="timeline-date">{{ record.date }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-stage">暂无生长阶段记录</div>
      </div>

      <!-- 诊断记录 -->
      <div class="diagnosis-section">
        <div class="section-header">
          <h3 class="section-title">诊断记录</h3>
        </div>
        
        <div v-if="diagnosisStore.loading" v-loading="true" class="diagnosis-loading"></div>
        <div v-else-if="diagnosisStore.records.length > 0" class="diagnosis-list">
          <div 
            v-for="record in sortedRecords" 
            :key="record.id" 
            class="diagnosis-item"
            @click="goRecordDetail(record)"
          >
            <div class="item-icon" :class="record.type.toLowerCase()">
              <el-icon v-if="record.type === 'IMAGE'"><Picture /></el-icon>
              <el-icon v-else><ChatDotRound /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-header">
                <span class="item-title">{{ record.title || (record.type === 'IMAGE' ? '病害识别' : '对话诊断') }}</span>
                <span class="item-date">{{ formatDate(record.createdAt) }}</span>
              </div>
              <p class="item-preview">{{ record.content || '查看详情...' }}</p>
            </div>
            <div class="item-actions" @click.stop>
              <el-button 
                type="danger" 
                text 
                size="small" 
                :icon="Delete"
                @click="handleDeleteDiagnosis(record.id)"
              />
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
        <el-empty v-else description="暂无诊断记录" :image-size="60" />
      </div>
    </div>

    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>
    <el-empty v-else description="未找到地块信息" />

    <!-- 生长阶段选择弹窗 -->
    <el-dialog
      v-model="showStageDialog"
      title="更新生长阶段"
      width="500px"
      :close-on-click-modal="true"
    >
      <GrowthStageSelect
        v-model="selectedStage"
        :cropType="store.currentPlot?.cropType"
      />
      <template #footer>
        <el-button @click="showStageDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmStage" :disabled="!selectedStage">
          确认更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Picture, ChatDotRound, ArrowRight } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import GrowthStageSelect from '@/components/farm/GrowthStageSelect.vue'
import { useFarmStore } from '@/stores/farm'
import { usePlotDiagnosisStore } from '@/stores/plot_diagnosis'

const route = useRoute()
const router = useRouter()
const store = useFarmStore()
const diagnosisStore = usePlotDiagnosisStore()

const farmId = route.params.farmId
const plotId = route.params.plotId
const showStageDialog = ref(false)
const selectedStage = ref('')

onMounted(() => {
  store.fetchPlotDetail(farmId, plotId)
  diagnosisStore.fetchRecords(plotId)
})

const cropIcon = computed(() => {
  const map = {
    '小麦': '🌾', '水稻': '🌾', '玉米': '🌽', '番茄': '🍅',
    '黄瓜': '🥒', '辣椒': '🌶️', '草莓': '🍓', '苹果': '🍎',
    '葡萄': '🍇', '白菜': '🥬',
  }
  return map[store.currentPlot?.cropType] || '🌱'
})

const sortedRecords = computed(() => {
  return [...diagnosisStore.records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goEdit = () => {
  router.push({ name: 'plotEdit', params: { farmId, plotId } })
}

const goRecordDetail = (record) => {
  if (record.type === 'IMAGE') {
    router.push({ name: 'diagnosisDetail', params: { diagnosisId: record.targetId } })
  } else if (record.type === 'CHAT') {
    router.push({ name: 'chatDetail', params: { sessionId: record.targetId } })
  }
}

const handleDeleteDiagnosis = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消此诊断记录与地块的关联吗？此操作不会删除原始诊断记录。',
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await diagnosisStore.deleteRecord(id)
    ElMessage.success('已解除绑定')
  } catch {
    // cancelled
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '删除地块后数据不可恢复',
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await store.deletePlot(farmId, plotId)
    ElMessage.success('已删除')
    router.back()
  } catch {
    // 取消
  }
}

const confirmStage = async () => {
  if (!selectedStage.value) return
  await store.updateGrowthStage(farmId, plotId, {
    stage: selectedStage.value,
    date: new Date().toISOString().slice(0, 10),
  })
  ElMessage.success('已更新')
  showStageDialog.value = false
  selectedStage.value = ''
}
</script>

<style lang="scss" scoped>
.plot-detail-page {
  padding-bottom: 20px;
}

.plot-detail {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: $primary-light;
  color: $primary;
  transition: $transition-fast;

  &.danger { background: #fee2e2; color: $danger; }
  &:active { transform: scale(0.9); }
}

// 信息卡片
.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba($border, 0.5);
}

.crop-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  background: $primary-light;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-main { flex: 1; }

.plot-name {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 4px;
}

.stage-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label { font-size: 12px; color: $text-tertiary; }
.info-value { font-size: 14px; color: $text-primary; font-weight: 500; }

// 生长阶段
.stage-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

// 时间线
.stage-timeline {
  position: relative;
  padding-left: 24px;
}

.timeline-item {
  position: relative;
  padding-bottom: 18px;
  padding-left: 16px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -24px + 6px;
    top: 14px;
    bottom: 0;
    width: 2px;
    background: $border;
  }

  &.current .timeline-dot {
    background: $primary;
    box-shadow: 0 0 0 4px rgba($primary, 0.2);
  }

  &.current .timeline-stage {
    color: $primary;
    font-weight: 600;
  }
}

.timeline-dot {
  position: absolute;
  left: -24px + 2px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $border;
  border: 2px solid $bg-card;
}

.timeline-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-stage {
  font-size: 14px;
  color: $text-secondary;
}

.timeline-date {
  font-size: 12px;
  color: $text-tertiary;
}

.no-stage {
  font-size: 13px;
  color: $text-tertiary;
  text-align: center;
  padding: 20px 0;
}

// 诊断记录
.diagnosis-section {
  margin-bottom: 20px;
}

.diagnosis-loading {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.diagnosis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diagnosis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: $primary;
    box-shadow: $shadow-sm;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  .item-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    &.image {
      background: rgba($primary, 0.1);
      color: $primary;
    }

    &.chat {
      background: rgba(#6366f1, 0.1);
      color: #6366f1;
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  .item-date {
    font-size: 12px;
    color: $text-tertiary;
  }

  .item-preview {
    font-size: 12px;
    color: $text-secondary;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-actions {
    display: none;
    margin-right: 8px;
  }

  &:hover .item-actions {
    display: block;
  }

  .arrow-icon {
    font-size: 14px;
    color: $text-tertiary;
  }
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}
</style>
