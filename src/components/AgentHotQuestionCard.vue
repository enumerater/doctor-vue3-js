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
    { id: 1, content: '基于我上周上传的小麦田图像，分析当前生长阶段并提供病虫害防治方案' },
    { id: 2, content: '结合近7天的气象数据和土壤监测报告，为我的草莓大棚制定精准灌溉和施肥计划' },
    { id: 3, content: '分析我农场近3年的作物产量数据，识别影响产量的关键因素并提供优化建议' },
    { id: 4, content: '根据我上传的番茄叶片图片，诊断病害类型并生成完整的治疗方案' },
    { id: 5, content: '为我的20亩有机水稻田制定从播种到收获的全周期智能管理方案' },
    { id: 6, content: '结合市场价格趋势和我的种植条件，推荐最具经济效益的作物轮作模式' },
]

function handleQuestionClick(content) {
    // 设置输入内容
    chatStore.inputValue = content

    // 跳转到主聊天页面进行处理
    router.push({ name: 'chatBegin' })
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