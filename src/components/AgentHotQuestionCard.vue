<template>
    <div class="agent-hot-question-card">
        <!-- 能力提示区 -->
        <div class="capability-section">
            <p class="capability-desc">不只是对话，我会思考、调用工具、多步推理，为您提供专业分析</p>
            <div class="capability-tags">
                <span class="cap-tag" v-for="cap in capabilities" :key="cap.label">
                    <span class="cap-icon">{{ cap.icon }}</span>
                    {{ cap.label }}
                </span>
            </div>
        </div>

        <h3 class="card-title">
            <span class="title-accent"></span>
            试试这样问我
        </h3>
        <div class="question-list">
            <div class="question-item" v-for="(question, index) in agentQuestions" :key="question.id"
                :style="{ animationDelay: `${index * 0.1}s` }" @click="handleQuestionClick(question.content)">
                <span class="question-number">{{ index + 1 }}</span>
                <div class="question-body">
                    <span class="question-text">{{ question.content }}</span>
                    <span class="question-hint">{{ question.hint }}</span>
                </div>
                <span class="question-arrow">→</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// Agent能力标签
const capabilities = [
    { icon: '🖼️', label: '多模态识别' },
    { icon: '🔍', label: '知识库检索' },
    { icon: '🌤️', label: '实时天气' },
    { icon: '🌾', label: '田间管理' },
    { icon: '🌐', label: '联网搜索' },
    { icon: '🧠', label: '深度推理' },
]

// Agent专用的复杂问题列表
const agentQuestions = [
    { id: 1, content: '今天天气怎么样，适合给小麦打药吗', hint: '查天气 + 农事建议' },
    { id: 2, content: '帮我看看田地管理情况', hint: '田间管理工具' },
    { id: 3, content: '玉米叶片发黄是什么原因，怎么治', hint: '知识库 + 用药方案' },
    { id: 4, content: '上传一张照片帮我诊断病害', hint: '图片识别 + 深度分析' },
]

function handleQuestionClick(content) {
    chatStore.inputValue = content
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

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.agent-hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    margin-top: 0;

    .capability-section {
        margin-bottom: 1.5rem;
        animation: fadeInUp 0.6s ease both;

        @include mobile {
            margin-bottom: 1rem;
        }

        .capability-desc {
            font-size: 0.8125rem;
            color: $text-secondary;
            margin: 0 0 0.75rem 0;
            line-height: 1.6;

            @include mobile {
                font-size: 0.75rem;
                margin-bottom: 0.5rem;
            }
        }

        .capability-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            @include mobile {
                gap: 0.375rem;
            }
        }

        .cap-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.625rem;
            background: $primary-light;
            color: $primary-hover;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
            border: 1px solid rgba($primary, 0.15);
            transition: $transition-fast;

            @include mobile {
                padding: 0.2rem 0.5rem;
                font-size: 0.6875rem;
            }

            .cap-icon {
                font-size: 0.8125rem;
                line-height: 1;
            }

            &:hover {
                background: rgba($primary, 0.15);
                border-color: rgba($primary, 0.3);
            }
        }
    }

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

        @include mobile {
            font-size: 1.05rem;
            margin: 0 0 1rem 0;
            padding-bottom: 0.75rem;
        }

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

        @include mobile {
            gap: 0.6rem;
        }
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

        @include mobile {
            padding: 0.75rem 0.9rem;
            font-size: 0.85rem;
            gap: 0.75rem;
            border-radius: $radius-sm;
        }

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

        .question-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            transition: $transition-fast;
        }

        .question-text {
            transition: $transition-fast;
        }

        .question-hint {
            font-size: 0.6875rem;
            color: $text-tertiary;
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

            .question-hint {
                color: $text-secondary;
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
