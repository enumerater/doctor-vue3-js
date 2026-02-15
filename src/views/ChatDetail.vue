<template>
  <div class="chat-detail-container" :class="{ 'agriculture-agent-chat': sidebarStore.isAgricultureAgent }">
    <!-- 原生空状态：替代Vant的Empty组件，无第三方依赖 -->
    <div class="empty-state" v-if="messages.length === 0">
      <div class="empty-icon">💬</div>
      <div class="empty-text">暂无聊天记录，开始提问吧～</div>
    </div>

    <!-- 聊天消息列表：修复滚动 + 自动滚动到底部 -->
    <div class="message-list" ref="messageList">
      <div v-for="(msg, index) in messages" :key="msg.id || index"
           class="message-item"
           :class="{
             'user-message': msg.messageRole === '0',
             'robot-message': msg.messageRole === '1',
             'image-message': msg.isImageMessage,
           }"
           :style="{ animationDelay: `${index * 0.05}s` }">
        <!-- 移除所有头像相关代码 -->

        <!-- 消息气泡：美化样式 + 自适应宽度 + Markdown渲染 -->
        <div class="message-bubble">
          <!-- 如果是图片消息，显示图片预览 -->
          <div v-if="msg.isImageMessage" class="image-preview-container">
            <div v-for="(imageUrl, imgIndex) in getImagesFromMessage(msg)" :key="imgIndex" class="image-preview-item">
              <img :src="imageUrl" alt="上传的图片" class="preview-image">
            </div>
          </div>
          <!-- 核心修改：用v-html渲染解析后的Markdown -->
          <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>
          <!-- 消息操作栏：仅机器人消息显示 -->
          <div v-if="msg.messageRole === '1' && msg.messageContent" class="msg-actions">
            <span class="action-btn" @click="openAgentPopup(msg)" title="深入分析">
              <span class="analyze-icon-mini">🌿</span>
              <span class="action-label">深入分析</span>
            </span>
            <span class="action-btn" @click="handleCopy(msg)" title="复制">
              <van-icon name="records" />
              <span class="action-label">复制</span>
            </span>
            <span class="action-btn" @click="handleRegenerate(msg, index)" title="重新生成">
              <van-icon name="replay" />
              <span class="action-label">重新生成</span>
            </span>
            <span class="action-btn" :class="{ 'is-reading': readingMsgId === msg.id }" @click="handleReadAloud(msg)" title="朗读">
              <van-icon :name="readingMsgId === msg.id ? 'pause-circle-o' : 'volume-o'" />
              <span class="action-label">{{ readingMsgId === msg.id ? '停止' : '朗读' }}</span>
            </span>
            <span class="action-btn" :class="{ active: likedMsgIds.has(msg.id) }" @click="handleLike(msg)" title="喜欢">
              <van-icon :name="likedMsgIds.has(msg.id) ? 'good-job' : 'good-job-o'" />
            </span>
            <span class="action-btn dislike-btn" :class="{ active: dislikedMsgIds.has(msg.id) }" @click="handleDislike(msg)" title="不喜欢">
              <van-icon :name="dislikedMsgIds.has(msg.id) ? 'good-job' : 'good-job-o'" />
            </span>
            <span class="action-btn" @click="handleForward(msg)" title="转发">
              <van-icon name="share-o" />
            </span>
            <van-popover v-model:show="moreMenuVisible[msg.id]" :actions="moreActions" @select="(action) => onMoreSelect(action, msg)" placement="top" theme="dark">
              <template #reference>
                <span class="action-btn" title="更多">
                  <van-icon name="ellipsis" />
                </span>
              </template>
            </van-popover>
          </div>
          <!-- 原生JS格式化时间：无dayjs依赖 -->
          <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
        </div>
      </div>
    </div>

    <!-- Agent分析弹窗 -->
    <AgentTransferPopup v-model:visible="showAgentPopup" source="chat"
      :chatContent="selectedMessageForAgent?.messageContent || ''" :defaultPrompt="agentDefaultPrompt"
      @confirm="handleAgentTransferConfirm" />
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { computed, watch, onMounted, onUnmounted, ref, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
// 核心新增：导入marked库解析Markdown
import { marked } from 'marked'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import { showToast, showConfirmDialog } from 'vant'

// 配置marked（适配聊天场景）
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格Markdown
  renderer: new marked.Renderer(), // 使用默认渲染器
})

// 移除VanEmpty导入（彻底不用Vant）
const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const messageList = ref(null) // 消息列表ref：用于自动滚动到底部

