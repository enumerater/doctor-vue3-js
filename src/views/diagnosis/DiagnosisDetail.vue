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
      </div>

      <!-- 诊断结果 -->
      <div v-if="markdownHtml" class="result-section">
        <h3 class="section-title">诊断结果</h3>
        <div class="markdown-content" v-html="markdownHtml"></div>
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
import { marked } from 'marked'
import { Picture } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useDiagnosisStore } from '@/stores/diagnosis'

const route = useRoute()
const router = useRouter()
const store = useDiagnosisStore()

const editingNotes = ref(false)
const notesText = ref('')
const savingNotes = ref(false)

const record = computed(() => store.currentRecord)

const markdownHtml = computed(() => {
  const r = record.value?.result
  if (!r) return ''
  const text = typeof r === 'string' ? r : JSON.stringify(r)
  return marked.parse(text)
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

.markdown-content {
  line-height: 1.8;
  color: $text-secondary;
  font-size: 14px;
  padding: 12px;
  background: $bg-main;
  border-radius: $radius-sm;
  border-left: 4px solid $primary;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    color: $primary;
    margin: 1rem 0 0.5rem;
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) { font-size: 1.2rem; }
  :deep(h2) { font-size: 1.1rem; }
  :deep(h3) { font-size: 1rem; }

  :deep(p) {
    margin: 0.5rem 0;
  }

  :deep(ul), :deep(ol) {
    padding-left: 1.5rem;
  }

  :deep(li) {
    margin: 0.3rem 0;

    &::marker {
      color: $primary;
    }
  }

  :deep(strong) {
    color: $primary;
  }

  :deep(blockquote) {
    border-left: 3px solid rgba($primary, 0.4);
    margin: 0.8rem 0;
    padding: 0.4rem 0.8rem;
    background-color: rgba($primary, 0.03);
    border-radius: 0 $radius-sm $radius-sm 0;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid $border;
    margin: 1rem 0;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.8rem 0;
    font-size: 13px;

    th, td {
      border: 1px solid $border;
      padding: 0.4rem 0.6rem;
      text-align: left;
    }

    th {
      background-color: rgba($primary, 0.05);
      font-weight: 600;
      color: $text-primary;
    }
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
