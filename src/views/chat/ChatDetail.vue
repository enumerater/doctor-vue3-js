<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import ChatInputCard from '@/components/ChatInputCard.vue'

marked.setOptions({ breaks: true, gfm: true })

const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const messageList = ref(null)
const chatInputCardRef = ref(null)

// Agent step config
const getStepConfig = (type) => {
  const configs = {
    think: { title: '思考汇总结果', icon: '', color: '#059669' },
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

// 检查Agent是否已完成所有输出（存在非正在处理的总结报告）
const isAgentFinished = (msg) => {
  if (!hasAgentSteps(msg)) return true
  return msg.steps.some(s => s.type === 'final_result' && s.status !== 'processing')
}

// --- 管理每个消息中折叠面板的展开状态 ---
const activeCollapseMap = reactive({})

watch(
  () => messages.value,
  (newMsgs) => {
    if (!newMsgs) return
    newMsgs.forEach((msg, index) => {
      const key = msg.id || index
      if (hasAgentSteps(msg) && !activeCollapseMap[key]) {
        // 查找最后一个非总结报告的步骤索引
        const intermediateSteps = msg.steps.filter(s => s.type !== 'final_result' && s.type !== 'status')
        const hasFinalResult = msg.steps.some(s => s.type === 'final_result')
        
        if (hasFinalResult) {
          // 如果有了总结报告，中间过程默认折叠
          activeCollapseMap[key] = []
        } else if (intermediateSteps.length > 0) {
          // 如果还在处理中，展开最后一个中间步骤
          const lastIntermediateIdx = msg.steps.findLastIndex(s => s.type !== 'final_result' && s.type !== 'status')
          if (lastIntermediateIdx !== -1) {
            activeCollapseMap[key] = [lastIntermediateIdx]
          }
        }
      }
    })
  },
  { deep: true, immediate: true }
)

const parseMarkdown = (content) => {
  if (!content) return ''
  try {
    // For marked v17+, marked.parse is the standard way.
    // Ensure content is a string.
    const strContent = String(content)
    return marked.parse(strContent)
  } catch (err) {
    console.error('Markdown parsing failed:', err)
    return content
  }
}

// --- 智能解析复杂内容（处理包含“参考资料”的JSON结构） ---
const parseComplexContent = (rawContent) => {
  if (!rawContent) return { type: 'markdown', data: '' }

  let contentToParse = rawContent.trim()
  if (contentToParse.startsWith('```')) {
    contentToParse = contentToParse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  try {
    const parsed = JSON.parse(contentToParse)
    if (parsed && typeof parsed === 'object' && (parsed['参考资料'] || parsed['回答'])) {
      return { type: 'json', data: parsed }
    }
  } catch (e) {
    // 静默失败，回退到普通 markdown
  }

  return { type: 'markdown', data: rawContent }
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

// Send message
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

        <div v-for="(msg, index) in messages" :key="msg.id || index" class="message-item"
          :class="{ 'user-message': msg.messageRole === '0', 'robot-message': msg.messageRole === '1' }">

          <div v-if="msg.messageRole === '0'" class="message-bubble">
            <div v-if="msg.isImageMessage" class="image-preview-container">
              <div v-for="(imageUrl, imgIdx) in getImagesFromMessage(msg)" :key="imgIdx" class="img-item">
                <img :src="imageUrl" alt="上传图片" />
              </div>
            </div>
            <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>
            <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
          </div>

          <template v-else>
            <div v-if="hasAgentSteps(msg)" class="agent-chain-wrapper">
              <el-collapse v-model="activeCollapseMap[msg.id || index]" class="chain-timeline custom-collapse">
                <template v-for="(step, sIdx) in msg.steps" :key="sIdx">
                  <div v-if="step.type !== 'final_result'"
                    :class="['step-node', `type-${step.type}`, { 'is-processing': step.status === 'processing' }]">

                    <div v-if="step.type === 'status'" class="status-line">
                      <div class="node-dot"></div>
                      <div class="status-text">{{ step.content }}</div>
                      <div class="loading-spinner" v-if="step.status === 'processing'"></div>
                    </div>

                    <el-collapse-item v-else :name="sIdx" class="data-collapse-item">
                      <template #title>
                        <div class="collapse-header">
                          <span class="card-icon" v-if="getStepConfig(step.type).icon">{{ getStepConfig(step.type).icon
                            }}</span>
                          <span class="card-title" :style="{ color: getStepConfig(step.type).color }">{{
                            getStepConfig(step.type).title }}</span>
                          <div class="loading-spinner" v-if="step.status === 'processing'" style="margin-left: 8px;">
                          </div>
                        </div>
                      </template>

                      <div class="step-content-container">
                        <template v-for="(parsed, pIdx) in [parseComplexContent(step.content)]" :key="'parsed-' + sIdx + '-' + pIdx">
                          <template v-if="parsed.type === 'json'">
                            <div class="markdown-body" v-if="parsed.data['回答']" v-html="parseMarkdown(parsed.data['回答'])">
                            </div>
                            <div class="reference-section" v-if="parsed.data['参考资料'] && parsed.data['参考资料'].length">
                              <div class="ref-title">参考资料</div>
                              <div class="ref-cards-wrapper">
                                <el-tooltip v-for="(refItem, rIdx) in parsed.data['参考资料']" :key="rIdx" effect="light"
                                  placement="top" :show-after="200">
                                  <template #content>
                                    <div class="ref-tooltip-content">
                                      <div class="ref-tt-title">{{ refItem.title }}</div>
                                      <div class="ref-tt-desc" :title="refItem.content">{{ refItem.content }}</div>
                                    </div>
                                  </template>
                                  <a :href="refItem.url" target="_blank" class="ref-card" @click.stop>
                                    <svg class="ref-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                    </svg>
                                    <span class="ref-text">{{ refItem.title }}</span>
                                  </a>
                                </el-tooltip>
                              </div>
                            </div>
                          </template>
                          <template v-else>
                            <div class="markdown-body" v-html="parseMarkdown(parsed.data)"></div>
                          </template>
                        </template>
                      </div>
                    </el-collapse-item>
                  </div>
                </template>
              </el-collapse>

              <!-- 总结报告单独渲染，不折叠 -->
              <div v-for="(step, sIdx) in msg.steps" :key="'final-' + sIdx">
                <div v-if="step.type === 'final_result'" class="final-report-wrapper">
                  <div class="final-report-card">
                    <div class="report-header">
                      <div class="report-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <span class="report-title">{{ getStepConfig(step.type).title }}</span>
                    </div>
                    <div class="report-content-container">
                      <template v-for="(parsed, pIdx) in [parseComplexContent(step.content)]" :key="'final-parsed-' + sIdx + '-' + pIdx">
                        <div class="markdown-body" v-html="parseMarkdown(parsed.type === 'json' ? parsed.data['回答'] : parsed.data)"></div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isAgentFinished(msg)" class="msg-actions agent-actions">
                <el-button text size="small" @click="handleCopy(msg)">复制全文</el-button>
              </div>
              <div class="message-time agent-time">{{ formatTime(msg.messageTime) }}</div>
            </div>

            <div v-else class="message-bubble">
              <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>

              <div v-if="msg.messageContent" class="msg-actions">
                <div class="action-bar">
                  <button class="action-btn" :class="{ active: likedMsgIds.has(msg.id) }" @click="handleLike(msg)"
                    title="赞同">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path
                        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </button>
                  <button class="action-btn" :class="{ 'active-danger': dislikedMsgIds.has(msg.id) }"
                    @click="handleDislike(msg)" title="不满意">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path
                        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                    </svg>
                  </button>
                  <span class="action-divider"></span>
                  <button class="action-btn" @click="handleCopy(msg)" title="复制">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button class="action-btn" @click="handleRegenerate(msg, index)" title="重新生成">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </button>
                  <button class="action-btn" :class="{ active: readingMsgId === msg.id }" @click="handleReadAloud(msg)"
                    title="朗读">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                  <span class="action-divider"></span>
                  <button class="action-btn action-btn-text" @click="openAgentPopup(msg)" title="深入分析">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
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

    <div class="input-wrapper">
      <div class="input-inner">
        <ChatInputCard ref="chatInputCardRef" @send="handleSend" />
      </div>
    </div>

    <AgentTransferPopup v-model:visible="showAgentPopup" source="chat"
      :chatContent="selectedMessageForAgent?.messageContent || ''" :defaultPrompt="agentDefaultPrompt"
      @confirm="handleAgentTransferConfirm" />
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
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  width: 100%;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 12px 16px;
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

  .empty-icon {
    font-size: 48px;
  }

  .empty-text {
    font-size: 14px;
    color: #6b7280;
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeInUp 0.3s ease both;

  &.user-message {
    justify-content: flex-end;
  }

  &.robot-message {
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    margin-bottom: 14px;
  }
}

.message-bubble {
  max-width: 80%;

  @media (max-width: 768px) {
    max-width: 95%;
  }

  .bubble-content {
    padding: 12px 16px;
    border-radius: 8px;
    line-height: 1.7;
    font-size: 14px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
      padding: 10px 14px;
      font-size: 14px;
    }

    .user-message & {
      background: linear-gradient(135deg, $primary-green, #10b981);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .robot-message & {
      background: #fff;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
    }
  }

  .message-time {
    font-size: 12px;
    color: #9ca3af;
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
    flex-wrap: wrap;

    @media (max-width: 768px) {
      gap: 1px;
      padding: 2px 4px;
    }
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

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
    }

    svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;

      @media (max-width: 768px) {
        width: 14px;
        height: 14px;
      }
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

      @media (max-width: 768px) {
        padding: 0 8px;
        font-size: 11px;
      }

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

    @media (max-width: 768px) {
      margin: 0 1px;
      height: 14px;
    }
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

// ==========================================
// Agent Chain Timeline & Element Plus Collapse
// ==========================================
.agent-chain-wrapper {
  align-self: flex-start;
  width: 90%;
  max-width: 650px;
  margin-left: 8px;

  @media (max-width: 768px) {
    width: 100%;
    max-width: none;
    margin-left: 0;
  }
}

.chain-timeline {
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px dashed rgba($primary-green, 0.15);
  margin-left: 0.5rem;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    padding-left: 1.2rem;
    margin-left: 0.25rem;
  }
}

.custom-collapse {
  border: none;
  --el-collapse-border-color: transparent;

  .step-node {
    position: relative;
    margin-bottom: 12px;
    animation: fadeInSlideRight 0.4s ease-out both;

    .status-line {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      color: #94a3b8;
      padding: 6px 12px;
      letter-spacing: 0.01em;

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
        box-shadow: 0 0 0 3px rgba($primary-green, 0.1);
      }
    }

    .data-collapse-item {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: rgba($primary-green, 0.2);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        transform: translateY(-1px);
      }

      :deep(.el-collapse-item__header) {
        border-bottom: none;
        height: auto;
        line-height: normal;
        padding: 12px 16px;
        background: linear-gradient(to right, rgba($primary-green, 0.02), transparent);
        transition: background 0.3s;

        &:hover {
          background: rgba($primary-green, 0.04);
        }

        &.is-active {
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          background: rgba($primary-green, 0.05);
        }
      }

      :deep(.el-collapse-item__wrap) {
        border-bottom: none;
        background-color: transparent;
      }

      :deep(.el-collapse-item__content) {
        padding: 0;
      }

      :deep(.el-collapse-item__arrow) {
        color: $primary-green;
        transition: transform 0.3s;
      }
    }
  }

  .collapse-header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
  }
}

// === 总结报告样式 ===
.final-report-wrapper {
  margin-top: 16px;
  animation: fadeInUp 0.5s ease-out both;
}

.final-report-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba($primary-green, 0.15);
  box-shadow: 0 4px 20px rgba($primary-green, 0.06);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, $primary-green, #10b981);
  }

  .report-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(to right, rgba($primary-green, 0.06), transparent);
    border-bottom: 1px solid rgba($primary-green, 0.08);

    .report-icon {
      width: 32px;
      height: 32px;
      background: rgba($primary-green, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-green;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .report-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #111827;
      letter-spacing: 0.03em;
    }
  }

  .report-content-container {
    padding: 8px 12px;
  }
}

