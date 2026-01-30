<template>
    <div class="chat-detail-container">
        <div class="empty-state" v-if="messages.length === 0">
            <div class="empty-icon">🌿</div>
            <div class="empty-text">我是您的农业AI助手，请描述您遇到的作物问题</div>
        </div>

        <div class="message-list" ref="messageList">
            <div v-for="(msg, index) in messages" :key="msg.id || index"
                :class="['message-item', msg.messageRole === '0' ? 'user-message' : 'robot-message']">

                <div v-if="msg.messageRole === '0'" class="message-bubble user-bubble">
                    <div class="bubble-content">{{ msg.messageContent }}</div>
                    <div class="message-time">{{ formatTime(msg.messageTime) }}</div>
                </div>

                <div v-else class="agent-chain-wrapper">
                    <div class="chain-timeline">
                        <div v-for="(step, sIdx) in msg.steps" :key="sIdx"
                            :class="['step-node', `type-${step.type}`, { 'is-processing': step.status === 'processing' }]">

                            <div v-if="step.type === 'status'" class="status-line">
                                <div class="node-dot"></div>
                                <div class="status-text">{{ step.content }}</div>
                                <div class="loading-spinner" v-if="step.status === 'processing'"></div>
                            </div>

                            <div v-else class="data-card">
                                <div class="card-header">
                                    <span class="card-icon">{{ getStepConfig(step.type).icon }}</span>
                                    <span class="card-title">{{ getStepConfig(step.type).title }}</span>
                                </div>
                                <div class="card-body markdown-body" v-html="parseMarkdown(step.content)"></div>
                            </div>
                        </div>
                    </div>
                    <div class="message-time agent-time">{{ formatTime(msg.messageTime) }}</div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'

const chatStore = useChatStore()
const messageList = ref(null)

const messages = computed(() => chatStore.chatMessages)

// 配置不同类型的 UI 表现
const getStepConfig = (type) => {
    const configs = {
        // 思考结果
        think: { title: '思考汇总结果', icon: '💡', color: '#059669' },

        img_find: { title: '多模态分析结果', icon: '📷', color: '#059669' },
        safe_notice: { title: '安全防护要求', icon: '🛡️', color: '#F59E0B' },
        pesticide: { title: '精准用药方案', icon: '💊', color: '#10B981' },
        field_manage: { title: '田间管理建议', icon: '🚜', color: '#3B82F6' },
        final_result: { title: '诊断总结报告', icon: '📋', color: '#059669' },
        default: { title: '分析结果', icon: '✨', color: '#6B7280' }
    }
    return configs[type] || configs.default
}

// Markdown & 时间 逻辑
const parseMarkdown = (content) => content ? marked.parse(content) : ''
const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 自动滚动
const scrollToBottom = () => {
    if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
    }
}
watch(() => messages.value, () => nextTick(scrollToBottom), { deep: true })
</script>

<style lang="scss" scoped>
// 变量定义
$primary-green: #059669;
$border-light: rgba(5, 150, 105, 0.1);
$bg-light: #f9fafb;

.chat-detail-container {
    height: 100%;
    background-color: #f4f7f6;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.message-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 10px;
    }
}

.message-item {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
}

/* 用户气泡样式 */
.user-message {
    align-items: flex-end;

    .user-bubble {
        background: linear-gradient(135deg, $primary-green, #10b981);
        color: white;
        padding: 0.8rem 1.2rem;
        border-radius: 1.2rem 1.2rem 0.2rem 1.2rem;
        max-width: 80%;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
}

/* 机器人 Agent 链式样式 */
.agent-chain-wrapper {
    align-self: flex-start;
    width: 90%;
    max-width: 600px;

    .chain-timeline {
        position: relative;
        padding-left: 1.5rem;
        border-left: 2px dashed rgba($primary-green, 0.2);
        margin-left: 0.5rem;
    }
}

.step-node {
    position: relative;
    margin-bottom: 1rem;

    // 状态行样式
    .status-line {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: #6b7280;

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
        }
    }

    // 卡片样式
    .data-card {
        background: white;
        border-radius: 12px;
        border: 1px solid $border-light;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        transition: transform 0.2s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .card-header {
            padding: 8px 12px;
            background: rgba($primary-green, 0.03);
            border-bottom: 1px solid $border-light;
            display: flex;
            align-items: center;
            gap: 8px;

            .card-title {
                font-size: 0.9rem;
                font-weight: 600;
                color: #374151;
            }
        }

        .card-body {
            padding: 12px;
            font-size: 0.93rem;
            line-height: 1.6;
            color: #1f2937;
        }
    }
}

/* 针对最终结果的特殊处理 */
.type-final_result {
    .data-card {
        border: 1.5px solid rgba($primary-green, 0.4);

        .card-header {
            background: rgba($primary-green, 0.08);
        }
    }
}

/* 加载动画 */
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

.message-time {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.5rem;
}
</style>