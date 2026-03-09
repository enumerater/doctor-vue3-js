<template>
  <div class="plot-records-v2">
    <div class="page-hero">
      <ContentHeader :title="currentPlot?.name" :showBack="true" transparent />
      <div class="hero-content">
        <h2 class="hero-title">地块档案</h2>
        <p class="hero-subtitle">记录作物的每一次成长与守护</p>
      </div>
    </div>

    <div class="main-workspace">
      <div class="tab-switcher">
        <div 
          class="switch-item" 
          :class="{ active: activeTab === 'pesticide' }"
          @click="activeTab = 'pesticide'"
        >
          <el-icon><Operation /></el-icon>
          <span>施药管理</span>
        </div>
        <div 
          class="switch-item" 
          :class="{ active: activeTab === 'diary' }"
          @click="activeTab = 'diary'"
        >
          <el-icon><Postcard /></el-icon>
          <span>田间随笔</span>
        </div>
      </div>

      <div class="content-body">
        <template v-if="activeTab === 'pesticide'">
          <div class="action-bar">
            <h3 class="section-label">近期施药记录</h3>
            <button class="glass-btn primary" @click="goToCreatePesticide">
              <el-icon><Plus /></el-icon> 记录新作业
            </button>
          </div>
          
          <div v-if="loading" class="v2-loading-wrap">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="recordsStore.pesticideRecords.length > 0" class="v2-list">
            <PesticideRecordCard 
              v-for="record in recordsStore.pesticideRecords" 
              :key="record.id" 
              :record="record"
              @evaluate="handleEvaluate"
            />
          </div>
          <div v-else class="v2-empty">
            <div class="empty-icon">🧪</div>
            <p>还没有记录过施药或施肥信息</p>
          </div>
        </template>

        <template v-else>
          <div class="action-bar">
            <h3 class="section-label">田间历程</h3>
            <button class="glass-btn success" @click="goToCreateNote">
              <el-icon><Plus /></el-icon> 记随笔
            </button>
          </div>
          
          <FarmCalendar 
            :pesticide-records="recordsStore.pesticideRecords"
            :field-notes="recordsStore.fieldNotes"
            @add-record="handleCalendarAdd"
            @view-detail="handleCalendarViewDetail"
          />
        </template>
      </div>
    </div>

    <!-- 仅保留评价反馈弹窗（内容简单，适合弹窗） -->
    <el-dialog v-model="showEffectDialog" title="反馈作业效果" width="90%" max-width="400px" class="v2-dialog">
      <div class="effect-v2-body">
        <div class="star-rating">
          <el-rate v-model="effectForm.evaluation" size="large" />
          <span class="rate-text">{{ ['','不理想','一般','达到预期','效果很好','完美防治'][effectForm.evaluation] }}</span>
        </div>
        <el-input v-model="effectForm.remarks" type="textarea" placeholder="详细说说防治情况..." class="v2-textarea" />
      </div>
      <template #footer>
        <div class="v2-dialog-footer">
          <el-button type="primary" @click="submitEffect" :disabled="!effectForm.evaluation" round block class="v2-confirm">提交反馈</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MagicStick, Operation, Postcard } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import PesticideRecordCard from '@/components/farm/PesticideRecordCard.vue'
import FieldNoteCard from '@/components/farm/FieldNoteCard.vue'
import FarmCalendar from '@/components/farm/FarmCalendar.vue'
import VisualPesticideInput from '@/components/farm/VisualPesticideInput.vue'
import { useFarmStore } from '@/stores/farm'
import { useFarmRecordsStore } from '@/stores/farm_records'
import { generateAiNote } from '@/axios/farm_records'

const route = useRoute()
const router = useRouter()
const farmStore = useFarmStore()
const recordsStore = useFarmRecordsStore()
const farmId = route.params.farmId
const plotId = route.params.plotId
const activeTab = ref('pesticide')
const loading = computed(() => recordsStore.loading)
const currentPlot = computed(() => farmStore.currentPlot)
const showEffectDialog = ref(false)
const currentRecordId = ref(null)

const effectForm = reactive({ evaluation: 0, remarks: '' })

onMounted(async () => {
  if (!currentPlot.value || currentPlot.value.id !== plotId) {
    await farmStore.fetchPlotDetail(farmId, plotId)
  }
  recordsStore.fetchPesticideRecords(plotId)
  recordsStore.fetchFieldNotes(plotId)
})

const handleCalendarAdd = (date) => {
  router.push({
    name: 'fieldNoteCreate',
    params: { farmId, plotId },
    query: { date }
  })
}

const handleCalendarViewDetail = (event) => {
  if (event.type === 'pesticide') {
    router.push({
      name: 'pesticideEdit',
      params: { farmId, plotId, id: event.raw.id }
    })
  } else {
    router.push({
      name: 'fieldNoteEdit',
      params: { farmId, plotId, id: event.raw.id }
    })
  }
}

const goToCreatePesticide = () => {
  router.push({ name: 'pesticideCreate', params: { farmId, plotId } })
}

const goToCreateNote = () => {
  router.push({ name: 'fieldNoteCreate', params: { farmId, plotId } })
}

const handleEvaluate = (record) => {
  currentRecordId.value = record.id
  effectForm.evaluation = 0
  effectForm.remarks = ''
  showEffectDialog.value = true
}

