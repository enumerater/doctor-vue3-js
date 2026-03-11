<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { useAgentStore } from '@/stores/agent'
import { useSkillsStore } from '@/stores/skills'
import { getStepDisplayConfig } from '@/constants/agentProtocol'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import ChatInputCard from '@/components/ChatInputCard.vue'
import { Loading } from '@element-plus/icons-vue'

marked.setOptions({ breaks: true, gfm: true })

const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const agentStore = useAgentStore()
const route = useRoute()
const messageList = ref(null)
const chatInputCardRef = ref(null)

// ========================
// Agent transfer popup
// ========================
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

// ========================
// 消息列表
// ========================
const messages = computed(() => {
  if (sidebarStore.isAgricultureAgent) {
    return agentStore.messages.map(m => ({
      ...m,
      messageContent: m.content,
      messageRole: m.role === 'user' ? '0' : '1',
      id: m.timestamp,
      messageTime: m.timestamp,
    }))
  }
  return chatStore.chatMessages
})

// ========================
// 步骤展开/收起
// ========================
const expandedSteps = reactive({})

const toggleStep = (msgId, stepIdx) => {
  const key = `${msgId}-${stepIdx}`
  expandedSteps[key] = !expandedSteps[key]
}

const isStepExpanded = (msgId, stepIdx) => {
  return !!expandedSteps[`${msgId}-${stepIdx}`]
}

// ========================
// Markdown 与内容解析
// ========================
const parseMarkdown = (content) => {
  if (!content) return ''
  try {
    const html = marked.parse(String(content))
    return typeof html === 'string' ? html : String(html)
  } catch (err) {
    return content
  }
}