// Agent分析弹窗相关
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

// ========== 消息操作栏相关 ==========
const likedMsgIds = ref(new Set())
const dislikedMsgIds = ref(new Set())
const moreMenuVisible = reactive({})
const readingMsgId = ref(null)

// 更多菜单选项
const moreActions = [
  { text: '转化为文档', value: 'toDoc' },
  { text: '收藏', value: 'collect' },
  { text: '反馈', value: 'feedback' },
  { text: '举报', value: 'report' },
  { text: '删除', value: 'delete' },
]

// 复制消息文本
const handleCopy = async (msg) => {
  try {
    const text = msg.messageContent || ''
    await navigator.clipboard.writeText(text)
    showToast('已复制')
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = msg.messageContent || ''
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('已复制')
  }
}

// 重新生成
const handleRegenerate = (msg, index) => {
  // 找到该机器人消息之前的用户消息
  let userMsg = null
  for (let i = index - 1; i >= 0; i--) {
    if (messages.value[i].messageRole === '0') {
      userMsg = messages.value[i]
      break
    }
  }
  if (userMsg && userMsg.messageContent) {
    const userId = localStorage.getItem('id')
    const sessionId = route.params.sessionId
    const partialSessionId = sessionId.startsWith(userId)
      ? sessionId.substring(userId.length)
      : sessionId
    const TOKEN = localStorage.getItem('token') || ''
    chatStore.sendMessage(userMsg.messageContent, null, userId, partialSessionId, TOKEN)
  } else {
    showToast('未找到对应的用户消息')
  }
}

// 朗读 / 停止朗读
const handleReadAloud = (msg) => {
  const synth = window.speechSynthesis
  if (!synth) {
    showToast('当前浏览器不支持语音朗读')
    return
  }
  // 正在朗读该消息则停止
  if (readingMsgId.value === msg.id) {
    synth.cancel()
    readingMsgId.value = null
    return
  }
  // 停止之前的朗读
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(msg.messageContent || '')
  utterance.lang = 'zh-CN'
  utterance.onend = () => { readingMsgId.value = null }
  utterance.onerror = () => { readingMsgId.value = null }
  readingMsgId.value = msg.id
  synth.speak(utterance)
}

// 喜欢（与不喜欢互斥）
const handleLike = (msg) => {
  if (likedMsgIds.value.has(msg.id)) {
    likedMsgIds.value.delete(msg.id)
  } else {
    likedMsgIds.value.add(msg.id)
    dislikedMsgIds.value.delete(msg.id)
  }
}

// 不喜欢（与喜欢互斥）
const handleDislike = (msg) => {
  if (dislikedMsgIds.value.has(msg.id)) {
    dislikedMsgIds.value.delete(msg.id)
  } else {
    dislikedMsgIds.value.add(msg.id)
    likedMsgIds.value.delete(msg.id)
  }
}

// 转发
const handleForward = async (msg) => {
  const text = msg.messageContent || ''
  if (navigator.share) {
    try {
      await navigator.share({ title: 'AI回复', text })
    } catch {
      // 用户取消分享，忽略
    }
  } else {
    // 不支持 Web Share API，降级为复制
    try {
      await navigator.clipboard.writeText(text)
      showToast('已复制内容，可粘贴转发')
    } catch {
      showToast('转发功能暂不可用')
    }
  }
}

// 更多菜单选择
const onMoreSelect = (action, msg) => {
  switch (action.value) {
    case 'delete':
      showConfirmDialog({ title: '确认删除', message: '确定要删除这条消息吗？' })
        .then(() => {
          const idx = chatStore.chatMessages.findIndex(m => m.id === msg.id)
          if (idx !== -1) {
            chatStore.chatMessages.splice(idx, 1)
            showToast('已删除')
          }
        })
        .catch(() => {})
      break
    case 'toDoc':
      showToast('转化为文档功能开发中')
      break
    case 'collect':
      showToast('收藏功能开发中')
      break
    case 'feedback':
      showToast('反馈功能开发中')
      break
    case 'report':
      showToast('举报功能开发中')
      break
  }
}

// 计算属性：获取聊天消息
const messages = computed(() => {
  console.log('计算属性messages被调用，当前chatMessages长度:', chatStore.chatMessages.length)
  console.log('chatMessages内容:', chatStore.chatMessages)
  return chatStore.chatMessages
})

