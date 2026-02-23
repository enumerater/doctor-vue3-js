<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { marked } from 'marked'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import ChatInputCard from '@/components/ChatInputCard.vue'

marked.setOptions({ breaks: true, gfm: true })

const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const router = useRouter()
const messageList = ref(null)
const chatInputCardRef = ref(null)

// Agent step config (merged from AgentDetail)
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

// Agent analysis popup
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

// Check if message has agent steps
const hasAgentSteps = (msg) => {
  return msg.steps && msg.steps.length > 0
}

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

const getImagesFromMessage = (msg) => {
  if (!msg.imageUrls) return []
  if (Array.isArray(msg.imageUrls)) return msg.imageUrls
  try { return JSON.parse(msg.imageUrls) } catch { return [] }
}

// Message actions
const likedMsgIds = ref(new Set())
const dislikedMsgIds = ref(new Set())
const readingMsgId = ref(null)

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

// Send message via ChatInputCard
const handleSend = (content, images) => {
  const userId = localStorage.getItem('id')
  let stored = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partial = stored.startsWith(userId) ? stored.substring(userId.length) : stored
  const full = `${userId}${partial}`
  chatStore.setCurrentSessionId(full)
  chatStore.prepareMessage(content, userId, partial).then(() => {
    chatStore.startStreaming(content, images, userId, partial, localStorage.getItem('token')).catch(console.error)
  })
}

// Load history messages
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
// Also watch agent steps changes for auto-scroll
watch(
  () => {
    const lastMsg = messages.value[messages.value.length - 1]
    return lastMsg?.steps ? JSON.stringify(lastMsg.steps) : ''
  },
  () => nextTick(scrollToBottom),
)

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
      <div class="message-list-inner">
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
        <!-- User message -->
        <div v-if="msg.messageRole === '0'" class="message-bubble">
          <div v-if="msg.isImageMessage" class="image-preview-container">
            <div v-for="(imageUrl, imgIdx) in getImagesFromMessage(msg)" :key="imgIdx" class="img-item">
              <img :src="imageUrl" alt="上传图片" />
            </div>
          </div>
          <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>
          <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
        </div>

        <!-- Robot message: Agent chain timeline OR normal markdown -->
        <template v-else>
          <!-- Agent chain timeline -->
          <div v-if="hasAgentSteps(msg)" class="agent-chain-wrapper">
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

            <div v-if="msg.messageContent" class="msg-actions agent-actions">
              <el-button text size="small" @click="handleCopy(msg)">复制</el-button>
            </div>
            <div class="message-time agent-time">{{ formatTime(msg.messageTime) }}</div>
          </div>

          <!-- Normal markdown bubble -->
          <div v-else class="message-bubble">
            <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>

            <div v-if="msg.messageContent" class="msg-actions">
              <div class="action-bar">
                <button
                  class="action-btn"
                  :class="{ active: likedMsgIds.has(msg.id) }"
                  @click="handleLike(msg)"
                  title="赞同"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                </button>
                <button
                  class="action-btn"
                  :class="{ 'active-danger': dislikedMsgIds.has(msg.id) }"
                  @click="handleDislike(msg)"
                  title="不满意"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                  </svg>
                </button>
                <span class="action-divider"></span>
                <button class="action-btn" @click="handleCopy(msg)" title="复制">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                <button class="action-btn" @click="handleRegenerate(msg, index)" title="重新生成">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
                <button class="action-btn" :class="{ active: readingMsgId === msg.id }" @click="handleReadAloud(msg)" title="朗读">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
                <span class="action-divider"></span>
                <button class="action-btn action-btn-text" @click="openAgentPopup(msg)" title="深入分析">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  <span>深入分析</span>
                </button>
              </div>
            </div>

            <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
          </div>
        </template>
      </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-wrapper">
      <div class="input-inner">
      <ChatInputCard
        ref="chatInputCardRef"
        @send="handleSend"
      />
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
$primary-green: #059669;
$border-light: rgba(5, 150, 105, 0.1);

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
  width: 100%;

  @include mobile {
    padding: 12px;
  }
}

.message-list-inner {
  max-width: 800px;
  margin: 0 auto;
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
  margin-top: 8px;

  .action-bar {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: #f8faf9;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 20px;
    padding: 3px 6px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.2s ease;
    padding: 0;
    outline: none;

    svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }

    &:hover {
      background: rgba(5, 150, 105, 0.08);
      color: $primary-green;
    }

    &.active {
      color: $primary-green;
      background: rgba(5, 150, 105, 0.12);
    }

    &.active-danger {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    &.action-btn-text {
      width: auto;
      border-radius: 15px;
      padding: 0 10px;
      gap: 4px;
      font-size: 12px;
      font-family: inherit;

      span {
        white-space: nowrap;
      }
    }
  }

  .action-divider {
    width: 1px;
    height: 16px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 3px;
    flex-shrink: 0;
  }
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

// Agent chain timeline styles (merged from AgentDetail)
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

.agent-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.agent-actions {
  margin-top: 8px;
}

// Input wrapper
.input-wrapper {
  padding: 12px 20px;
  background: $bg-main;

  @include mobile {
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}

.input-inner {
  max-width: 800px;
  margin: 0 auto;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
