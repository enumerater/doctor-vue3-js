<template>
    <div class="agent-hot-question-card">
        <h3 class="card-title">
            <span class="title-accent"></span>
            热门问题
        </h3>
        <div class="question-list">
            <div class="question-item" v-for="(question, index) in agentQuestions" :key="question.id"
                :style="{ animationDelay: `${index * 0.1}s` }" @click="handleQuestionClick(question.content)">
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-text">{{ question.content }}</span>
                <span class="question-arrow">→</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()
const router = useRouter()

// Agent专用的复杂问题列表
const agentQuestions = [
    { id: 1, content: '今天天气怎么样' },
    { id: 2, content: '看看我的诊断历史' },
    { id: 3, content: '玉米锈病' },
]

function handleQuestionClick(content) {
    // 设置输入内容
    chatStore.inputValue = content

    // // 跳转到主聊天页面进行处理
    // router.push({ name: 'AgentDetil', params: { sessionId: localStorage.getItem('id') + '' + chatStore.currentSessionId } })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.agent-hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    margin-top: 0;

    .card-title {
        font-size: 1.25rem;
        color: $text-primary;
        font-weight: 600;
        margin: 0 0 1.5rem 0;
        padding-bottom: 1rem;
        border-bottom: 2px solid $primary-light;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        position: relative;

        .title-accent {
            width: 4px;
            height: 24px;
            background: linear-gradient(180deg, $primary, $secondary);
            border-radius: 2px;
            animation: breathe 2s ease-in-out infinite;
        }
    }

    .question-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .question-item {
        padding: 1.25rem 1.5rem;
        background: linear-gradient(135deg, $bg-card 0%, $primary-light 100%);
        border-radius: $radius-md;
        cursor: pointer;
        transition: $transition-smooth;
        font-size: 0.9375rem;
        color: $text-primary;
        line-height: 1.6;
        border: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
        overflow: hidden;
        animation: slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
            background: linear-gradient(90deg, rgba($primary, 0.1), transparent);
            transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .question-number {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: $primary;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
            transition: $transition-fast;
        }

        .question-text {
            flex: 1;
            transition: $transition-fast;
        }

        .question-arrow {
            flex-shrink: 0;
            font-size: 1.25rem;
            color: $primary;
            opacity: 0;
            transform: translateX(-10px);
            transition: $transition-smooth;
        }

        &:hover {
            background: white;
            transform: translateX(8px);
            box-shadow: $shadow-md;
            border-color: $primary;

            &::before {
                width: 100%;
            }

            .question-number {
                transform: rotate(360deg) scale(1.1);
                background: $secondary;
            }

            .question-text {
                color: $primary-hover;
                font-weight: 500;
            }

            .question-arrow {
                opacity: 1;
                transform: translateX(0);
            }
        }

        &:active {
            transform: translateX(4px) scale(0.98);
        }
    }
}
</style>