const submitEffect = async () => {
  try {
    await recordsStore.updateEffect(plotId, currentRecordId.value, {
      effectEvaluation: effectForm.evaluation,
      effectRemarks: effectForm.remarks
    })
    ElMessage.success('已反馈')
    showEffectDialog.value = false
  } catch (err) { ElMessage.error('评价失败') }
}

const handleAiPolish = async () => {
  if (!noteForm.content) return
  aiLoading.value = true
  try {
    const res = await generateAiNote({
      plotId, theme: '农事记录润色', keywords: [noteForm.content],
      context: { cropType: currentPlot.value?.cropType, currentStage: currentPlot.value?.growthStage }
    })
    if (res.code === 200) {
      noteForm.content = res.data.suggestedContent
      noteForm.isAiGenerated = true
      ElMessage.success('内容已优化')
    }
  } catch (err) { ElMessage.error('AI 生成失败') } finally { aiLoading.value = false }
}

const submitNote = async () => {
  if (!noteForm.content) return
  formLoading.value = true
  try {
    await recordsStore.addFieldNote(plotId, { ...noteForm })
    ElMessage.success('发布成功')
    showNoteDialog.value = false
    noteForm.content = ''
    noteForm.isAiGenerated = false
  } finally { formLoading.value = false }
}

const handleDeleteNote = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning', roundButton: true })
    await recordsStore.deleteNote(plotId, id)
    ElMessage.success('已删除')
  } catch {}
}
</script>

<style lang="scss" scoped>
.plot-records-v2 { min-height: 100vh; background: #f8faf9; padding-bottom: 50px; }
.page-hero {
  background: linear-gradient(135deg, #4a9b5e, #78c48f); padding: 0 0 60px; color: white; border-radius: 0 0 40px 40px;
  .hero-content { padding: 20px 24px; .hero-title { font-size: 28px; font-weight: 900; margin: 0; } .hero-subtitle { font-size: 14px; opacity: 0.8; margin: 8px 0 0; } }
}
.main-workspace { margin-top: -40px; padding: 0 20px; max-width: 800px; margin-left: auto; margin-right: auto; }
.tab-switcher {
  background: white; padding: 6px; border-radius: 20px; display: flex; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 24px;
  .switch-item {
    flex: 1; height: 44px; @include flex-center; gap: 8px; font-size: 14px; font-weight: 700; color: $text-tertiary; border-radius: 16px; transition: all 0.3s; cursor: pointer;
    &.active { background: $primary; color: white; box-shadow: 0 4px 12px rgba($primary, 0.3); }
  }
}
.action-bar { @include flex-between; margin-bottom: 20px; .section-label { font-size: 16px; font-weight: 800; color: $text-primary; margin: 0; } }
.glass-btn {
  border: none; padding: 10px 18px; border-radius: 14px; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.3s;
  &.primary { background: rgba($primary, 0.1); color: $primary; }
  &.success { background: rgba(#10b981, 0.1); color: #10b981; }
  &:hover { transform: scale(1.05); background: $primary; color: white; }
}
:deep(.v2-dialog) { border-radius: 32px; overflow: hidden; .el-dialog__header { padding: 24px 24px 10px; .el-dialog__title { font-weight: 900; } } }
.v2-form {
  padding: 0 10px;
  .form-group { margin-bottom: 20px; label { display: block; font-size: 13px; font-weight: 700; color: $text-secondary; margin-bottom: 8px; padding-left: 4px; } }
  .form-row { display: flex; gap: 16px; .flex-2 { flex: 2; } .flex-1 { flex: 1; } }
}
.quick-pills {
  display: flex; flex-wrap: wrap; gap: 10px;
  .pill-item { padding: 8px 16px; background: #f3f4f6; border-radius: 12px; font-size: 13px; color: $text-secondary; cursor: pointer; transition: all 0.2s; &.active { background: $primary; color: white; font-weight: 700; } }
}
.v2-input :deep(.el-input__wrapper) { border-radius: 14px; background: #f9fafb; box-shadow: none; border: 1px solid #f3f4f6; height: 48px; &.is-focus { border-color: $primary; } }
.v2-textarea :deep(.el-textarea__inner) { border-radius: 18px; background: #f9fafb; box-shadow: none; border: 1px solid #f3f4f6; padding: 12px 16px; }
.ai-assistant {
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid rgba($primary, 0.1); border-radius: 18px; padding: 14px; margin-bottom: 16px;
  .ai-head { @include flex-between; margin-bottom: 6px; .ai-brand { font-size: 13px; font-weight: 800; color: $primary; display: flex; align-items: center; gap: 4px; } }
  .ai-tips { font-size: 11px; color: $text-tertiary; }
}
.v2-dialog-footer { padding: 0 10px 20px; .v2-confirm { width: 100%; height: 50px; font-size: 16px; font-weight: 800; } }
.effect-v2-body { .star-rating { flex-direction: column; @include flex-center; gap: 12px; margin-bottom: 24px; .rate-text { font-size: 14px; font-weight: 700; color: $primary; } } }
.v2-empty { text-align: center; padding: 60px 0; .empty-icon { font-size: 50px; margin-bottom: 16px; opacity: 0.5; } p { color: $text-tertiary; font-size: 14px; } }
.media-section { margin-top: 20px; label { display: block; font-size: 13px; font-weight: 700; color: $text-secondary; margin-bottom: 12px; } }
:deep(.v2-upload) { .el-upload--picture-card { border-radius: 18px; background: #f9fafb; border: 1px dashed #d1d5db; } .el-upload-list__item { border-radius: 18px; } }
</style>
