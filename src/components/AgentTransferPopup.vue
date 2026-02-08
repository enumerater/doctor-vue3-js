<template>
  <Teleport to="body">
    <Transition name="popup-overlay">
      <div v-if="visible" class="agent-transfer-overlay" @click="handleCancel">
        <Transition name="popup-content">
          <div v-if="visible" class="agent-transfer-popup" @click.stop>
            <!-- 顶部渐变条 -->
            <div class="popup-header">
              <div class="header-left">
                <span class="header-icon">🌿</span>
                <h3 class="header-title">
                  {{ source === 'vision' ? '发送至Agent深入分析' : '深入分析此回复' }}
                </h3>
              </div>
              <button class="close-btn" @click="handleCancel">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <!-- 结果摘要区域 -->
            <div class="popup-body">
              <!-- Vision模式摘要 -->
              <div v-if="source === 'vision'" class="summary-card vision-summary">
                <img v-if="thumbnailUrl" :src="thumbnailUrl" alt="检测图片" class="summary-thumbnail" />
                <div class="summary-info">
                  <span class="info-tag">{{ cropType }}</span>
                  <div class="info-disease">{{ diseaseName || '未知病害' }}</div>
                  <div class="info-meta">
                    <span v-if="severity" class="severity-badge" :class="severityClass">{{ severity }}</span>
                    <span v-if="confidence" class="confidence-text">置信度 {{ confidence }}%</span>
                  </div>
                </div>
              </div>

              <!-- Chat模式摘要 -->
              <div v-if="source === 'chat'" class="summary-card chat-summary">
                <div class="chat-icon">💬</div>
                <div class="chat-excerpt">{{ truncatedChat }}</div>
              </div>

              <!-- 可编辑提示词 -->
              <div class="prompt-section">
                <label class="prompt-label">分析提示词（可编辑）</label>
                <textarea v-model="editablePrompt" class="prompt-textarea" rows="5"
                  placeholder="请描述您希望Agent如何分析..."></textarea>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="popup-footer">
              <button class="btn-cancel" @click="handleCancel">取消</button>
              <button class="btn-confirm" @click="handleConfirm" :disabled="!editablePrompt.trim() || isTransferring">
                <span v-if="isTransferring" class="btn-loading">
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                </span>
                <span v-else>确认分析</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  source: { type: String, required: true, validator: (v) => ['vision', 'chat'].includes(v) },
  // Vision专属
  cropType: { type: String, default: '' },
  diseaseName: { type: String, default: '' },
  severity: { type: String, default: '' },
  confidence: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  // Chat专属
  chatContent: { type: String, default: '' },
  // 默认提示词
  defaultPrompt: { type: String, default: '' },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const editablePrompt = ref('')
const isTransferring = ref(false)

// 弹窗打开时初始化提示词并锁定背景滚动
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      editablePrompt.value = props.defaultPrompt
      isTransferring.value = false
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

// 截断的对话内容
const truncatedChat = computed(() => {
  if (!props.chatContent) return ''
  // 去除markdown标记，截取前200字符
  const plain = props.chatContent.replace(/[#*`_~\[\]()>]/g, '').trim()
  return plain.length > 200 ? plain.substring(0, 200) + '...' : plain
})

// 严重程度样式
const severityClass = computed(() => {
  switch (props.severity) {
    case '轻微':
      return 'severity-mild'
    case '中度':
      return 'severity-moderate'
    case '重度':
      return 'severity-severe'
    default:
      return ''
  }
})

const handleConfirm = () => {
  if (!editablePrompt.value.trim() || isTransferring.value) return
  isTransferring.value = true
  emit('confirm', {
    prompt: editablePrompt.value.trim(),
    imageUrl: props.imageUrl || null,
  })
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.agent-transfer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 768px) {
    align-items: center;
  }
}

.agent-transfer-popup {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background: $bg-card;
  border-radius: $radius-lg $radius-lg 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, $primary, $secondary);
    z-index: 1;
  }

  @media (min-width: 768px) {
    border-radius: $radius-lg;
    max-height: 80vh;
    box-shadow: $shadow-lg;
  }
}