const parseComplexContent = (rawContent) => {
  if (!rawContent) return { type: 'markdown', data: '' }
  let contentToParse = String(rawContent).trim()
  if (contentToParse.startsWith('```')) {
    contentToParse = contentToParse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  try {
    if (contentToParse.startsWith('{') && contentToParse.endsWith('}')) {
      const parsed = JSON.parse(contentToParse)
      if (parsed && typeof parsed === 'object' && (parsed['参考资料'] || parsed['回答'])) {
        return { type: 'json', data: parsed }
      }
    }
  } catch (e) { /* ignore */ }
  if (contentToParse.includes('"回答"')) {
    const match = contentToParse.match(/"回答"\s*:\s*"(.*)/)
    if (match) {
      let partial = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
      if (partial.endsWith('"')) partial = partial.slice(0, -1)
      if (partial.endsWith('",')) partial = partial.slice(0, -3)
      return { type: 'json', data: { '回答': partial } }
    }
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
  const urls = msg.imageUrls || msg.images
  if (!urls) return []
  if (Array.isArray(urls)) return urls
  try { return JSON.parse(urls) } catch { return [] }
}

// ========================
// 消息操作
// ========================
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

// ========================
// 发送消息
// ========================
const handleSend = (content, images) => {
  if (sidebarStore.isAgricultureAgent) {
    agentStore.userInput(content, images, route.params.sessionId)
    // 清空输入框和图片
    chatStore.clearInputValue()
    if (chatInputCardRef.value) {
      chatInputCardRef.value.clearImages?.()
    }
    return
  }
  const userId = localStorage.getItem('id')
  let stored = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partial = stored.startsWith(userId) ? stored.substring(userId.length) : stored
  const full = `${userId}${partial}`
  chatStore.setCurrentSessionId(full)
  chatStore.prepareMessage(content, userId, partial).then(() => {
    chatStore.startStreaming(content, images, userId, partial, localStorage.getItem('token')).catch(console.error)
  })
}

// ========================
// 历史加载
// ========================
let isLoading = false
const loadHistory = async () => {
  if (isLoading) return
  const sid = route.params.sessionId
  if (!sid) return
  isLoading = true
  try {
    // 自动根据历史记录判断模式
    if (sidebarStore.historyList.length === 0) {
      await sidebarStore.fetchHistoryList()
    }
    const sessionInfo = sidebarStore.historyList.find(h => h.sessionId === sid)
    if (sessionInfo) {
      // 严格同步 Agent 状态
      sidebarStore.isAgricultureAgent = !!sessionInfo.agent
      if (sidebarStore.isAgricultureAgent) {
         // 同步图片上传按钮状态
         const skillsStore = useSkillsStore()
         sidebarStore.agentImageUploadEnabled = skillsStore.isSkillEnabled('disease-recognition')
      } else {
         sidebarStore.agentImageUploadEnabled = false
      }
    } else {
      // 如果没找到 sessionInfo（可能是新创建还没刷新的会话），保持当前 store 中的状态
      // 或者如果是通过 URL 直接访问未知会话，默认设为 false 或根据当前 isAgricultureAgent 状态决定
    }

    if (sidebarStore.isAgricultureAgent) {
      await agentStore.fetchHistory(sid)
      agentStore.connect(sid)
      nextTick(scrollToBottom)
      return
    }
    
    // 普通聊天
    chatStore.setCurrentSessionId(sid)
    await chatStore.fetchMessages(sid)
    nextTick(scrollToBottom)
  } finally { isLoading = false }
}

// ========================
// 滚动与生命周期
// ========================
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
watch(() => agentStore.currentTurnSteps.length, () => nextTick(scrollToBottom))
watch(() => agentStore.currentThought, () => nextTick(scrollToBottom))

// Agent confirm dialog
watch(() => agentStore.pendingConfirm, (val) => {
  if (val) {
    ElMessageBox.confirm(val.content, '操作确认', {
      confirmButtonText: '确认执行',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      agentStore.submitConfirm(true)
    }).catch(() => {
      agentStore.submitConfirm(false)
    })
  }
})

let observer
onMounted(() => {
  loadHistory()
  if (messageList.value) {
    observer = new MutationObserver(scrollToBottom)
    observer.observe(messageList.value, { childList: true, subtree: true, characterData: true })
  }
})
onUnmounted(() => {
  observer?.disconnect()
  agentStore.disconnect()
})
watch(() => route.params.sessionId, (newId, oldId) => {
  if (oldId && newId !== oldId) {
    agentStore.disconnect()
  }
  loadHistory()
}, { immediate: true })

watch(() => sidebarStore.isAgricultureAgent, (val) => {
  if (val) {
    loadHistory()
  } else {
    agentStore.disconnect()
    loadHistory()
  }
})
</script>

<template>
  <div class="chat-detail-page">
    <div class="chat-messages" ref="messageList">
      <div class="message-list-inner">
        <div class="empty-state" v-if="messages.length === 0 && !agentStore.isThinking">
          <div class="empty-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="empty-text">暂无聊天记录，开始提问吧</div>
        </div>

        <div v-for="(msg, index) in messages" :key="msg.id || index" class="message-item"
          :class="{ 'user-message': msg.messageRole === '0', 'robot-message': msg.messageRole === '1' }">

          <!-- ========== 用户消息 ========== -->
          <div v-if="msg.messageRole === '0'" class="message-bubble">
            <div v-if="getImagesFromMessage(msg).length" class="image-preview-container">
              <div v-for="(imageUrl, imgIdx) in getImagesFromMessage(msg)" :key="imgIdx" class="img-item">
                <img :src="imageUrl" alt="上传图片" />
              </div>
            </div>
            <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>
            <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
          </div>

          <!-- ========== Agent 消息 ========== -->
          <template v-else-if="sidebarStore.isAgricultureAgent">

            <!-- Answer (带步骤 + 最终回答) -->
            <div v-if="msg.type === 'answer'" class="agent-answer-wrapper">
              <!-- 步骤时间线 -->
              <div v-if="msg.steps?.length" class="steps-timeline">
                <div v-for="(step, sIdx) in msg.steps" :key="sIdx"
                  class="step-item" :class="{ 'is-expanded': isStepExpanded(msg.id, sIdx) }">

                  <div class="step-header" @click="toggleStep(msg.id, sIdx)">
                    <span class="step-dot" :style="{ background: getStepDisplayConfig(step).color }"></span>
                    <span class="step-name">{{ getStepDisplayConfig(step).name }}</span>
                    <span v-if="step.type === 'tool'" class="step-status-badge"
                      :class="step.status === 'completed' ? 'status-done' : 'status-loading'">
                      <el-icon v-if="step.status === 'calling'" class="is-loading"><Loading /></el-icon>
                      <span v-else>✓</span>
                    </span>
                    <span class="step-chevron">{{ isStepExpanded(msg.id, sIdx) ? '▾' : '▸' }}</span>
                  </div>

                  <transition name="step-expand">
                    <div v-if="isStepExpanded(msg.id, sIdx)" class="step-body">
                      <div v-if="step.type === 'thought_result'" class="markdown-body step-markdown"
                        v-html="parseMarkdown(step.content)"></div>
                      <template v-else-if="step.type === 'tool'">
                        <div v-if="step.resultContent" class="markdown-body step-markdown"
                          v-html="parseMarkdown(step.resultContent)"></div>
                        <div v-else-if="step.callContent" class="step-call-hint">{{ step.callContent }}</div>
                      </template>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- 最终回答卡片 -->
              <div class="answer-card">
                <div class="answer-card-body">
                  <template v-for="(parsed, pIdx) in [parseComplexContent(msg.messageContent)]" :key="pIdx">
                    <template v-if="parsed.type === 'json'">
                      <div class="markdown-body" v-if="parsed.data['回答']" v-html="parseMarkdown(parsed.data['回答'])"></div>
                      <div v-if="parsed.data['参考资料']?.length" class="reference-section">
                        <div class="ref-title">参考资料</div>
                        <div class="ref-cards-wrapper">
                          <el-tooltip v-for="(refItem, rIdx) in parsed.data['参考资料']" :key="rIdx" effect="light" placement="top" :show-after="200">
                            <template #content>
                              <div class="ref-tooltip-content">
                                <div class="ref-tt-title">{{ refItem.title }}</div>
                                <div class="ref-tt-desc">{{ refItem.content }}</div>
                              </div>
                            </template>
                            <a :href="refItem.url" target="_blank" class="ref-card" @click.stop>
                              <svg class="ref-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path x1="14" y1="11" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
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
              </div>

              <div class="msg-actions agent-actions">
                <el-button text size="small" @click="handleCopy(msg)">复制全文</el-button>
              </div>
              <div class="message-time agent-time">{{ formatTime(msg.messageTime) }}</div>
            </div>

            <!-- Ask (追问 + 输入框) -->
            <div v-else-if="msg.type === 'ask'" class="agent-ask-wrapper">
              <div class="ask-content">
                <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>
                <div class="ask-input-area" v-if="index === messages.length - 1 && agentStore.pendingAsk">
                  <el-input
                    v-model="agentStore.pendingAsk.userInput"
                    placeholder="请输入补充信息..."
                    size="small"
                    @keyup.enter="agentStore.submitAnswer(agentStore.pendingAsk.userInput)"
                  >
                    <template #append>
                      <el-button @click="agentStore.submitAnswer(agentStore.pendingAsk.userInput)">发送</el-button>
                    </template>
                  </el-input>
                </div>
              </div>
              <div class="message-time">{{ formatTime(msg.messageTime) }}</div>
            </div>

            <!-- Confirm (确认提示) -->
            <div v-else-if="msg.type === 'confirm'" class="agent-confirm-bubble">
              <div class="bubble-content confirm-bubble">
                <div class="confirm-header">操作确认</div>
                <div class="confirm-body">{{ msg.content }}</div>
              </div>
              <div class="message-time">{{ formatTime(msg.messageTime) }}</div>
            </div>

            <!-- Error -->
            <div v-else-if="msg.type === 'error'" class="message-bubble">
              <div class="bubble-content error-content">{{ msg.messageContent }}</div>
              <div class="message-time">{{ formatTime(msg.messageTime) }}</div>
            </div>
          </template>

          <!-- ========== 普通聊天消息 ========== -->
          <div v-else class="message-bubble">
            <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>

            <div v-if="msg.messageContent" class="msg-actions">
              <div class="action-bar">
                <button class="action-btn" :class="{ active: likedMsgIds.has(msg.id) }" @click="handleLike(msg)" title="赞同">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </button>
                <button class="action-btn" :class="{ 'active-danger': dislikedMsgIds.has(msg.id) }" @click="handleDislike(msg)" title="不满意">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                  </svg>
                </button>
                <span class="action-divider"></span>
                <button class="action-btn" @click="handleCopy(msg)" title="复制">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button class="action-btn" @click="handleRegenerate(msg, index)" title="重新生成">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
                <button class="action-btn" :class="{ active: readingMsgId === msg.id }" @click="handleReadAloud(msg)" title="朗读">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
                <span class="action-divider"></span>
                <button class="action-btn action-btn-text" @click="openAgentPopup(msg)" title="深入分析">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        </div>

        <!-- ========== 进行中的步骤（Agent 工作时实时展示） ========== -->
        <div v-if="sidebarStore.isAgricultureAgent && agentStore.currentTurnSteps.length > 0"
          class="message-item robot-message">
          <div class="agent-progress-wrapper">
            <div class="steps-timeline is-live">
              <div v-for="(step, sIdx) in agentStore.currentTurnSteps" :key="sIdx"
                class="step-item" :class="{ 'is-expanded': isStepExpanded('live', sIdx) }">

                <div class="step-header" @click="toggleStep('live', sIdx)">
                  <span class="step-dot" :style="{ background: getStepDisplayConfig(step).color }"
                    :class="{ 'is-pulse': step.status === 'calling' }"></span>
                  <span class="step-name">{{ getStepDisplayConfig(step).name }}</span>
                  <span v-if="step.type === 'tool'" class="step-status-badge"
                    :class="step.status === 'completed' ? 'status-done' : 'status-loading'">
                    <el-icon v-if="step.status === 'calling'" class="is-loading"><Loading /></el-icon>
                    <span v-else>✓</span>
                  </span>
                  <span class="step-chevron">{{ isStepExpanded('live', sIdx) ? '▾' : '▸' }}</span>
                </div>

                <transition name="step-expand">
                  <div v-if="isStepExpanded('live', sIdx)" class="step-body">
                    <div v-if="step.type === 'thought_result'" class="markdown-body step-markdown"
                      v-html="parseMarkdown(step.content)"></div>
                    <template v-else-if="step.type === 'tool'">
                      <div v-if="step.resultContent" class="markdown-body step-markdown"
                        v-html="parseMarkdown(step.resultContent)"></div>
                      <div v-else-if="step.callContent" class="step-call-hint">{{ step.callContent }}</div>
                    </template>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 实时思考指示器 ========== -->
        <div v-if="sidebarStore.isAgricultureAgent && agentStore.isThinking"
          class="message-item robot-message transient-status">
          <div class="agent-thinking-indicator">
            <template v-if="agentStore.activeTool">
              <span class="thinking-text">正在{{ getStepDisplayConfig({ type: 'tool', tool: agentStore.activeTool }).name }}...</span>
            </template>
            <template v-else>
              <el-icon class="is-loading thinking-spinner"><Loading /></el-icon>
              <span class="thinking-text">{{ agentStore.currentThought || '正在思考...' }}</span>
            </template>
          </div>
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

  .empty-icon { font-size: 48px; }
  .empty-text { font-size: 14px; color: #6b7280; }
}

// ==========================================
// 消息通用
// ==========================================
.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeInUp 0.3s ease both;

  &.user-message { justify-content: flex-end; }
  &.robot-message { justify-content: flex-start; }

  @media (max-width: 768px) { margin-bottom: 14px; }
}

.message-bubble {
  max-width: 80%;

  @media (max-width: 768px) { max-width: 95%; }

  .bubble-content {
    padding: 12px 16px;
    border-radius: 8px;
    line-height: 1.7;
    font-size: 14px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) { padding: 10px 14px; }

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
// Agent 回答卡片
// ==========================================
.agent-answer-wrapper {
  width: 90%;
  max-width: 700px;

  @media (max-width: 768px) {
    width: 100%;
    max-width: none;
  }
}

// ==========================================
// 步骤时间线
// ==========================================
.steps-timeline {
  position: relative;
  padding-left: 20px;
  margin-bottom: 12px;

  // 左侧竖线
  &::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 10px;
    bottom: 10px;
    width: 1px;
    background: #e5e7eb;
    border-radius: 1px;
  }

  &.is-live::before {
    background: linear-gradient(to bottom, $primary-green, transparent);
  }
}

.step-item {
  position: relative;
  margin-bottom: 4px;
  animation: fadeIn 0.3s ease both;

  &:last-child { margin-bottom: 0; }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background: #f3f4f6;
  }
}

.step-dot {
  position: absolute;
  left: -20px;
  top: 13px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
  z-index: 1;
  transition: all 0.3s ease;

  &.is-pulse {
    background: $primary-green;
    box-shadow: 0 0 0 3px rgba($primary-green, 0.15);
  }
}

.step-name {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  flex: 1;
}

.step-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;

  &.status-done {
    color: $primary-green;
  }

  &.status-loading {
    color: #9ca3af;
  }
}

