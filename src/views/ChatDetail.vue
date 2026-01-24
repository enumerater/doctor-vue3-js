<template>
    <div class="chat-detail-container">
        <!-- 聊天消息列表 -->
        <div class="message-list" ref="messageList">
            <!-- 遍历所有消息（用msg.id做key，避免index问题） -->
            <div v-for="(msg, index) in messages" :key="msg.id || index"
                :class="['message-item', msg.messageRole === '0' ? 'user' : 'robot']">
                <!-- 消息气泡：把msg.content改成msg.messageContent -->
                <div class="message-bubble">
                    {{ msg.messageContent }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import { computed, watch, onMounted } from 'vue'
// 新增：引入路由相关API
import { useRoute } from 'vue-router'

const chatStore = useChatStore()
// 新增：获取当前路由对象
const route = useRoute()
const messages = computed(() => chatStore.chatMessages)

// 新增核心逻辑：加载历史消息（封装成函数复用）
const loadHistoryMessages = async () => {
    // 从路由参数中获取sessionId
    const sessionId = route.params.sessionId
    if (!sessionId) return // 无sessionId时不执行

    // 同步当前会话ID + 加载历史消息
    chatStore.setCurrentSessionId(sessionId)
    await chatStore.fetchMessages(sessionId)

    // 可选：如果需要滚动到消息底部，可在这里添加滚动逻辑
    // const messageList = ref(null) // 需在template中绑定ref="messageList"
    // if (messageList.value) {
    //   messageList.value.scrollTop = messageList.value.scrollHeight
    // }
}

// 新增：组件挂载时加载一次（直接访问链接触发）
onMounted(() => {
    loadHistoryMessages()
})

// 新增：监听路由参数变化（比如从其他会话跳转过来时触发）
watch(
    () => route.params.sessionId,
    () => {
        loadHistoryMessages()
    },
    { immediate: true } // 立即执行一次（和onMounted效果叠加，双重保障）
)
</script>

<!-- 样式保持不变（因为class还是user/robot，和原来一致） -->
<style lang="scss" scoped>
.chat-detail-container {
    width: 100%;
    height: 100vh;
    padding: 10px 16px;
    box-sizing: border-box;
    overflow: hidden;
}

.message-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background-color: #f8f9fa;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }
}

.message-item {
    display: flex;
    margin-bottom: 16px;
    width: 100%;

    &.user {
        justify-content: flex-end;
    }

    &.robot {
        justify-content: flex-start;
    }
}

.message-bubble {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 12px;
    line-height: 1.5;
    font-size: 14px;
    word-wrap: break-word;
    color: #333;
    background-color: #fff;

    .message-item.user & {
        background-color: #4096ff;
        color: #fff;
        border-bottom-right-radius: 4px;
    }

    .message-item.robot & {
        background-color: #fff;
        border: 1px solid #eee;
        border-bottom-left-radius: 4px;
    }
}
</style>