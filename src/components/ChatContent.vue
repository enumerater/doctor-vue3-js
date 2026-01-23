<template>
    <div class="chat-content" ref="chatContentRef">
        <div class="empty-tip" v-if="messages.length === 0">发送问题后，对话内容将显示在这里</div>
        <div class="message-item" v-for="(msg, index) in messages" :key="index"
            :class="msg.type === 'user' ? 'user-message' : 'robot-message'">
            <div class="message-bubble" :class="msg.type === 'user' ? 'user-bubble' : 'robot-bubble'">
                {{ msg.content }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, nextTick } from 'vue'

const props = defineProps({
    messages: {
        type: Array,
        default: () => [],
    },
})

const chatContentRef = ref(null)
watch(
    () => props.messages,
    () => {
        nextTick(() => {
            if (chatContentRef.value) {
                chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
            }
        })
    },
    { deep: true },
)
</script>

<style lang="scss" scoped>
.chat-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #f5f7fa;

    .empty-tip {
        text-align: center;
        color: #999;
        font-size: 14px;
        padding: 40px 0;
    }

    .message-item {
        display: flex;
        margin-bottom: 16px;
        max-width: 85%;

        &.user-message {
            margin-left: auto;
            flex-direction: row-reverse;
        }

        &.robot-message {
            margin-right: auto;
            flex-direction: row;
        }

        .message-bubble {
            padding: 10px 14px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;

            &.user-bubble {
                background-color: #34c759;
                color: #fff;
                border-bottom-right-radius: 4px;
            }

            &.robot-bubble {
                background-color: #fff;
                color: #333;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        }
    }
}
</style>
