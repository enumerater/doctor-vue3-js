<template>
  <div class="agent-detail-page">
    <div class="chat-messages" ref="messageList">
      <div class="empty-state" v-if="messages.length === 0">
        <div class="empty-icon">🌿</div>
        <div class="empty-text">我是您的农业AI助手，请描述您遇到的作物问题</div>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        :class="['message-item', msg.messageRole === '0' ? 'user-message' : 'robot-message']"
      >
        <!-- 用户消息 -->
        <div v-if="msg.messageRole === '0'" class="message-bubble user-bubble">
          <div class="bubble-content">{{ msg.messageContent }}</div>
          <div class="message-time">{{ formatTime(msg.messageTime) }}</div>
        </div>

        <!-- Agent 链式消息 -->
        <div v-else class="agent-chain-wrapper">
          <div class="chain-timeline">
            <div
              v-for="(step, sIdx) in msg.steps"
              :key="sIdx"
              :class="['step-node', `type-${step.type}`, { 'is-processing': step.status === 'processing' }]"
            >
              <div v-if="step.type === 'status'" class="status-line">
                <div class="node-dot"></div>
                <div class="status-text">{{ step.content }}</div>
                <div class="loading-spinner" v-if="step.status === 'processing'"></div>
              </div>

              <div v-else class="data-card">
                <div class="card-header">
                  <span class="card-icon">{{ getStepConfig(step.type).icon }}</span>
                  <span class="card-title">{{ getStepConfig(step.type).title }}</span>
                </div>
                <div class="card-body markdown-body" v-html="parseMarkdown(step.content)"></div>
              </div>
            </div>
          </div>
          <div class="message-time agent-time">{{ formatTime(msg.messageTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div v-if="uploadedImages.length > 0" class="preview-row">
        <div v-for="(url, i) in uploadedImages" :key="i" class="preview-thumb">
          <img :src="url" />
          <span class="remove" @click="removeImage(i)">×</span>
        </div>
      </div>
      <div class="input-row">
        <el-input
          v-model="chatStore.inputValue"
          placeholder="继续提问..."
          @keyup.enter="sendMessage"
          clearable
          size="large"
        />
        <el-button
          v-if="sidebarStore.agentImageUploadEnabled"
          @click="triggerImageUpload"
          circle
          size="large"
        >
          <el-icon><Upload /></el-icon>
        </el-button>
        <el-button
          type="primary"
          @click="sendMessage"
          :disabled="!chatStore.inputValue?.trim() && uploadedImages.length === 0"
          circle
          size="large"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
        <input type="file" ref="imageInput" style="display:none" accept="image/jpeg,image/png" @change="handleImageUpload" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { upload } from '@/axios/oss'
import { marked } from 'marked'
import { Upload, Promotion } from '@element-plus/icons-vue'

const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const router = useRouter()
const messageList = ref(null)

const messages = computed(() => chatStore.chatMessages)

const getStepConfig = (type) => {
  const configs = {
    think: { title: '思考汇总结果', icon: '', color: '#059669' },
    img_think: { title: '多模态分析', icon: '', color: '#059669' },
    img_find: { title: '多模态分析结果', icon: '', color: '#059669' },
    analyze_result: { title: '正在分析中', icon: '', color: '#6B7280' },
    safe_notice: { title: '安全防护要求', icon: '', color: '#F59E0B' },
    pesticide: { title: '精准用药方案', icon: '', color: '#10B981' },
    field_manage: { title: '田间管理建议', icon: '', color: '#3B82F6' },
    final_result: { title: '诊断总结报告', icon: '', color: '#059669' },
    default: { title: '分析结果', icon: '', color: '#6B7280' },
  }
  return configs[type] || configs.default
}

const parseMarkdown = (content) => (content ? marked.parse(content) : '')
const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 自动滚动
const scrollToBottom = () => {
  if (messageList.value) {
    setTimeout(() => {
      const last = messageList.value?.lastElementChild
      last?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 0)
  }
}

watch(() => messages.value, () => nextTick(scrollToBottom), { deep: true })
watch(
  () => {
    const lastMsg = messages.value[messages.value.length - 1]
    return lastMsg?.steps ? JSON.stringify(lastMsg.steps) : ''
  },
  () => nextTick(scrollToBottom),
)

let observer
onMounted(() => {
  if (messageList.value) {
    observer = new MutationObserver(scrollToBottom)
    observer.observe(messageList.value, { childList: true, subtree: true, characterData: true, characterDataOldValue: true })
  }
})
onUnmounted(() => observer?.disconnect())

// 输入区域逻辑
const imageInput = ref(null)
const uploadedImages = ref([])

const triggerImageUpload = () => imageInput.value?.click()

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (!['image/jpeg', 'image/png'].includes(file.type)) { ElMessage.warning('仅支持 JPG/PNG'); return }
    if (file.size > 10 * 1024 * 1024) { ElMessage.warning('图片不能超过10MB'); return }
    const res = await upload(file)
    uploadedImages.value.push(res.data.url)
    if (imageInput.value) imageInput.value.value = ''
  } catch { ElMessage.error('图片上传失败') }
}

const removeImage = (i) => uploadedImages.value.splice(i, 1)

const sendMessage = async () => {
  const content = (chatStore.inputValue || '').trim()
  if (!content && uploadedImages.value.length === 0) return

  const userId = localStorage.getItem('id')
  let stored = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partial = stored.startsWith(userId) ? stored.substring(userId.length) : stored
  const full = `${userId}${partial}`
  chatStore.setCurrentSessionId(full)

  await chatStore.prepareMessage(content, userId, partial)
  chatStore.startStreaming(content, uploadedImages.value, userId, partial, localStorage.getItem('token')).catch(console.error)
  uploadedImages.value = []
}
</script>

<style lang="scss" scoped>
$primary-green: #059669;
$border-light: rgba(5, 150, 105, 0.1);

.agent-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;

  .empty-icon { font-size: 48px; }
  .empty-text { font-size: 14px; color: $text-secondary; }
}

.message-item {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.user-message {
  align-items: flex-end;

  .user-bubble {
    background: linear-gradient(135deg, $primary-green, #10b981);
    color: white;
    padding: 0.8rem 1.2rem;
    border-radius: 1.2rem 1.2rem 0.2rem 1.2rem;
    max-width: 80%;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
}

.agent-chain-wrapper {
  align-self: flex-start;
  width: 90%;
  max-width: 600px;

  .chain-timeline {
    position: relative;
    padding-left: 1.5rem;
    border-left: 2px dashed rgba($primary-green, 0.2);
    margin-left: 0.5rem;
  }
}

.step-node {
  position: relative;
  margin-bottom: 1rem;

  .status-line {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #6b7280;

    .node-dot {
      position: absolute;
      left: -1.5rem;
      width: 10px;
      height: 10px;
      background: white;
      border: 2px solid $primary-green;
      border-radius: 50%;
      transform: translateX(-40%);
      z-index: 2;
    }
  }

  .data-card {
    background: white;
    border-radius: 12px;
    border: 1px solid $border-light;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      padding: 8px 12px;
      background: rgba($primary-green, 0.03);
      border-bottom: 1px solid $border-light;
      display: flex;
      align-items: center;
      gap: 8px;

      .card-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
      }
    }

    .card-body {
      padding: 12px;
      font-size: 0.93rem;
      line-height: 1.6;
      color: #1f2937;
    }
  }
}

.type-final_result .data-card {
  border: 1.5px solid rgba($primary-green, 0.4);

  .card-header {
    background: rgba($primary-green, 0.08);
  }
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #e5e7eb;
  border-top-color: $primary-green;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

// 输入区域
.input-area {
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid $border;

  @include mobile {
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}

.preview-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  .preview-thumb {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; }

    .remove {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: $danger;
      color: #fff;
      border-radius: 50%;
      @include flex-center;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input { flex: 1; }
}
</style>
