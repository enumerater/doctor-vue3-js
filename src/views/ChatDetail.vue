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
// 全局穿透：禁用页面整体滚动（核心修复双滚动条）
:deep(html),
:deep(body) {
    overflow: hidden;
    margin: 0;
    padding: 0;
}

// 容器：适配父容器高度，移除100vh（核心修复）
.chat-detail-container {
    width: 100%;
    height: 100%; // 继承父容器（main-content）的高度，而非100vh
    box-sizing: border-box;
    padding: 16px;
    background-color: #f8f9fa;
    overflow: hidden; // 禁用容器本身滚动
    position: relative;
}

// 原生空状态样式（替代Vant Empty）
.empty-state {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .empty-icon {
        font-size: 60px;
        color: #ddd;
    }

    .empty-text {
        font-size: 14px;
        color: #999;
    }
}

// 消息列表：修复滚动 + 美化
.message-list {
    width: 100%;
    height: 100%;
    overflow-y: auto; // 仅内部滚动
    padding-bottom: 10px; // 底部留白
    scroll-behavior: smooth; // 平滑滚动

    // 美化滚动条（仅显示在列表内）
    &::-webkit-scrollbar {
        width: 4px; // 窄滚动条，更美观
    }

    &::-webkit-scrollbar-track {
        background: transparent; // 隐藏轨道
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 2px;

        &:hover {
            background-color: #bbb;
        }
    }
}

// 消息项：统一布局 + 间距（移除头像后调整间距）
.message-item {
    display: flex;
    margin-bottom: 20px;
    align-items: flex-start; // 气泡顶部对齐

    // 用户消息：右对齐
    &.user-message {
        justify-content: flex-end;
    }

    // 机器人消息：左对齐
    &.robot-message {
        justify-content: flex-start;
    }
}

// 消息气泡：核心美化（移除头像后调整边距）
.message-bubble {
    max-width: 70%; // 限制气泡宽度，避免过宽
    display: flex;
    flex-direction: column;

    .bubble-content {
        padding: 12px 16px;
        border-radius: 16px;
        line-height: 1.6;
        font-size: 15px;
        word-wrap: break-word;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); // 轻微阴影，提升立体感
    }

    .message-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
        align-self: flex-end; // 时间靠右
        padding: 0 8px;
    }

    // 用户气泡样式
    .user-message & .bubble-content {
        background-color: #4096ff;
        color: #fff;
        border-bottom-right-radius: 4px; // 分级圆角，更自然
    }

    // 机器人气泡样式
    .robot-message & .bubble-content {
        background-color: #fff;
        color: #333;
        border: 1px solid #eee;
        border-bottom-left-radius: 4px; // 分级圆角
    }

    // 气泡hover效果
    .bubble-content:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
    }
}

// 响应式适配：移动端优化
@media (max-width: 375px) {
    .chat-detail-container {
        padding: 10px;
    }

    .bubble-content {
        padding: 10px 14px;
        font-size: 14px;
    }

    .message-item {
        margin-bottom: 16px;
    }
}
</style>