// 核心新增：Markdown解析方法
const parseMarkdown = (content) => {
  if (!content) return ''
  try {
    // 将文本解析为Markdown HTML
    return marked.parse(content)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    // 如果解析失败，直接返回原始内容
    return content
  }
}

// 原生JS格式化时间（无dayjs依赖）
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  // 兼容时间戳/字符串格式
  const date = new Date(timeStr)
  // 处理无效时间
  if (isNaN(date.getTime())) return ''

  // 格式化为 HH:mm
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 从消息中提取图片URL
const getImagesFromMessage = (msg) => {
  try {
    // 如果消息有originalData字段，解析它获取图片URL
    if (msg.originalData) {
      const parsedData = JSON.parse(msg.originalData)
      if (parsedData.images && Array.isArray(parsedData.images)) {
        return parsedData.images
      }
    }
  } catch (e) {
    // 解析失败，返回空数组
    return []
  }
  return []
}

// 防止重复加载的标记
let isLoadingMessages = false

// 加载历史消息（带防抖）
const loadHistoryMessages = async () => {
  console.log('loadHistoryMessages函数被调用')
  // 防止重复调用
  if (isLoadingMessages) {
    console.log('正在加载中，跳过重复调用')
    return
  }

  const sessionId = route.params.sessionId
  console.log('当前路由参数sessionId:', sessionId)
  if (!sessionId) return

  isLoadingMessages = true

  try {
    // 检查是否是刚刚发送的消息（当前 store 中的消息）
    // 如果 store 中已经有消息，优先使用本地消息（无论 sessionId 是否匹配）
    // 因为刚刚发送消息后跳转过来时，store 中已经有用户消息和空的机器人消息
    const hasMessages = chatStore.chatMessages.length > 0
    console.log('当前store中是否有消息:', hasMessages, '消息长度:', chatStore.chatMessages.length)

    if (hasMessages) {
      console.log('使用 store 中的消息，跳过加载历史消息')
      // 确保当前会话ID正确设置
      chatStore.setCurrentSessionId(sessionId)
      nextTick(() => scrollToBottom())
      return
    }

    // 否则加载历史消息（包括刷新页面、从历史记录点击进入等情况）
    console.log('加载历史消息，sessionId:', sessionId)
    chatStore.setCurrentSessionId(sessionId)
    await chatStore.fetchMessages(sessionId)
    console.log('fetchMessages调用完成，当前chatMessages长度:', chatStore.chatMessages.length)

    // 加载完成后滚动到底部
    nextTick(() => scrollToBottom())
  } catch (error) {
    console.error('loadHistoryMessages发生错误:', error)
  } finally {
    isLoadingMessages = false
  }
}

// 自动滚动到底部（增强版）
const scrollToBottom = () => {
  if (messageList.value) {
    // 使用setTimeout确保DOM完全更新
    setTimeout(() => {
      if (messageList.value) {
        // 使用scrollIntoView确保元素可见
        const lastMessage = messageList.value.lastElementChild
        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }
    }, 0)
  }
}

// 监听消息变化，自动滚动到底部
watch(
  () => messages.value.length,
  () => {
    nextTick(() => scrollToBottom())
  },
)

// 监听最后一条消息的内容变化（流式更新时）
watch(
  () => {
    const lastMsg = messages.value[messages.value.length - 1]
    return lastMsg?.messageContent || ''
  },
  () => {
    // 流式更新时，立即滚动到底部，确保用户能看到最新内容
    nextTick(() => scrollToBottom())
  },
)

