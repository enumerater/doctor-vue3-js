<template>
  <div class="diagnosis-detail">
    <ContentHeader title="诊断详情" />

    <div v-if="store.loading" v-loading="true" class="loading-center"></div>

    <div v-else-if="record" class="detail-content">
      <!-- 诊断图片 -->
      <div class="image-section">
        <img v-if="record.imageUrl" :src="record.imageUrl" alt="诊断原图" class="detail-image" />
        <div v-else class="image-placeholder">
          <el-icon :size="48"><Picture /></el-icon>
          <span>暂无图片</span>
        </div>
      </div>

      <!-- 元信息卡片 -->
      <div class="meta-card">
        <div class="meta-row">
          <label>诊断时间</label>
          <span>{{ formatDate(record.createdAt) }}</span>
        </div>
        <div class="meta-row">
          <label>作物类型</label>
          <el-tag size="small" type="success" effect="light">{{ record.cropType }}</el-tag>
        </div>
        <div class="meta-row" v-if="record.elapsedTime">
          <label>检测用时</label>
          <span>{{ record.elapsedTime }}秒</span>
        </div>
        <div class="meta-row" v-if="parsedResult">
          <label>识别类型</label>
          <el-tag size="small" :type="resultTagType" effect="dark">{{ parsedResult.type }}</el-tag>
        </div>
      </div>

      <!-- 诊断结果 -->
      <div v-if="parsedResult" class="result-section">
        <h3 class="section-title">诊断结果</h3>

        <!-- 不健康作物 -->
        <div v-if="parsedResult.type === '不健康作物' && parsedResult.detail" class="result-block disease-block">
          <div class="block-header">
            <el-icon :size="18" color="#e6a23c"><Warning /></el-icon>
            <h4>病害信息</h4>
          </div>
          <div class="block-body">
            <div class="disease-name">{{ diseaseName }}</div>
            <div class="disease-desc" v-if="diseaseDesc">{{ diseaseDesc }}</div>
          </div>
        </div>

        <!-- 健康作物 -->
        <div v-if="parsedResult.type === '健康作物'" class="result-block healthy-block">
          <div class="block-header">
            <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
            <h4>健康状态</h4>
          </div>
          <p class="block-msg">该作物生长状态良好，未发现明显病害症状。</p>
        </div>

        <!-- 非作物 -->
        <div v-if="parsedResult.type === '非作物'" class="result-block noncrop-block">
          <div class="block-header">
            <el-icon :size="18" color="#909399"><InfoFilled /></el-icon>
            <h4>识别说明</h4>
          </div>
          <p class="block-msg">图片主体为<strong>{{ parsedResult.detail || '非作物内容' }}</strong>，非农作物图像。</p>
        </div>
      </div>

      <!-- 个人笔记 -->
      <div class="notes-section">
        <div class="notes-header">
          <h3 class="section-title">个人笔记</h3>
          <el-button
            v-if="!editingNotes"
            size="small"
            text
            type="primary"
            @click="startEditNotes"
          >编辑</el-button>
          <div v-else class="notes-actions">
            <el-button size="small" @click="cancelEditNotes">取消</el-button>
            <el-button size="small" type="primary" @click="saveNotes" :loading="savingNotes">保存</el-button>
          </div>
        </div>
        <div v-if="!editingNotes" class="notes-display">
          <p v-if="record.notes">{{ record.notes }}</p>
          <p v-else class="notes-empty">暂无笔记，点击编辑添加</p>
        </div>
        <el-input
          v-else
          v-model="notesText"
          type="textarea"
          :rows="4"
          placeholder="记录你的观察和想法..."
        />
      </div>

      <!-- 删除按钮 -->
      <div class="danger-zone">
        <el-button type="danger" plain @click="confirmDelete">删除此诊断记录</el-button>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else class="empty-state">
      <el-empty description="未找到该诊断记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Picture, Warning, CircleCheck, InfoFilled,
} from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useDiagnosisStore } from '@/stores/diagnosis'

const route = useRoute()
const router = useRouter()
const store = useDiagnosisStore()

const editingNotes = ref(false)
const notesText = ref('')
const savingNotes = ref(false)

const record = computed(() => store.currentRecord)

// Parse result JSON
const parsedResult = computed(() => {
  const r = record.value?.result
  if (!r) return null
  try {
    const data = typeof r === 'string' ? JSON.parse(r) : r
    if (data && data.type) return data
    return null
  } catch {
    return null
  }
})

// Extract disease name and description
const diseaseName = computed(() => {
  const detail = parsedResult.value?.detail
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx === -1) {
    const idx2 = detail.indexOf(':')
    return idx2 === -1 ? detail : detail.substring(0, idx2)
  }
  return detail.substring(0, idx)
})

const diseaseDesc = computed(() => {
  const detail = parsedResult.value?.detail
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx === -1) {
    const idx2 = detail.indexOf(':')
    return idx2 === -1 ? '' : detail.substring(idx2 + 1).trim()
  }
  return detail.substring(idx + 1).trim()
})

const resultTagType = computed(() => {
  switch (parsedResult.value?.type) {
    case '健康作物': return 'success'
    case '不健康作物': return 'warning'
    case '非作物': return 'info'
    default: return 'info'
  }
})

onMounted(() => {
  const id = route.params.diagnosisId
  if (id) store.fetchDetail(id)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const startEditNotes = () => {
  notesText.value = record.value?.notes || ''
  editingNotes.value = true
}

const cancelEditNotes = () => {
  editingNotes.value = false
}

const saveNotes = async () => {
  savingNotes.value = true
  try {
    await store.updateNotes(record.value.id, notesText.value)
    editingNotes.value = false
    ElMessage.success('笔记已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingNotes.value = false
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除此诊断记录吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await store.deleteRecord(record.value.id)
    ElMessage.success('已删除')
    router.replace({ name: 'diagnosis' })
  } catch {
    // cancelled
  }
}
</script>

<style lang="scss" scoped>
.diagnosis-detail {
  padding-bottom: 40px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}

.detail-content {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @include mobile {
    padding: 0 16px;
    gap: 12px;
  }
}

.image-section {
  border-radius: $radius-md;
  overflow: hidden;
  background: $bg-main;
  border: 1px solid $border;

  .detail-image {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    display: block;
  }

  .image-placeholder {
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: $text-tertiary;
  }
}

.meta-card {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba($border, 0.5);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  label {
    width: 80px;
    font-size: 13px;
    color: $text-tertiary;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
    color: $text-primary;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px;
}

.result-section {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
}

.result-block {
  background: $bg-main;
  border-radius: $radius-sm;
  padding: 12px;

  .block-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }

  .block-body {
    padding-left: 24px;
  }

  .block-msg {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
    padding-left: 24px;

    strong {
      color: $text-primary;
    }
  }

  &.disease-block {
    border-left: 4px solid #e6a23c;

    .disease-name {
      font-size: 1rem;
      font-weight: 700;
      color: #b88230;
      margin-bottom: 4px;
    }

    .disease-desc {
      font-size: 14px;
      color: $text-secondary;
      line-height: 1.6;
    }
  }

  &.healthy-block {
    border-left: 4px solid #67c23a;
  }

  &.noncrop-block {
    border-left: 4px solid #909399;
  }
}

.notes-section {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .section-title {
    margin-bottom: 0;
  }
}

.notes-actions {
  display: flex;
  gap: 8px;
}

.notes-display {
  p {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
  }

  .notes-empty {
    color: $text-tertiary;
    font-style: italic;
  }
}

.danger-zone {
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 40px 0;
}
</style>
