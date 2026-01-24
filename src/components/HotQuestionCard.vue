<!-- 假设你的 HotQuestionCard.vue 结构 -->
<template>
    <div class="hot-question-card">
        <h3 class="card-title">热门农业问题</h3>
        <div class="question-list">
            <div class="question-item" v-for="question in hotQuestions" :key="question.id"
                @click="handleQuestionClick(question.content)">
                {{ question.content }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
// 热门问题数据（也可以抽离到单独的常量文件，进一步解耦）
const hotQuestions = [
    { id: 1, content: '小麦常见病虫害有哪些？' },
    { id: 2, content: '大棚蔬菜如何控温？' },
    { id: 3, content: '水稻施肥的最佳时期？' },
]

// 直接调用Store方法，无需emit
const handleQuestionClick = (question) => {
    chatStore.handleHotQuestionClick(question)
}
</script>

<style lang="scss" scoped>
/* 你的样式 */
.hot-question-card {
    width: 100%;
    max-width: 500px;
    margin-top: 20px;
}

.question-item {
    padding: 10px 15px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;

    &:hover {
        background: #e8f4f8;
    }
}
</style>