<template>
  <div class="report-preview">
    <ContentHeader title="诊断报告预览" showBack>
      <template #actions>
        <el-button type="primary" size="small" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印 / 导出PDF
        </el-button>
      </template>
    </ContentHeader>

    <div v-if="loading" v-loading="true" class="loading-center"></div>

    <div v-else-if="record" class="report-wrapper">
      <div class="report-page" ref="reportRef">
        <!-- 报告头 -->
        <div class="report-header">
          <div class="report-logo">🌿 小农</div>
          <h1 class="report-title">作物病害诊断报告</h1>
          <div class="report-meta">
            <span>报告编号：{{ record.id }}</span>
            <span>生成时间：{{ formatDate(new Date().toISOString()) }}</span>
          </div>
        </div>

        <div class="report-divider"></div>

        <!-- 基本信息 -->
        <div class="report-section">
          <h2 class="section-heading">一、基本信息</h2>
          <table class="info-table">
            <tr>
              <td class="label">诊断时间</td>
              <td>{{ formatDate(record.createdAt) }}</td>
              <td class="label">作物类型</td>
              <td>{{ record.cropType }}</td>
            </tr>
            <tr>
              <td class="label">检测用时</td>
              <td>{{ record.elapsedTime || '-' }}秒</td>
              <td class="label">诊断状态</td>
              <td>{{ record.status === 'completed' ? '已完成' : '进行中' }}</td>
            </tr>
          </table>
        </div>

        <!-- 诊断图片 -->
        <div class="report-section">
          <h2 class="section-heading">二、诊断图像</h2>
          <div class="report-image-wrap">
            <img v-if="record.imageUrl" :src="record.imageUrl" alt="诊断原图" class="report-image" />
            <div v-else class="no-image">暂无图片</div>
          </div>
        </div>

        <!-- 诊断结果 -->
        <div class="report-section">
          <h2 class="section-heading">三、诊断结果</h2>
          <div v-if="parsedResult" class="result-content">
            <div class="result-type">
              识别类型：<strong :class="resultClass">{{ parsedResult.type }}</strong>
            </div>
            <div v-if="parsedResult.type === '不健康作物' && parsedResult.detail" class="result-detail">
              <p><strong>病害名称：</strong>{{ extractDiseaseName(parsedResult.detail) }}</p>
              <p v-if="extractDiseaseDesc(parsedResult.detail)"><strong>详细描述：</strong>{{ extractDiseaseDesc(parsedResult.detail) }}</p>
            </div>
            <div v-if="parsedResult.type === '健康作物'" class="result-detail healthy">
              <p>该作物生长状态良好，未发现明显病害症状。</p>
            </div>
          </div>
          <div v-else class="result-raw">
            <p>{{ record.result }}</p>
          </div>
        </div>

        <!-- 个人笔记 -->
        <div v-if="record.notes" class="report-section">
          <h2 class="section-heading">四、用户笔记</h2>
          <p class="notes-text">{{ record.notes }}</p>
        </div>

        <!-- 报告底部 -->
        <div class="report-footer">
          <div class="report-divider"></div>
          <p>本报告由小农AI系统自动生成，仅供参考。</p>
          <p>如有疑问，建议咨询当地农业技术推广站专业人员。</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="未找到诊断记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Printer } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useDiagnosisStore } from '@/stores/diagnosis'

const route = useRoute()
const diagnosisStore = useDiagnosisStore()
const loading = ref(true)
const reportRef = ref(null)

const record = computed(() => diagnosisStore.currentRecord)

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

const resultClass = computed(() => {
  switch (parsedResult.value?.type) {
    case '健康作物': return 'healthy'
    case '不健康作物': return 'diseased'
    default: return ''
  }
})

onMounted(async () => {
  const id = route.params.diagnosisId
  if (id) {
    await diagnosisStore.fetchDetail(id)
  }
  loading.value = false
})

const extractDiseaseName = (detail) => {
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx !== -1) return detail.substring(0, idx)
  const idx2 = detail.indexOf(':')
  return idx2 !== -1 ? detail.substring(0, idx2) : detail
}

const extractDiseaseDesc = (detail) => {
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx !== -1) return detail.substring(idx + 1).trim()
  const idx2 = detail.indexOf(':')
  return idx2 !== -1 ? detail.substring(idx2 + 1).trim() : ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handlePrint = () => {
  window.print()
}
</script>

<style lang="scss" scoped>
.report-preview {
  padding-bottom: 40px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}

.report-wrapper {
  padding: 0 24px;
  display: flex;
  justify-content: center;

  @include mobile {
    padding: 0 12px;
  }
}

.report-page {
  max-width: 800px;
  width: 100%;
  background: #fff;
  border: 1px solid $border;
  border-radius: $radius-md;
  padding: 40px;
  box-shadow: $shadow-md;

  @include mobile {
    padding: 20px;
  }
}

.report-header {
  text-align: center;
  margin-bottom: 24px;
}

.report-logo {
  font-size: 14px;
  color: $text-tertiary;
  margin-bottom: 8px;
}

.report-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 12px;
}

.report-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 13px;
  color: $text-tertiary;

  @include mobile {
    flex-direction: column;
    gap: 4px;
  }
}

.report-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, $border, transparent);
  margin: 16px 0;
}

.report-section {
  margin-bottom: 24px;
}

.section-heading {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid $primary;
  display: inline-block;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  td {
    padding: 10px 12px;
    border: 1px solid $border;
    color: $text-primary;
  }

  .label {
    background: $bg-main;
    color: $text-secondary;
    font-weight: 500;
    width: 100px;
  }
}

.report-image-wrap {
  text-align: center;

  .report-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid $border;
  }

  .no-image {
    padding: 40px;
    color: $text-tertiary;
    background: $bg-main;
    border-radius: 8px;
  }
}

.result-content {
  background: $bg-main;
  padding: 16px;
  border-radius: 8px;
}

.result-type {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 8px;

  strong {
    font-size: 15px;

    &.healthy {
      color: #48bb78;
    }
    &.diseased {
      color: #e53e3e;
    }
  }
}

.result-detail {
  p {
    font-size: 14px;
    color: $text-primary;
    line-height: 1.6;
    margin: 4px 0;
  }

  &.healthy p {
    color: #2f855a;
  }
}

.result-raw {
  background: $bg-main;
  padding: 16px;
  border-radius: 8px;

  p {
    font-size: 14px;
    color: $text-primary;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }
}

.notes-text {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
  background: $bg-main;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 0;
}

.report-footer {
  margin-top: 32px;
  text-align: center;

  p {
    font-size: 12px;
    color: $text-tertiary;
    margin: 4px 0;
  }
}

.empty-state {
  padding: 40px 0;
}

@media print {
  .report-preview :deep(.content-header) {
    display: none;
  }

  .report-page {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
</style>
