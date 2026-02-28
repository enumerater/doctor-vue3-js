<template>
  <div class="admin-announcement">
    <h2 class="page-title">公告推送</h2>

    <!-- AI 生成区域 -->
    <div class="generate-section">
      <h3 class="section-title">AI 智能生成</h3>
      <div class="generate-card">
        <div class="input-area">
          <el-input v-model="prompt" type="textarea" :rows="3" placeholder="请输入您的公告诉求，例如：通知用户本周六系统维护、发布春季防虫指南..."
            maxlength="500" show-word-limit />
        </div>
        <div class="generate-actions">
          <el-button type="primary" :loading="generating" :disabled="!prompt.trim()" @click="handleGenerate">
            <el-icon v-if="!generating">
              <MagicStick />
            </el-icon>
            {{ generating ? 'AI 生成中...' : 'AI 生成公告' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 公告编辑 / 预览 -->
    <div v-if="showEditor" class="editor-section">
      <h3 class="section-title">
        编辑公告
        <el-tag size="small" type="success" effect="plain">AI 已生成</el-tag>
      </h3>
      <div class="editor-card">
        <div class="form-row">
          <label>标题</label>
          <el-input v-model="form.title" placeholder="公告标题" maxlength="100" show-word-limit />
        </div>
        <div class="form-row">
          <label>内容</label>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="公告内容" maxlength="2000"
            show-word-limit />
        </div>
        <div class="form-row-inline">
          <div class="form-row">
            <label>类型</label>
            <el-select v-model="form.type" style="width: 100%">
              <el-option label="系统通知" value="system" />
              <el-option label="病害预警" value="disease_alert" />
              <el-option label="农事指南" value="guide" />
              <el-option label="天气预警" value="weather_alert" />
            </el-select>
          </div>
          <div class="form-row">
            <label>优先级</label>
            <el-select v-model="form.priority" style="width: 100%">
              <el-option label="普通" value="normal" />
              <el-option label="重要" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </div>
          <div class="form-row">
            <label>推送对象</label>
            <el-select v-model="form.targetUsers" style="width: 100%">
              <el-option label="全部用户" value="all" />
              <el-option label="活跃用户" value="active" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </div>
        </div>
        <div class="editor-actions">
          <el-button @click="resetEditor">取消</el-button>
          <el-button type="primary" :loading="publishing" :disabled="!form.title.trim() || !form.content.trim()"
            @click="handlePublish">
            {{ publishing ? '发布中...' : '确认发布' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 历史公告 -->
    <div class="history-section">
      <h3 class="section-title">历史公告</h3>
      <div v-loading="loading" class="history-list">
        <div v-for="item in announcements" :key="item.id" class="history-card">
          <div class="ann-header">
            <span class="ann-title">{{ item.title }}</span>
            <div class="ann-badges">
              <!-- 修复点1：添加默认值 info，确保 type 始终合法 -->
              <el-tag size="small" :type="typeTagMap[item.type] || 'info'">
                {{ typeLabel[item.type] || '未知类型' }}
              </el-tag>
              <!-- 修复点2：添加默认值 info，确保 type 始终合法 -->
              <el-tag size="small" :type="priorityTagMap[item.priority] || 'info'" effect="plain">
                {{ priorityLabel[item.priority] || '未知优先级' }}
              </el-tag>
            </div>
          </div>
          <p class="ann-content">{{ item.content }}</p>
          <div class="ann-footer">
            <span class="ann-meta">
              推送对象：{{ targetLabel[item.targetUsers] || '未知对象' }} · {{ formatDate(item.publishedAt) }}
            </span>
            <el-button size="small" type="danger" text @click="handleDelete(item)">删除</el-button>
          </div>
        </div>
        <el-empty v-if="!loading && announcements.length === 0" description="暂无公告" />
      </div>
      <div v-if="total > pageSize" class="pagination-wrap">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next" small
          @current-change="loadAnnouncements" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick } from '@element-plus/icons-vue'
import * as api from '@/axios/announcement'

// AI 生成
const prompt = ref('')
const generating = ref(false)

// 编辑表单
const showEditor = ref(false)
const publishing = ref(false)
const form = ref({
  title: '',
  content: '',
  type: 'system',
  priority: 'normal',
  targetUsers: 'all',
})

// 历史列表
const announcements = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)

// 标签映射
const typeLabel = { system: '系统通知', disease_alert: '病害预警', guide: '农事指南', weather_alert: '天气预警' }
const typeTagMap = { system: 'info', disease_alert: 'danger', guide: 'success', weather_alert: 'warning' }
const priorityLabel = { normal: '普通', high: '重要', urgent: '紧急' }
const priorityTagMap = { normal: '', high: 'warning', urgent: 'danger' }
const targetLabel = { all: '全部用户', active: '活跃用户', admin: '管理员' }

onMounted(() => {
  loadAnnouncements()
})

const handleGenerate = async () => {
  generating.value = true
  try {
    const result = await api.generateAnnouncement({ prompt: prompt.value })
    form.value = {
      title: result.title || '',
      content: result.content || '',
      type: result.type || 'system',
      priority: result.priority || 'normal',
      targetUsers: 'all',
    }
    showEditor.value = true
    ElMessage.success('AI 已生成公告，请确认内容后发布')
  } catch {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const handlePublish = async () => {
  publishing.value = true
  try {
    await api.publishAnnouncement({ ...form.value })
    ElMessage.success('公告发布成功')
    resetEditor()
    prompt.value = ''
    page.value = 1
    loadAnnouncements()
  } catch {
    ElMessage.error('发布失败，请重试')
  } finally {
    publishing.value = false
  }
}

const resetEditor = () => {
  showEditor.value = false
  form.value = { title: '', content: '', type: 'system', priority: 'normal', targetUsers: 'all' }
}

const loadAnnouncements = async () => {
  loading.value = true
  try {
    const res = await api.getAnnouncements({ page: page.value, pageSize: pageSize })
    announcements.value = res.list || []
    total.value = res.total || 0
  } catch {
    announcements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleDelete = async (item) => {
  await ElMessageBox.confirm(`确定删除公告「${item.title}」？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await api.deleteAnnouncement(item.id)
  ElMessage.success('已删除')
  loadAnnouncements()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.admin-announcement {
  max-width: 1200px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

// ====== AI 生成区域 ======
.generate-card {
  @include card-base;
  padding: 20px;
  margin-bottom: 28px;
}

.input-area {
  margin-bottom: 12px;

  :deep(.el-textarea__inner) {
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.6;
  }
}

.generate-actions {
  display: flex;
  justify-content: flex-end;

  .el-button--primary {
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    border-radius: $radius-sm;
    font-weight: 500;
  }
}

// ====== 编辑表单 ======
.editor-section {
  margin-bottom: 28px;
}

.editor-card {
  @include card-base;
  padding: 20px;
}

.form-row {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: $text-secondary;
    margin-bottom: 6px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 8px;
  }
}

.form-row-inline {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid $border;

  .el-button--primary {
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    border-radius: $radius-sm;
    font-weight: 500;
  }
}

// ====== 历史公告 ======
.history-section {
  margin-bottom: 24px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.history-card {
  @include card-base;
  padding: 16px;
}

.ann-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

.ann-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  flex: 1;
  @include text-ellipsis(1);
}

.ann-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.ann-content {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;
  background: $bg-main;
  padding: 10px 14px;
  border-radius: 8px;
  margin: 0 0 10px;
  white-space: pre-line;
  max-height: 120px;
  overflow-y: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.ann-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ann-meta {
  font-size: 12px;
  color: $text-tertiary;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
