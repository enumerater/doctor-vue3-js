<template>
    <div class="chat-detail-container">
        <!-- 聊天消息列表 -->
        <div class="message-list" ref="messageList">
            <!-- 遍历全局Store中的消息 -->
            <div v-for="(msg, index) in chatStore.chatMessages" :key="index" :class="['message-item', msg.type]">
                <!-- 消息气泡 -->
                <div class="message-bubble">
                    {{ msg.content }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router' // 引入路由钩子
import { useChatStore } from '@/stores/chat' // 引入chatStore

// 获取路由实例和Store实例
const route = useRoute()
const chatStore = useChatStore()

// 消息列表容器引用（用于自动滚动到底部）
const messageList = ref(null)

// 滚动到底部逻辑（保持不变）
const scrollToBottom = () => {
    if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
    }
}

// 监听Store中的消息变化（核心：替代props监听）
watch(
    () => chatStore.chatMessages,
    () => {
        nextTick(() => scrollToBottom())
    },
    { deep: true }
)

// 监听路由参数变化（如果用户手动修改URL，也能重新加载数据）
watch(
    () => route.params.sessionId,
    (newSessionId) => {
        if (newSessionId) {
            chatStore.setCurrentSessionId(newSessionId)
            chatStore.fetchMessages(newSessionId)
        }
    },
    { immediate: true }
)

// 组件挂载时滚动到底部
onMounted(() => {
    scrollToBottom()
})
</script>

<style lang="scss" scoped>
// 容器整体样式
.chat-detail-container {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    box-sizing: border-box;
}

// 消息列表（可滚动）
.message-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    // 隐藏滚动条（可选，美化样式）
    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 2px;
    }
}

// 单个消息项
.message-item {
    display: flex;
    margin-bottom: 16px;

    // 用户消息（右对齐）
    &.user {
        justify-content: flex-end;
    }

    // 机器人消息（左对齐）
    &.robot {
        justify-content: flex-start;
    }
}

// 消息气泡核心样式
.message-bubble {
    max-width: 75%; // 气泡最大宽度，避免过长
    padding: 10px 14px;
    border-radius: 12px;
    line-height: 1.5;
    font-size: 14px;
    word-wrap: break-word; // 自动换行

    // 用户气泡样式
    .user & {
        background-color: #4096ff;
        color: #fff;
        // 右侧气泡圆角调整（更符合交互习惯）
        border-bottom-right-radius: 4px;
    }

    // 机器人气泡样式
    .robot & {
        background-color: #fff;
        color: #333;
        border: 1px solid #eee;
        // 左侧气泡圆角调整
        border-bottom-left-radius: 4px;
    }
}
</style>