// Header
.popup-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .header-icon {
      font-size: 1.4rem;
    }

    .header-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: $text-secondary;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: $transition;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background-color: $primary-light;
      color: $primary;
    }
  }
}

// Body
.popup-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(56, 142, 60, 0.2);
    border-radius: 2px;
  }
}

// Summary cards
.summary-card {
  border-radius: $radius-md;
  margin-bottom: 20px;
  border: 1px solid rgba(56, 142, 60, 0.12);
  overflow: hidden;
}

// Vision summary
.vision-summary {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(56, 142, 60, 0.04), rgba(102, 187, 106, 0.08));

  .summary-thumbnail {
    width: 80px;
    height: 80px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid $primary-light;
  }

  .summary-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;

    .info-tag {
      display: inline-block;
      padding: 2px 10px;
      background-color: $primary-light;
      color: $primary;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 500;
      width: fit-content;
    }

    .info-disease {
      font-size: 1.05rem;
      font-weight: 600;
      color: $text-primary;
    }

    .info-meta {
      display: flex;
      align-items: center;
      gap: 10px;

      .severity-badge {
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 500;

        &.severity-mild {
          background-color: rgba(72, 187, 120, 0.1);
          color: $severity-mild;
        }

        &.severity-moderate {
          background-color: rgba(237, 137, 54, 0.1);
          color: $severity-moderate;
        }

        &.severity-severe {
          background-color: rgba(229, 62, 62, 0.1);
          color: $severity-severe;
        }
      }

      .confidence-text {
        font-size: 0.8rem;
        color: $text-secondary;
      }
    }
  }
}

// Chat summary
.chat-summary {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(56, 142, 60, 0.03);

  .chat-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .chat-excerpt {
    font-size: 0.9rem;
    color: $text-secondary;
    line-height: 1.6;
    max-height: 100px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
  }
}

// Prompt section
.prompt-section {
  .prompt-label {
    display: block;
    font-size: 0.88rem;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 8px;
  }

  .prompt-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid $border;
    border-radius: $radius-sm;
    font-size: 0.9rem;
    line-height: 1.6;
    color: $text-primary;
    background-color: $bg-main;
    resize: vertical;
    font-family: $font-family;
    transition: $transition;
    box-sizing: border-box;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(56, 142, 60, 0.1);
    }
  }
}

// Footer
.popup-footer {
  padding: 16px 20px;
  border-top: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background-color: $bg-card;

  // Safe area for mobile
  padding-bottom: calc(16px + constant(safe-area-inset-bottom));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));

  .btn-cancel {
    padding: 10px 20px;
    border-radius: $radius-sm;
    border: 1px solid $border;
    background-color: transparent;
    color: $text-secondary;
    font-size: 0.9rem;
    cursor: pointer;
    transition: $transition;
    font-family: $font-family;

    &:hover {
      background-color: $bg-main;
      color: $text-primary;
    }
  }

  .btn-confirm {
    padding: 10px 24px;
    border-radius: $radius-sm;
    border: none;
    background: linear-gradient(135deg, $primary, $primary-hover);
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: $transition;
    font-family: $font-family;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
      transform: translateY(-1px);
    }
  }
}

// Loading dots
.btn-loading {
  display: flex;
  align-items: center;
  gap: 4px;

  .loading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: white;
    animation: dotPulse 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

// Animations
.popup-overlay-enter-active,
.popup-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.popup-overlay-enter-from,
.popup-overlay-leave-to {
  opacity: 0;
}

// Mobile: slide up
.popup-content-enter-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-content-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-content-enter-from {
  transform: translateY(100%);
}

.popup-content-leave-to {
  transform: translateY(100%);
}

// Desktop: scale + fade
@media (min-width: 768px) {
  .popup-content-enter-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .popup-content-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .popup-content-enter-from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }

  .popup-content-leave-to {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
}
</style>
