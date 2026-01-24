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
// 全局样式穿透（解决父容器滚动/body默认样式问题）
:deep(html),
:deep(body) {
    margin: 0;
    padding: 0;
    overflow: hidden; // 禁用页面整体滚动
}

// 核心容器：彻底解决大小+滚动问题
.chat-begin-container {
    width: 100vw; // 占满视口宽度（替代100%，避免父元素影响）
    height: 100vh; // 占满视口高度（替代100%，彻底避免滚动）
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box; // 让padding包含在宽高内，避免溢出
    background-color: #f8f9fa; // 柔和背景色，提升质感
    overflow: hidden; // 强制禁用内部滚动

    // 响应式适配：小屏幕下减少padding
    @media (max-width: 375px) {
        padding: 15px;
    }
}

// Logo区域样式优化
.logo-section {
    margin-bottom: 40px; // 与卡片拉开间距，提升层次
    text-align: center; // 确保Logo/标题居中

    // 若Logo组件有图片/文字，补充适配
    :deep(img) {
        max-width: 180px; // 限制Logo大小，避免过大
        height: auto;
        margin-bottom: 15px;
    }

    :deep(h1) {
        font-size: 24px;
        color: #2d3748;
        font-weight: 600;
        margin: 0;
    }

    :deep(p) {
        font-size: 14px;
        color: #718096;
        margin-top: 8px;
    }
}

// 热门问题卡片样式优化
.hot-question-card {
    width: 100%;
    max-width: 500px; // 限制最大宽度，避免大屏拉伸
    background: #ffffff; // 白色卡片，对比背景
    border-radius: 16px; // 圆角更柔和
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); // 轻微阴影，提升立体感
    padding: 24px;
    box-sizing: border-box;

    // 响应式：小屏幕缩小内边距
    @media (max-width: 375px) {
        padding: 20px;
    }

    // 卡片标题样式
    :deep(.card-title) {
        font-size: 18px;
        color: #2d3748;
        font-weight: 600;
        margin: 0 0 16px 0;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0; // 分割线，提升层次
    }

    // 问题列表样式
    :deep(.question-list) {
        display: grid;
        grid-template-columns: 1fr; // 单列布局
        gap: 12px; // 问题项间距
    }

    // 问题项样式
    :deep(.question-item) {
        padding: 16px;
        background: #f8f9fa;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease; //  hover动画
        font-size: 15px;
        color: #4a5568;
        line-height: 1.5;

        // hover效果：轻微变色+抬升，提升交互感
        &:hover {
            background: #e8f4f8;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        // 点击反馈
        &:active {
            transform: translateY(0);
        }
    }
}
</style>