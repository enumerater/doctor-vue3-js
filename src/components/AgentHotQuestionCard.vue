<template>
    <div class="agent-hot-question-card">
        <h3 class="card-title">Agent智能农业问题</h3>
        <div class="question-list">
            <div class="question-item" v-for="question in agentQuestions" :key="question.id"
                @click="handleQuestionClick(question.content)">
                {{ question.content }}
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
    { id: 1, content: '玉米锈病怎么治' },
    { id: 2, content: '玉米这是什么病怎么治疗' },
    { id: 3, content: '葡萄这是什么病怎么治疗' },
]

function handleQuestionClick(content) {
    // 设置输入内容
    chatStore.inputValue = content

    // // 跳转到主聊天页面进行处理
    // router.push({ name: 'AgentDetil', params: { sessionId: localStorage.getItem('id') + '' + chatStore.currentSessionId } })
}
</script>

<style lang="scss" scoped>
// 使用全局变量
@use '@/styles/variables.scss';

.agent-hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    background: variables.$bg-card;
    border-radius: variables.$radius-md;
    box-shadow: variables.$float-shadow;
    padding: 1.5rem;
    box-sizing: border-box;
    transform: translateY(-4px);
    transition: variables.$transition;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, variables.$primary, variables.$secondary);
        border-radius: variables.$radius-md variables.$radius-md 0 0;
    }

    &:hover {
        box-shadow:
            0 8px 24px rgba(56, 142, 60, 0.12),
            0 3px 6px rgba(0, 0, 0, 0.06);
        transform: translateY(-6px);
    }

    .card-title {
        font-size: 1.125rem;
        color: variables.$text-primary;
        font-weight: 600;
        margin: 0 0 1rem 0;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid variables.$primary-light;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .question-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .question-item {
        padding: 1rem;
        background-color: variables.$primary-light;
        border-radius: variables.$radius-sm;
        cursor: pointer;
        transition: variables.$transition;
        font-size: 0.9375rem;
        color: variables.$text-primary;
        line-height: 1.7;
        border: 1px solid transparent;

        &:hover {
            background-color: #dcedc8;
            color: variables.$primary-hover;
            transform: translateY(-2px);
            box-shadow: variables.$shadow-sm;
            border-color: rgba(56, 142, 60, 0.2);
        }

        &:active {
            transform: translateY(0);
            box-shadow: none;
        }
    }
}
</style>