// === Markdown 样式修正 ===
.step-content-container {
  padding: 16px 20px;
  background: #fff;

  .markdown-body {
    color: #4b5563; // 稳重的中灰色
    font-size: 0.9rem;
    line-height: 1.8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    letter-spacing: 0.01em;

    :deep(p) {
      margin: 0.6em 0;
    }

    :deep(strong) {
      color: #374151; // 加粗文字稍微深一点，保持对比度
      font-weight: 600;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 1.2em;
    }
  }
}

// === 参考资料小卡片与悬浮窗样式 ===
.reference-section {
  margin: 0 12px 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed rgba($primary-green, 0.3);

  .ref-title {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .ref-cards-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ref-card {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s ease;
    max-width: 220px;
    cursor: pointer;

    &:hover {
      border-color: $primary-green;
      background: rgba($primary-green, 0.05);
      color: $primary-green;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .ref-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .ref-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* Tooltip 内部的自定义气泡结构样式（因为插槽在模板内，Scoped样式是可以生效的） */
.ref-tooltip-content {
  max-width: 280px;
  padding: 4px;

  .ref-tt-title {
    font-size: 13px;
    font-weight: bold;
    color: #111827;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .ref-tt-desc {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.5;
    /* 多行截断 */
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Utilities
.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #e5e7eb;
  border-top-color: $primary-green;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  background: #f8faf9;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  }
}

.input-inner {
  max-width: 800px;
  margin: 0 auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>