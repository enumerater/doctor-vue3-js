<script setup>
// Phase 3 will properly migrate this view
// For now, re-export the existing ChatDetail with an input area wrapper
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { upload } from '@/axios/oss'
import { marked } from 'marked'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import { Promotion, Upload } from '@element-plus/icons-vue'

marked.setOptions({ breaks: true, gfm: true })

const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const router = useRouter()
const messageList = ref(null)

// Agent分析弹窗
const showAgentPopup = ref(false)
const selectedMessageForAgent = ref(null)

const openAgentPopup = (msg) => {
  selectedMessageForAgent.value = msg
  showAgentPopup.value = true
}

const agentDefaultPrompt = computed(() => {
  if (!selectedMessageForAgent.value) return ''
  const content = selectedMessageForAgent.value.messageContent || ''
  const truncated = content.length > 500 ? content.substring(0, 500) + '...' : content
  return `请对以下内容进行深入的农业专家分析：\n\n${truncated}\n\n请从病害诊断、用药方案、田间管理等方面给出详细建议。`
})

const handleAgentTransferConfirm = async ({ prompt }) => {
  showAgentPopup.value = false
  try {
    await sidebarStore.transferToAgent(prompt, null)
  } catch (err) {
    console.error('传递到Agent失败：', err)
  }
}

const messages = computed(() => chatStore.chatMessages)

