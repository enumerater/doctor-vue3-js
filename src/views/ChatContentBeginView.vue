<template>
    <div class="chat-begin-container">
        <LogoSection class="logo-section" />
        <!-- 热门问题卡片增加样式类，优化视觉 -->
        <HotQuestionCard class="hot-question-card" />
    </div>
</template>

<script setup>
import LogoSection from '@/components/LogoSection.vue'
import HotQuestionCard from '@/components/HotQuestionCard.vue'
</script>

<style lang="scss" scoped>
// 统一主题变量（和主页/病害识别页保持一致）
$primary: #388e3c; // 主绿
$primary-light: #e8f5e9; // 浅绿背景
$primary-hover: #2e7d32; // 主绿hover
$secondary: #66bb6a; // 次要绿
$text-primary: #2d3748; // 主要文字
$text-secondary: #718096; // 次要文字
$bg-main: #f8f9fa; // 页面背景
$bg-card: #ffffff; // 卡片背景
$border: #e2e8f0; // 边框色
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05); // 轻阴影
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08); // 中阴影
$float-shadow: 0 6px 16px rgba(56, 142, 60, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04); // 卡片浮空阴影
$radius-sm: 8px; // 小圆角
$radius-md: 16px; // 中圆角
$radius-lg: 20px; // 大圆角
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); // 顺滑过渡

// 全局样式穿透
:deep(html),
:deep(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// 核心容器：统一风格 + 优化布局
.chat-begin-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    box-sizing: border-box;
    background-color: $bg-main;
    overflow: hidden;

    // 响应式适配
    @media (max-width: 375px) {
        padding: 0.9375rem;
        justify-content: center;
    }
}

// Logo区域样式：适配绿色系 + 优化排版
.logo-section {
    margin-bottom: 2.5rem;
    text-align: center;
    transition: $transition;

    // Logo图片适配
    :deep(img) {
        max-width: 11.25rem;
        height: auto;
        margin-bottom: 0.9375rem;
        filter: drop-shadow(0 2px 4px rgba(56, 142, 60, 0.1)); // 轻微阴影，提升质感
    }

    // Logo标题
    :deep(h1) {
        font-size: 1.5rem;
        color: $primary; // 主绿标题，强化主题
        font-weight: 600;
        margin: 0;
        letter-spacing: 0.5px; // 轻微字间距，更精致
    }

    // Logo副标题
    :deep(p) {
        font-size: 0.875rem;
        color: $text-secondary;
        margin-top: 0.5rem;
        line-height: 1.6;
    }
}

// 热门问题卡片：核心美化（浮空+渐变+阴影）
.hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    background: $bg-card;
    border-radius: $radius-md;
    // 浮空阴影：多层更有层次感
    box-shadow: $float-shadow;
    padding: 1.5rem;
    box-sizing: border-box;
    // 轻微上移，强化浮空感
    transform: translateY(-4px);
    transition: $transition;
    // 顶部渐变线条，和其他卡片统一
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, $primary, $secondary);
        border-radius: $radius-md $radius-md 0 0;
    }

    // hover时强化浮空效果
    &:hover {
        box-shadow: 0 8px 24px rgba(56, 142, 60, 0.12), 0 3px 6px rgba(0, 0, 0, 0.06);
        transform: translateY(-6px);
    }

    // 响应式适配
    @media (max-width: 375px) {
        padding: 1.25rem;
    }

    // 卡片标题
    :deep(.card-title) {
        font-size: 1.125rem;
        color: $text-primary;
        font-weight: 600;
        margin: 0 0 1rem 0;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid $primary-light; // 浅绿分割线，替代灰色
        display: flex;
        align-items: center;
        gap: 0.5rem;

        // 可自定义标题图标（可选）
        // &::before {
        //     content: '❓';
        //     font-size: 1.25rem;
        // }
    }

    // 问题列表
    :deep(.question-list) {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    // 问题项：核心美化（适配绿色系+微交互）
    :deep(.question-item) {
        padding: 1rem;
        background-color: $primary-light; // 浅绿背景，统一主题
        border-radius: $radius-sm;
        cursor: pointer;
        transition: $transition;
        font-size: 0.9375rem;
        color: $text-primary;
        line-height: 1.7;
        border: 1px solid transparent;

        // hover效果：强化+统一
        &:hover {
            background-color: #dcedc8; // 更深一点的浅绿
            color: $primary-hover;
            transform: translateY(-2px);
            box-shadow: $shadow-sm;
            border-color: rgba(56, 142, 60, 0.2); // 半透明绿边框
        }

        // 点击反馈
        &:active {
            transform: translateY(0);
            box-shadow: none;
        }
    }
}
</style>