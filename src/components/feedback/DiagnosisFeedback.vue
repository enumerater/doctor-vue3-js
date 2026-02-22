<template>
  <div class="feedback-section">
    <h3 class="section-title">诊断反馈</h3>

    <!-- 已提交反馈 -->
    <div v-if="feedback" class="feedback-result">
      <div class="feedback-badge" :class="feedback.accuracy">
        <el-icon :size="16">
          <CircleCheck v-if="feedback.accuracy === 'correct'" />
          <Warning v-if="feedback.accuracy === 'partial'" />
          <CircleClose v-if="feedback.accuracy === 'incorrect'" />
        </el-icon>
        {{ accuracyLabel[feedback.accuracy] }}
      </div>
      <div v-if="feedback.correctDisease" class="feedback-correction">
        正确病害：<strong>{{ feedback.correctDisease }}</strong>
      </div>
      <div class="feedback-rating">
        <el-rate :model-value="feedback.rating" disabled />
      </div>
      <div v-if="feedback.comment" class="feedback-comment">{{ feedback.comment }}</div>
      <div class="feedback-time">反馈于 {{ formatDate(feedback.createdAt) }}</div>
    </div>

    <!-- 提交反馈表单 -->
    <div v-else class="feedback-form">
      <p class="feedback-hint">AI诊断结果是否准确？您的反馈有助于改进系统</p>

      <div class="form-group">
        <label>诊断准确性</label>
        <div class="accuracy-options">
          <div
            v-for="opt in accuracyOptions"
            :key="opt.value"
            class="accuracy-option"
            :class="{ active: form.accuracy === opt.value, [opt.value]: true }"
            @click="form.accuracy = opt.value"
          >
            <el-icon :size="18"><component :is="opt.icon" /></el-icon>
            <span>{{ opt.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="form.accuracy === 'incorrect' || form.accuracy === 'partial'" class="form-group">
        <label>正确的病害名称</label>
        <el-input v-model="form.correctDisease" placeholder="请输入正确的病害名称" />
      </div>

      <div class="form-group">
        <label>整体评分</label>
        <el-rate v-model="form.rating" show-text :texts="rateTexts" />
      </div>

      <div class="form-group">
        <label>补充说明（可选）</label>
        <el-input
          v-model="form.comment"
          type="textarea"
          :rows="3"
          placeholder="请描述您对此次诊断的看法..."
        />
      </div>

      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!form.accuracy"
      >
        提交反馈
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, Warning, CircleClose } from '@element-plus/icons-vue'
import { useFeedbackStore } from '@/stores/feedback'

const props = defineProps({
  diagnosisId: { type: String, required: true },
  cropType: { type: String, default: '' },
  diseaseName: { type: String, default: '' },
})

const store = useFeedbackStore()
const feedback = ref(null)
const submitting = ref(false)

const accuracyLabel = {
  correct: '诊断正确',
  partial: '部分正确',
  incorrect: '诊断错误',
}

const accuracyOptions = [
  { value: 'correct', label: '正确', icon: CircleCheck },
  { value: 'partial', label: '部分正确', icon: Warning },
  { value: 'incorrect', label: '不正确', icon: CircleClose },
]

const rateTexts = ['很差', '较差', '一般', '较好', '很好']

const form = reactive({
  accuracy: '',
  correctDisease: '',
  rating: 0,
  comment: '',
})

onMounted(async () => {
  const existing = await store.fetchByDiagnosis(props.diagnosisId)
  if (existing) feedback.value = existing
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    const result = await store.submitFeedback({
      diagnosisId: props.diagnosisId,
      accuracy: form.accuracy,
      correctDisease: form.correctDisease,
      rating: form.rating,
      comment: form.comment,
      cropType: props.cropType,
      diagnosedDisease: props.diseaseName,
    })
    feedback.value = result
    ElMessage.success('感谢您的反馈！')
  } catch {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.feedback-section {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px;
}

.feedback-hint {
  font-size: 13px;
  color: $text-tertiary;
  margin: 0 0 16px;
}

.form-group {
  margin-bottom: 16px;

  > label {
    display: block;
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 8px;
    font-weight: 500;
  }
}

.accuracy-options {
  display: flex;
  gap: 8px;
}

.accuracy-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: $radius-sm;
  border: 1px solid $border;
  cursor: pointer;
  font-size: 13px;
  color: $text-secondary;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    &.correct {
      background: rgba(72, 187, 120, 0.1);
      border-color: #48bb78;
      color: #2f855a;
    }
    &.partial {
      background: rgba(237, 137, 54, 0.1);
      border-color: #ed8936;
      color: #c05621;
    }
    &.incorrect {
      background: rgba(229, 62, 62, 0.1);
      border-color: #e53e3e;
      color: #c53030;
    }
  }

  @include mobile {
    padding: 6px 10px;
    font-size: 12px;
  }
}

.feedback-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;

  &.correct {
    background: rgba(72, 187, 120, 0.1);
    color: #2f855a;
  }
  &.partial {
    background: rgba(237, 137, 54, 0.1);
    color: #c05621;
  }
  &.incorrect {
    background: rgba(229, 62, 62, 0.1);
    color: #c53030;
  }
}

.feedback-correction {
  font-size: 13px;
  color: $text-secondary;

  strong {
    color: $text-primary;
  }
}

.feedback-rating {
  :deep(.el-rate) {
    height: 24px;
  }
}

.feedback-comment {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.5;
  background: $bg-main;
  padding: 8px 12px;
  border-radius: 8px;
}

.feedback-time {
  font-size: 12px;
  color: $text-tertiary;
}
</style>
