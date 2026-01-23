<template>
    <div class="question-card" border="false">
        <div class="card-header">
            <span class="card-title">精选问题</span>
            <span class="card-date">01.16</span>
        </div>
        <div class="question-list">
            <div class="question-item" v-for="(item, index) in hotQuestions" :key="index"
                @click="handleQuestionClick(item)">
                {{ index + 1 }}. {{ item }}
            </div>
        </div>
        <van-button icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/f5f85af5-f362-44f3-95a1-9a6192be36ef.png"
            type="default" class="refresh-btn" @click="refreshQuestions">
            换一换
        </van-button>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// 定义事件发射，向父组件传递选中的问题
const emit = defineEmits(['question-click'])

// 备用问题池（组件内部维护，如需外部配置可改为props）
const questionPool = [
    '如何防治番茄晚疫病？',
    '小麦倒伏后如何补救？',
    '大棚蔬菜如何提高坐果率？',
    '如何辨别果树缺素症状？',
    '玉米螟的最佳防治时期是什么时候？',
]

// 接收父组件传入的初始问题（增强灵活性）
const props = defineProps({
    initialQuestions: {
        type: Array,
        default: () => [
            '如何预防农药抗药性的产生？',
            '如何识别假劣农药？',
            '农药使用后的包装如何处理？',
        ],
    },
})

// 精选问题列表
const hotQuestions = ref([...props.initialQuestions])

// 点击问题时向父组件传递选中的内容
const handleQuestionClick = (question) => {
    emit('question-click', question)
}

// 刷新精选问题逻辑
const refreshQuestions = () => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random())
    hotQuestions.value = shuffled.slice(0, 3)
}
</script>

<style lang="scss" scoped>
.question-card {
    margin: 8px 16px 16px;
    border-radius: 12px;
    padding: 16px;
    background-color: #fff;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        .card-date {
            font-size: 12px;
            color: #999;
        }
    }

    .question-list {
        margin-bottom: 16px;

        .question-item {
            padding: 10px 0;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }

            &:active {
                background-color: #f5f7fa;
            }
        }
    }

    .refresh-btn {
        display: block;
        margin: 0 auto;
        font-size: 14px;
        color: #666;
        padding: 4px 16px;
    }
}
</style>
