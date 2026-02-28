<template>
  <div class="plot-detail-page">
    <ContentHeader :title="store.currentPlot?.name || '地块详情'" :showBack="true">
      <template #actions>
        <div class="header-actions">
          <el-button text class="action-btn" @click="goEdit">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button text class="action-btn danger" @click="handleDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </template>
    </ContentHeader>

    <div class="plot-content" v-if="store.currentPlot">
      <!-- 1. Hero Info Card -->
      <div class="hero-card">
        <div class="hero-main">
          <div class="crop-avatar">
            <span class="avatar-icon">{{ cropIcon }}</span>
            <div class="avatar-ring"></div>
          </div>
          <div class="hero-info">
            <div class="title-row">
              <h2 class="plot-name">{{ store.currentPlot.name }}</h2>
              <span class="stage-tag" v-if="store.currentPlot.growthStage">
                {{ store.currentPlot.growthStage }}
              </span>
            </div>
            <div class="hero-meta">
              <span class="meta-item"><el-icon><Collection /></el-icon> {{ store.currentPlot.cropType }}</span>
              <span class="meta-divider"></span>
              <span class="meta-item"><el-icon><Compass /></el-icon> {{ store.currentPlot.area }} 亩</span>
            </div>
          </div>
        </div>
        
        <div class="hero-grid">
          <div class="grid-item">
            <span class="grid-label">播种日期</span>
            <span class="grid-value">{{ store.currentPlot.sowingDate || '未设置' }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">土壤类型</span>
            <span class="grid-value">{{ store.currentPlot.soilType || '常规土壤' }}</span>
          </div>
          <div class="grid-item">
            <span class="grid-label">累计诊断</span>
            <span class="grid-value">{{ diagnosisStore.records.length }} 次</span>
          </div>
        </div>
      </div>

      <!-- 2. Growth Journey -->
      <div class="section-card journey-section">
        <div class="section-header">
          <div class="section-title-group">
            <el-icon class="title-icon"><TrendCharts /></el-icon>
            <h3 class="section-title">生长旅程</h3>
          </div>
          <el-button type="primary" size="small" round @click="showStageDialog = true">
            更新状态
          </el-button>
        </div>

        <div class="journey-timeline" v-if="store.currentPlot.stageHistory?.length > 0">
          <div
            v-for="(record, i) in [...store.currentPlot.stageHistory].reverse()"
            :key="i"
            class="journey-item"
            :class="{ latest: i === 0 }"
          >
            <div class="journey-node">
              <div class="node-dot"></div>
              <div class="node-line" v-if="i !== store.currentPlot.stageHistory.length - 1"></div>
            </div>
            <div class="journey-content">
              <div class="journey-header">
                <span class="journey-stage">{{ record.stage }}</span>
                <span class="journey-date">{{ formatDateShort(record.date) }}</span>
              </div>
              <div class="journey-desc" v-if="i === 0">当前处于此阶段</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-journey">
          <el-icon><Calendar /></el-icon>
          <p>暂无生长记录，点击上方按钮更新</p>
        </div>
      </div>

      <!-- 3. Diagnosis History -->
      <div class="section-card diagnosis-section">
        <div class="section-header">
          <div class="section-title-group">
            <el-icon class="title-icon"><List /></el-icon>
            <h3 class="section-title">诊断历史</h3>
          </div>
        </div>

        <div v-if="diagnosisStore.loading" class="diagnosis-loading">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="diagnosisStore.records.length > 0" class="diagnosis-list">
          <div 
            v-for="record in sortedRecords" 
            :key="record.id" 
            class="diagnosis-card"
            @click="goRecordDetail(record)"
          >
            <div class="diag-icon" :class="record.type.toLowerCase()">
              <el-icon v-if="record.type === 'IMAGE'"><Picture /></el-icon>
              <el-icon v-else><ChatDotRound /></el-icon>
            </div>
            <div class="diag-body">
              <div class="diag-header">
                <span class="diag-title">{{ record.title || (record.type === 'IMAGE' ? '病害识别' : '对话诊断') }}</span>
                <span class="diag-date">{{ formatDate(record.createdAt) }}</span>
              </div>
              <p class="diag-preview">{{ record.content || '点击查看详细诊断结果与建议...' }}</p>
            </div>
            <div class="diag-actions" @click.stop>
              <el-button 
                type="danger" 
                text 
                circle
                :icon="Delete"
                @click="handleDeleteDiagnosis(record.id)"
              />
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
        
        <div v-else class="empty-diagnosis">
          <div class="empty-illustration">🔍</div>
          <p>该地块暂无诊断记录</p>
        </div>
      </div>
    </div>

    <!-- Loading & Empty States -->
    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>
    <el-empty v-else description="未找到地块信息" />

    <!-- Stage Update Dialog -->
    <el-dialog
      v-model="showStageDialog"
      title="更新生长阶段"
      width="90%"
      max-width="500px"
      class="custom-dialog"
      :align-center="true"
    >
      <div class="dialog-body">
        <p class="dialog-tip">记录作物当前的生长状态，以便获得更精准的建议。</p>
        <GrowthStageSelect
          v-model="selectedStage"
          :cropType="store.currentPlot?.cropType"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showStageDialog = false" round>取消</el-button>
          <el-button type="primary" @click="confirmStage" :disabled="!selectedStage" round class="confirm-btn">
            确认更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, Delete, Picture, ChatDotRound, ArrowRight, 
  TrendCharts, Collection, Compass, List, Calendar
} from '@element-plus/icons-vue'
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
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`
  return dateStr
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
      '确定要取消此诊断记录与地块的关联吗？',
      '确认解除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await diagnosisStore.deleteRecord(id)
    ElMessage.success('已解除关联')
  } catch {
    // cancelled
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '删除地块后相关生长数据将永久消失，是否继续？',
      '确认删除地块',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await store.deletePlot(farmId, plotId)
    ElMessage.success('已成功删除地块')
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
  ElMessage.success('生长阶段已更新')
  showStageDialog.value = false
  selectedStage.value = ''
}
</script>

<style lang="scss" scoped>
.plot-detail-page {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

.plot-content {
  padding: 0 24px;
  max-width: 800px;
  margin: 0 auto;

  @include mobile { padding: 0 16px; }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: $bg-card;
  border: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: $transition-fast;

  &:hover { color: $primary; border-color: $primary; }
  &.danger:hover { color: $danger; border-color: $danger; }
}

// Hero Card
.hero-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 24px;
  box-shadow: $shadow-md;
  margin-bottom: 24px;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed $border;
}

.crop-avatar {
  position: relative;
  width: 70px;
  height: 70px;
  flex-shrink: 0;

  .avatar-icon {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, $primary-light, #ffffff);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    position: relative;
    z-index: 2;
    border: 1px solid rgba($primary, 0.1);
  }

  .avatar-ring {
    position: absolute;
    inset: -6px;
    border-radius: 24px;
    border: 2px solid rgba($primary, 0.1);
    z-index: 1;
  }
}

.hero-info { flex: 1; }

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.plot-name {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
}

.stage-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  background: $primary;
  color: white;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba($primary, 0.2);
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $text-tertiary;
  font-size: 14px;

  .meta-item { display: flex; align-items: center; gap: 4px; }
  .meta-divider { width: 1px; height: 12px; background: $border; }
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .grid-label { font-size: 11px; color: $text-tertiary; font-weight: 500; }
  .grid-value { font-size: 15px; color: $text-primary; font-weight: 700; }
}

// Section Cards
.section-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 20px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 20px;
  color: $primary;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

// Journey Timeline
.journey-timeline {
  position: relative;
  padding-left: 8px;
}

.journey-item {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;

  &:last-child { padding-bottom: 0; }
  
  &.latest {
    .node-dot { 
      background: $primary; 
      box-shadow: 0 0 0 4px rgba($primary, 0.2); 
    }
    .journey-stage { color: $primary; font-weight: 700; }
  }
}

.journey-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14px;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $border;
  border: 2px solid white;
  z-index: 2;
}

.node-line {
  width: 2px;
  flex: 1;
  background: $border;
  margin: 4px 0;
}

.journey-content {
  flex: 1;
  padding-top: -2px;
}

.journey-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.journey-stage { font-size: 15px; color: $text-primary; }
.journey-date { font-size: 12px; color: $text-tertiary; }
.journey-desc { font-size: 12px; color: $primary; opacity: 0.8; font-weight: 500; }

.empty-journey {
  text-align: center;
  padding: 30px 0;
  color: $text-tertiary;
  .el-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.3; }
  p { font-size: 14px; margin: 0; }
}

// Diagnosis List
.diagnosis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diagnosis-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: $radius-md;
  background: $bg-main;
  border: 1px solid transparent;
  cursor: pointer;
  transition: $transition-fast;
  position: relative;

  &:hover {
    background: white;
    border-color: $primary;
    box-shadow: $shadow-sm;
    transform: translateY(-2px);
    
    .arrow-icon { transform: translateX(4px); color: $primary; }
  }

  .diag-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;

    &.image { background: rgba($primary, 0.1); color: $primary; }
    &.chat { background: rgba(#6366f1, 0.1); color: #6366f1; }
  }

  .diag-body { flex: 1; min-width: 0; }

  .diag-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .diag-title { font-size: 15px; font-weight: 700; color: $text-primary; }
  .diag-date { font-size: 11px; color: $text-tertiary; }
  .diag-preview {
    font-size: 12px;
    color: $text-secondary;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .diag-actions {
    opacity: 0;
    transition: $transition-fast;
    margin-right: 8px;
  }

  &:hover .diag-actions { opacity: 1; }

  .arrow-icon {
    font-size: 16px;
    color: $border;
    transition: $transition-smooth;
  }
}

.empty-diagnosis {
  text-align: center;
  padding: 40px 20px;
  
  .empty-illustration { font-size: 40px; margin-bottom: 16px; filter: grayscale(1); opacity: 0.5; }
  p { color: $text-tertiary; font-size: 14px; margin: 0; }
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

// Dialog Styling
.custom-dialog {
  border-radius: $radius-lg;
  
  :deep(.el-dialog__header) {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid $border;
  }

  :deep(.el-dialog__title) { font-weight: 800; font-size: 18px; }

  .dialog-body { padding: 10px 0; }
  .dialog-tip { font-size: 13px; color: $text-tertiary; margin-bottom: 20px; }
  
  .dialog-footer {
    display: flex;
    gap: 12px;
    .el-button { flex: 1; height: 44px; }
    .confirm-btn { font-weight: 700; }
  }
}
</style>
