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
                'robot-message': msg.messageRole === '1'
            }">
                <!-- 移除所有头像相关代码 -->

                <!-- 消息气泡：美化样式 + 自适应宽度 -->
                <div class="message-bubble">
                    <div class="bubble-content">{{ msg.messageContent }}</div>
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

// 移除VanEmpty导入（彻底不用Vant）
const chatStore = useChatStore()
const route = useRoute()
const messageList = ref(null) // 消息列表ref：用于自动滚动到底部

// 计算属性：获取聊天消息
const messages = computed(() => chatStore.chatMessages)

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

// 加载历史消息
const loadHistoryMessages = async () => {
    const sessionId = route.params.sessionId
    if (!sessionId) return

    chatStore.setCurrentSessionId(sessionId)
    await chatStore.fetchMessages(sessionId)

    // 加载完成后滚动到底部
    nextTick(() => scrollToBottom())
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
    }
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
    { immediate: true }
)
</script>

<style lang="scss" scoped>
// 统一主题变量（和主页/病害识别页保持一致）
$primary: #388e3c; // 主绿
$primary-light: #e8f5e9; // 浅绿背景
$primary-hover: #2e7d32; // 主绿hover
$secondary: #66bb6a; // 次要绿
$text-primary: #2d3748; // 主要文字
$text-secondary: #718096; // 次要文字
$bg-main: #f8f9fa; // 页面背景
$bg-card: #ffffff; // 卡片背景
$border: #e2e8f0; // 边框色
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05); // 轻阴影
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08); // 中阴影
$radius-sm: 8px; // 小圆角
$radius-md: 16px; // 中圆角（气泡主圆角）
$radius-lg: 20px; // 大圆角
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); // 顺滑过渡

// 全局穿透：禁用页面整体滚动（核心修复双滚动条）
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
        border-radius: $radius-md;
        line-height: 1.7;
        font-size: 0.9375rem;
        word-wrap: break-word;
        box-shadow: $shadow-sm; // 轻微阴影，提升立体感
        transition: $transition;
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
        font-size: 0.875rem;
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