.step-chevron {
  font-size: 10px;
  color: #9ca3af;
}

.step-body {
  margin: 2px 0 8px 10px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.step-markdown {
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;

  :deep(p) { margin: 0.4em 0; }
  :deep(ul), :deep(ol) { padding-left: 1.2em; }
}

.step-call-hint {
  font-size: 12px;
  color: #9ca3af;
}

// 步骤展开动画
.step-expand-enter-active,
.step-expand-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
  opacity: 1;
}
.step-expand-enter-from,
.step-expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
}

// ==========================================
// 最终回答卡片
// ==========================================
.answer-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.answer-card-body {
  padding: 16px 20px;

  .markdown-body {
    font-size: 14px;
    line-height: 1.7;
    color: #374151;

    // 减弱标题显示，回应“别用题头”
    :deep(h1), :deep(h2), :deep(h3) {
      font-size: 15px;
      margin: 1em 0 0.5em;
      color: #111827;
      border-bottom: none;
      padding-bottom: 0;
      font-weight: 600;
      
      &:first-child { margin-top: 0; }
    }

    :deep(p) { margin: 0.6em 0; }
    :deep(strong) { color: #111827; }
    :deep(ul), :deep(ol) { padding-left: 1.4em; }
    :deep(code) {
      background: #f3f4f6;
      color: #111827;
      padding: 2px 4px;
      border-radius: 4px;
    }
    :deep(blockquote) {
      border-left: 3px solid $primary-green;
      padding-left: 12px;
      color: #6b7280;
      margin: 0.8em 0;
    }
  }
}

// ==========================================
// 参考资料
// ==========================================
.reference-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;

  .ref-title {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 10px;
    font-weight: 500;
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
    padding: 5px 12px;
    background: #f9fafb;
    border: 1px solid #f3f4f6;
    border-radius: 6px;
    font-size: 12px;
    color: #4b5563;
    text-decoration: none;
    transition: all 0.2s;
    max-width: 200px;

    &:hover {
      border-color: #d1d5db;
      background: #f3f4f6;
    }

    .ref-icon { width: 12px; height: 12px; color: #9ca3af; }
    .ref-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
}

.ref-tooltip-content {
  max-width: 280px;
  padding: 4px;

  .ref-tt-title { font-size: 13px; font-weight: bold; color: #111827; margin-bottom: 6px; }
  .ref-tt-desc {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ==========================================
// Agent 进行中
// ==========================================
.agent-progress-wrapper {
  width: 90%;
  max-width: 700px;
  margin-bottom: 8px;
}

// ==========================================
// 实时思考指示器
// ==========================================
.agent-thinking-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.thinking-spinner {
  color: $primary-green;
  font-size: 14px;
}

.thinking-text {
  font-size: 13px;
  color: #6b7280;
}

// ==========================================
// Ask 交互
// ==========================================
.agent-ask-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 80%;

  .ask-content {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    border-bottom-left-radius: 4px;
    padding: 12px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    .ask-input-area {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #e5e7eb;
    }
  }

  .message-time {
    font-size: 12px;
    color: #9ca3af;
    padding: 0 4px;
  }
}

// ==========================================
// Confirm 交互
// ==========================================
.agent-confirm-bubble {
  max-width: 80%;

  .confirm-bubble {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    border-bottom-left-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .confirm-header {
      background: #f9fafb;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #f3f4f6;
    }

    .confirm-body {
      padding: 12px 16px;
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
    }
  }

  .message-time {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    padding: 0 4px;
  }
}

// ==========================================
// Error
// ==========================================
.error-content {
  color: #dc2626 !important;
  border-color: #fecaca !important;
  background-color: #fef2f2 !important;
}

// ==========================================
// 消息操作栏
// ==========================================
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

    @media (max-width: 768px) { gap: 1px; padding: 2px 4px; }
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

    @media (max-width: 768px) { width: 28px; height: 28px; }

    svg { width: 15px; height: 15px; flex-shrink: 0; }

    &:hover { background: rgba($primary-green, 0.08); color: $primary-green; }
    &.active { color: $primary-green; background: rgba($primary-green, 0.12); }
    &.active-danger { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    &.action-btn-text {
      width: auto;
      border-radius: 15px;
      padding: 0 10px;
      gap: 4px;
      font-size: 12px;

      @media (max-width: 768px) { padding: 0 8px; font-size: 11px; }
      span { white-space: nowrap; }
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

.agent-actions { margin-top: 8px; }

.agent-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

// ==========================================
// Input 区域
// ==========================================
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

// ==========================================
// 动画
// ==========================================
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInSlide {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08); }
  50% { box-shadow: 0 0 0 4px rgba($primary-green, 0.25); }
}
</style>
