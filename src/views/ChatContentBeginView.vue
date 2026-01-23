<template>
    <div>
        <LogoSection />
        <HotQuestionCard @question-click="handleQuestionSelect" />
    </div>
</template>

<script setup>
import LogoSection from '@/components/LogoSection.vue'
import HotQuestionCard from '@/components/HotQuestionCard.vue'
// 定义事件发射，向父组件传递选中的问题
const emit = defineEmits(['question-click'])
// 处理热门问题点击事件
const handleQuestionSelect = (question) => {
    emit('question-click', question)
}
</script>

<style lang="scss" scoped></style>