// 使用MutationObserver监听DOM变化，确保流式内容自动滚动
let observer
onMounted(() => {
  loadHistoryMessages()
  if (messageList.value) {
    observer = new MutationObserver(() => {
      // DOM变化时滚动到底部
      scrollToBottom()
    })
    observer.observe(messageList.value, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    })
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

watch(
  () => route.params.sessionId,
  () => {
    loadHistoryMessages()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
// 使用全局 variables.scss；气泡圆角用 $radius-lg 更柔和
$bubble-radius: $radius-lg;

// 关键帧动画
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

// 全局穿透：禁用页面整体滚动
:deep(html),
:deep(body) {
  overflow: hidden;
  margin: 0;
  padding: 0;
}

// 容器：适配统一风格
.chat-detail-container {
  width: 100%;
  height: 100%; // 继承父容器（main-content）的高度，而非100vh
  box-sizing: border-box;
  padding: 1.25rem;
  background: linear-gradient(180deg, $bg-main 0%, #f5faf7 100%);
  overflow: hidden; // 禁用容器本身滚动
  position: relative;
  font-family: $font-family;
}

// 原生空状态样式（适配绿色系）
.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  .empty-icon {
    font-size: 3.75rem;
    color: $secondary;
    opacity: 0.8;
  }

  .empty-text {
    font-size: 0.875rem;
    color: $text-secondary;
    text-align: center;
    padding: 0 1rem;
  }

  // 空状态最大宽度限制，与消息列表保持一致
  @media (min-width: 768px) {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
}

// 消息列表：优化样式 + 统一滚动条
.message-list {
  width: 100%;
  height: 100%;
  overflow-y: auto; // 仅内部滚动
  padding-bottom: 0.625rem; // 底部留白
  scroll-behavior: smooth; // 平滑滚动

  // 消息列表在页面中居中，与AgentDetil保持一致
  @media (min-width: 768px) {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  // 美化滚动条（适配主题色）
  &::-webkit-scrollbar {
    width: 4px; // 窄滚动条，更美观
  }

  &::-webkit-scrollbar-track {
    background: transparent; // 隐藏轨道
  }

  &::-webkit-scrollbar-thumb {
    background-color: $secondary;
    border-radius: 2px;
    opacity: 0.6;

    &:hover {
      background-color: $primary;
      opacity: 1;
    }
  }
}

// 消息项：统一布局 + 间距（移除头像后调整间距）
.message-item {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start; // 气泡顶部对齐
  width: 100%;
  animation: messageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

// 用户消息：右对齐
.user-message {
  justify-content: flex-end;
}

// 机器人消息：左对齐
.robot-message {
  justify-content: flex-start;
}

// 消息气泡：核心美化（适配绿色系主题）
.message-bubble {
  max-width: 75%; // 限制气泡宽度，避免过宽
  display: flex;
  flex-direction: column;
  transition: $transition-smooth;

  &:hover {
    animation: bubbleFloat 1.5s ease-in-out infinite;
  }

  .bubble-content {
    padding: 1rem 1.25rem;
    border-radius: $bubble-radius;
    line-height: 1.7;
    font-size: 0.9375rem;
    word-wrap: break-word;
    box-shadow: $shadow-sm;
    transition: $transition-smooth;
    color: $text-primary;
    background-color: white;

    // 用户消息样式覆盖
    .user-message & {
      background: linear-gradient(135deg, $primary, $secondary);
      color: white;
    }

    &:hover {
      box-shadow: $shadow-md;
    }

    // 核心新增：Markdown样式适配（气泡内）
    // 标题样式
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0.3rem 0 0.5rem;
      font-weight: 600;
      line-height: 1.4;

      // 区分用户/机器人气泡的标题颜色
      .user-message & {
        color: #fff;
        opacity: 0.95;
      }

      .robot-message & {
        color: $primary;
      }

      // 缩小标题字号（适配气泡）
      h1 {
        font-size: 1.1rem;
      }

      h2 {
        font-size: 1.05rem;
      }

      h3 {
        font-size: 1rem;
      }

      h4,
      h5,
      h6 {
        font-size: 0.95rem;
      }
    }

    // 列表样式
    ul,
    ol {
      padding-left: 1.2rem;
      margin: 0.4rem 0;

      .user-message & {
        color: #fff;
        opacity: 0.95;
      }

      .robot-message & {
        color: $text-primary;
      }
    }

    li {
      margin: 0.2rem 0;
    }

    // 加粗/斜体
    strong {
      font-weight: 600;

      .user-message & {
        color: #fff;
        opacity: 1;
      }

      .robot-message & {
        color: $primary;
      }
    }

    em {
      font-style: italic;

      .user-message & {
        opacity: 0.95;
      }
    }

    // 代码块/行内代码
    pre {
      background-color: rgba(0, 0, 0, 0.15);
      padding: 0.5rem 0.8rem;
      border-radius: $radius-sm;
      overflow-x: auto;
      margin: 0.5rem 0;
      font-size: 0.85rem;

      .user-message & {
        background-color: rgba(255, 255, 255, 0.15);
      }
    }

    code {
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-size: 0.85rem;

      .user-message & {
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .robot-message & {
        background-color: $primary-light;
        color: $primary;
      }
    }

    // 段落间距
    p {
      margin: 0.3rem 0;
    }

    // 链接样式
    a {
      text-decoration: underline;

      .user-message & {
        color: #fff;
        opacity: 0.95;
      }

      .robot-message & {
        color: $primary;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .message-time {
    font-size: 0.75rem;
    color: $text-secondary;
    margin-top: 0.25rem;
    align-self: flex-end; // 时间靠右
    padding: 0 0.5rem;
  }

  // ******** 核心修改：用户气泡改为农业绿渐变 ********
  .user-message & .bubble-content {
    background: linear-gradient(135deg, $primary, $primary-hover);
    color: #fff;
    border-bottom-right-radius: $radius-sm; // 分级圆角，更自然
    max-width: 80%; // 限制最大宽度
  }

  // ******** 核心修改：机器人气泡适配绿色系 ********
  .robot-message & .bubble-content {
    background-color: $bg-card;
    color: $text-primary;
    border: 1px solid $primary-light;
    border-bottom-left-radius: $radius-sm; // 分级圆角
    max-width: 80%; // 限制最大宽度
  }

  // 气泡hover效果（和整体微交互统一）
  .bubble-content:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
}

// 消息操作栏
.msg-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 8px;
  padding: 4px 0;

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    font-size: 0.75rem;
    color: $text-tertiary;
    border-radius: 14px;
    cursor: pointer;
    transition: $transition-fast;
    user-select: none;
    white-space: nowrap;

    .van-icon {
      font-size: 15px;
    }

    &:hover {
      color: $primary;
      background-color: $primary-light;
    }

    &:active {
      transform: scale(0.92);
    }

    &.active {
      color: $primary;
    }

    &.is-reading {
      color: $primary;
      background-color: $primary-light;
    }
  }

  // 不喜欢按钮图标翻转
  .dislike-btn .van-icon {
    display: inline-block;
    transform: rotate(180deg);
  }

  // 深入分析小图标
  .analyze-icon-mini {
    font-size: 14px;
    line-height: 1;
  }

  .action-label {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

// 响应式适配：移动端优化（和整体风格统一）
@media (max-width: 375px) {
  .chat-detail-container {
    padding: 0.625rem;
  }

  .bubble-content {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem !important;

    // 移动端缩小Markdown元素字号
    h1 {
      font-size: 1rem !important;
    }

    h2 {
      font-size: 0.95rem !important;
    }

    h3 {
      font-size: 0.9rem !important;
    }

    h4,
    h5,
    h6 {
      font-size: 0.85rem !important;
    }

    code,
    pre {
      font-size: 0.8rem !important;
    }
  }

  .message-item {
    margin-bottom: 1rem;
  }

  .empty-icon {
    font-size: 3rem !important;
  }

  .empty-text {
    font-size: 0.8125rem !important;
  }
}

/* 农业Agent聊天样式 */
.agriculture-agent-chat {
  // 农业Agent聊天容器的特殊背景
  background-color: rgba(248, 250, 249, 0.95);

  // 农业Agent思考过程的样式
  .agent-thought {
    background-color: rgba(52, 199, 89, 0.1);
    border: 1px solid rgba(52, 199, 89, 0.2);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;

    .thought-icon {
      color: #34c759;
      font-size: 16px;
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .thought-content {
      font-size: 14px;
      color: #2d3748;
      line-height: 1.6;
      font-style: italic;
    }
  }

  // 农业Agent执行过程的样式
  .agent-execute {
    background-color: rgba(52, 199, 89, 0.05);
    border: 1px solid rgba(52, 199, 89, 0.1);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;

    .execute-icon {
      color: #34c759;
      font-size: 16px;
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .execute-content {
      font-size: 14px;
      color: #2d3748;
      line-height: 1.6;
    }
  }

  // 农业Agent消息气泡的特殊样式
  .robot-message .message-bubble .bubble-content {
    background-color: rgba(255, 255, 255, 0.95);
    border-color: rgba(52, 199, 89, 0.3);
    box-shadow: 0 2px 8px rgba(52, 199, 89, 0.1);
  }
}

// 农业Agent聊天中的特殊消息类型
.agent-tool-call {
  background-color: rgba(255, 248, 225, 0.9);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;

  .tool-name {
    font-weight: 600;
    color: #d69e2e;
    margin-bottom: 4px;
  }

  .tool-params {
    font-size: 13px;
    color: #718096;
    margin-left: 16px;
  }
}

// 图片消息样式
.image-message {
  // 图片消息的特殊样式
}

// 图片预览容器
.image-preview-container {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// 图片预览项
.image-preview-item {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

// 预览图片
.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

// 农业Agent决策过程的动画效果
@keyframes thinking-pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.02);
  }

  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

.agent-thought {
  animation: thinking-pulse 2s infinite ease-in-out;
}
</style>