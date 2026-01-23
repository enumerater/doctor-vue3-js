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
import { computed } from 'vue'
const chatStore = useChatStore()
const messages = computed(() => chatStore.chatMessages)
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