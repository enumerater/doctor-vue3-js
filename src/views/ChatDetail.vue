<template>
  <div class="chat-detail-container">
    <!-- 原生空状态：替代Vant的Empty组件，无第三方依赖 -->
    <div class="empty-state" v-if="messages.length === 0">
      <div class="empty-icon">💬</div>
      <div class="empty-text">暂无聊天记录，开始提问吧～</div>
    </div>

    <!-- 聊天消息列表：修复滚动 + 自动滚动到底部 -->
    <div class="message-list" ref="messageList">
      <div v-for="(msg, index) in messages" :key="msg.id || index" class="message-item" :class="{
        'user-message': msg.messageRole === '0',
        'robot-message': msg.messageRole === '1',
      }">
        <!-- 移除所有头像相关代码 -->

        <!-- 消息气泡：美化样式 + 自适应宽度 + Markdown渲染 -->
        <div class="message-bubble">
          <!-- 核心修改：用v-html渲染解析后的Markdown -->
          <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>
          <!-- 原生JS格式化时间：无dayjs依赖 -->
          <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import { computed, watch, onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
// 核心新增：导入marked库解析Markdown
import { marked } from 'marked'

// 配置marked（适配聊天场景）
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格Markdown
  renderer: new marked.Renderer(), // 使用默认渲染器
})

// 移除VanEmpty导入（彻底不用Vant）
const chatStore = useChatStore()
const route = useRoute()
const messageList = ref(null) // 消息列表ref：用于自动滚动到底部

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

// 自动滚动到底部
const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
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
    // 流式更新时，延迟滚动，避免过于频繁
    setTimeout(() => {
      nextTick(() => scrollToBottom())
    }, 100)
  },
)

// 组件挂载 + 路由参数变化监听
onMounted(() => {
  loadHistoryMessages()
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
  padding: 1rem;
  background-color: $bg-main;
  overflow: hidden; // 禁用容器本身滚动
  position: relative;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
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
}

// 消息列表：优化样式 + 统一滚动条
.message-list {
  width: 100%;
  height: 100%;
  overflow-y: auto; // 仅内部滚动
  padding-bottom: 0.625rem; // 底部留白
  scroll-behavior: smooth; // 平滑滚动

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
  margin-bottom: 1.25rem;
  align-items: flex-start; // 气泡顶部对齐
  transition: $transition;
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
  max-width: 70%; // 限制气泡宽度，避免过宽
  display: flex;
  flex-direction: column;

  .bubble-content {
    padding: 0.75rem 1rem;
    border-radius: $bubble-radius;
    line-height: 1.7;
    font-size: 0.9375rem;
    word-wrap: break-word;
    box-shadow: $shadow-sm; // 轻微阴影，提升立体感
    transition: $transition;
    // 确保文本在气泡中可见
    color: $text-primary;
    background-color: #fff; // 默认背景色（机器人消息）

    // 用户消息样式覆盖
    .user-message & {
      background-color: $primary;
      color: #fff;
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
  }

  // ******** 核心修改：机器人气泡适配绿色系 ********
  .robot-message & .bubble-content {
    background-color: $bg-card;
    color: $text-primary;
    border: 1px solid $primary-light;
    border-bottom-left-radius: $radius-sm; // 分级圆角
  }

  // 气泡hover效果（和整体微交互统一）
  .bubble-content:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
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
</style>