const parseMarkdown = (content) => {
  if (!content) return ''
  try { return marked.parse(content) } catch { return content }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 消息操作
const likedMsgIds = ref(new Set())
const dislikedMsgIds = ref(new Set())
const readingMsgId = ref(null)
const moreMenuVisible = reactive({})

const handleCopy = async (msg) => {
  try {
    await navigator.clipboard.writeText(msg.messageContent || '')
    ElMessage.success('已复制')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = msg.messageContent || ''
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success('已复制')
  }
}

const handleRegenerate = (msg, index) => {
  let userMsg = null
  for (let i = index - 1; i >= 0; i--) {
    if (messages.value[i].messageRole === '0') { userMsg = messages.value[i]; break }
  }
  if (userMsg?.messageContent) {
    const userId = localStorage.getItem('id')
    const sessionId = route.params.sessionId
    const partialSessionId = sessionId.startsWith(userId) ? sessionId.substring(userId.length) : sessionId
    chatStore.sendMessage(userMsg.messageContent, null, userId, partialSessionId, localStorage.getItem('token') || '')
  }
}

const handleReadAloud = (msg) => {
  const synth = window.speechSynthesis
  if (!synth) return
  if (readingMsgId.value === msg.id) { synth.cancel(); readingMsgId.value = null; return }
  synth.cancel()
  const u = new SpeechSynthesisUtterance(msg.messageContent || '')
  u.lang = 'zh-CN'
  u.onend = () => { readingMsgId.value = null }
  u.onerror = () => { readingMsgId.value = null }
  readingMsgId.value = msg.id
  synth.speak(u)
}

const handleLike = (msg) => {
  likedMsgIds.value.has(msg.id) ? likedMsgIds.value.delete(msg.id) : (likedMsgIds.value.add(msg.id), dislikedMsgIds.value.delete(msg.id))
}
const handleDislike = (msg) => {
  dislikedMsgIds.value.has(msg.id) ? dislikedMsgIds.value.delete(msg.id) : (dislikedMsgIds.value.add(msg.id), likedMsgIds.value.delete(msg.id))
}

// 输入区域
const imageInput = ref(null)
const uploadedImages = ref([])
const triggerImageUpload = () => { imageInput.value?.click() }

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

const removeImage = (index) => { uploadedImages.value.splice(index, 1) }

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

// 加载历史消息
let isLoading = false
const loadHistory = async () => {
  if (isLoading) return
  const sid = route.params.sessionId
  if (!sid) return
  isLoading = true
  try {
    if (chatStore.chatMessages.length > 0) {
      chatStore.setCurrentSessionId(sid)
      nextTick(scrollToBottom)
      return
    }
    chatStore.setCurrentSessionId(sid)
    await chatStore.fetchMessages(sid)
    nextTick(scrollToBottom)
  } finally { isLoading = false }
}

const scrollToBottom = () => {
  if (messageList.value) {
    setTimeout(() => {
      const last = messageList.value?.lastElementChild
      last?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 0)
  }
}

watch(() => messages.value.length, () => nextTick(scrollToBottom))
watch(() => { const l = messages.value[messages.value.length - 1]; return l?.messageContent || '' }, () => nextTick(scrollToBottom))

let observer
onMounted(() => {
  loadHistory()
  if (messageList.value) {
    observer = new MutationObserver(scrollToBottom)
    observer.observe(messageList.value, { childList: true, subtree: true, characterData: true })
  }
})
onUnmounted(() => { observer?.disconnect() })
watch(() => route.params.sessionId, () => loadHistory(), { immediate: true })
</script>

<template>
  <div class="chat-detail-page">
    <div class="chat-messages" ref="messageList">
      <div class="empty-state" v-if="messages.length === 0">
        <div class="empty-icon">💬</div>
        <div class="empty-text">暂无聊天记录，开始提问吧</div>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        class="message-item"
        :class="{ 'user-message': msg.messageRole === '0', 'robot-message': msg.messageRole === '1' }"
      >
        <div class="message-bubble">
          <div v-if="msg.isImageMessage" class="image-preview-container">
            <div v-for="(imageUrl, imgIdx) in getImagesFromMessage(msg)" :key="imgIdx" class="img-item">
              <img :src="imageUrl" alt="上传图片" />
            </div>
          </div>
          <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>

          <div v-if="msg.messageRole === '1' && msg.messageContent" class="msg-actions">
            <el-button text size="small" @click="openAgentPopup(msg)">🌿 深入分析</el-button>
            <el-button text size="small" @click="handleCopy(msg)">复制</el-button>
            <el-button text size="small" @click="handleRegenerate(msg, index)">重新生成</el-button>
            <el-button text size="small" @click="handleReadAloud(msg)">
              {{ readingMsgId === msg.id ? '停止' : '朗读' }}
            </el-button>
            <el-button
              text size="small"
              :type="likedMsgIds.has(msg.id) ? 'primary' : ''"
              @click="handleLike(msg)"
            >👍</el-button>
            <el-button
              text size="small"
              :type="dislikedMsgIds.has(msg.id) ? 'danger' : ''"
              @click="handleDislike(msg)"
            >👎</el-button>
          </div>

          <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
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
          placeholder="请输入您的问题..."
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

    <AgentTransferPopup
      v-model:visible="showAgentPopup"
      source="chat"
      :chatContent="selectedMessageForAgent?.messageContent || ''"
      :defaultPrompt="agentDefaultPrompt"
      @confirm="handleAgentTransferConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;

  @include mobile {
    padding: 12px;
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
  display: flex;
  margin-bottom: 20px;
  animation: fadeInUp 0.3s ease both;

  &.user-message { justify-content: flex-end; }
  &.robot-message { justify-content: flex-start; }
}

.message-bubble {
  max-width: 80%;

  .bubble-content {
    padding: 12px 16px;
    border-radius: $radius-md;
    line-height: 1.7;
    font-size: 14px;
    word-wrap: break-word;
    box-shadow: $shadow-sm;

    .user-message & {
      background: linear-gradient(135deg, $primary, $secondary);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .robot-message & {
      background: #fff;
      color: $text-primary;
      border: 1px solid $border;
      border-bottom-left-radius: 4px;
    }

    // Markdown styles
    :deep(h1), :deep(h2), :deep(h3) { margin: 0.3em 0; font-weight: 600; }
    :deep(h1) { font-size: 1.1em; }
    :deep(h2) { font-size: 1.05em; }
    :deep(h3) { font-size: 1em; }
    :deep(p) { margin: 0.3em 0; }
    :deep(ul), :deep(ol) { padding-left: 1.2em; margin: 0.4em 0; }
    :deep(code) { padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.85em; }
    :deep(pre) { padding: 0.5em; border-radius: 8px; overflow-x: auto; margin: 0.5em 0; font-size: 0.85em; }

    .robot-message & {
      :deep(strong) { color: $primary; }
      :deep(code) { background: $primary-light; color: $primary; }
      :deep(pre) { background: rgba(0, 0, 0, 0.04); }
      :deep(h1), :deep(h2), :deep(h3) { color: $primary; }
    }
  }

  .message-time {
    font-size: 12px;
    color: $text-tertiary;
    margin-top: 4px;
    text-align: right;
    padding: 0 4px;
  }
}

.msg-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 6px;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;

  .img-item {
    border-radius: 8px;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}

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

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
