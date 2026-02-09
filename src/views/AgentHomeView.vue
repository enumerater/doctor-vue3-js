<template>
    <div class="agent-begin-container">
        <!-- 配置按钮 -->
        <div class="config-btn-wrapper">
            <van-button
                round
                plain
                type="primary"
                icon="setting-o"
                size="small"
                @click="openConfigPanel"
            >
                Agent设置
            </van-button>
        </div>

        <LogoSection class="logo-section" title="Agent小农" subtitle="专业农业智能助手" altText="Agent小农" />
        <!-- Agent专用热门问题卡片 -->
        <AgentHotQuestionCard class="hot-question-card" />

        <!-- 配置面板弹窗 -->
        <van-popup
            v-model:show="showConfigPanel"
            position="right"
            :style="{ width: '85%', height: '100%' }"
        >
            <AgentConfigPanel />
        </van-popup>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import LogoSection from '@/components/LogoSection.vue'
import AgentHotQuestionCard from '@/components/AgentHotQuestionCard.vue'
import AgentConfigPanel from '@/components/AgentConfigPanel.vue'
import { useAgentConfigStore } from '@/stores/agentConfig'

const agentConfigStore = useAgentConfigStore()

const showConfigPanel = computed({
    get() {
        return agentConfigStore.showConfigPanel
    },
    set(value) {
        if (value) {
            agentConfigStore.openConfigPanel()
        } else {
            agentConfigStore.closeConfigPanel()
        }
    }
})

const openConfigPanel = () => {
    agentConfigStore.openConfigPanel()
}
</script>

<style lang="scss" scoped>
// 使用 @/styles/variables.scss 全局变量

// 核心容器：统一风格 + 优化布局
.agent-begin-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    box-sizing: border-box;
    background-color: $bg-main;
    overflow: hidden;
    position: relative;
}

// 配置按钮包装
.config-btn-wrapper {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;

    :deep(.van-button) {
        font-size: 12px;
    }
}

// Logo区域样式：适配绿色系 + 优化排版
.logo-section {
    margin-bottom: 2.5rem;
    text-align: center;
    transition: $transition;
}

// Agent热门问题卡片：核心美化（浮空+渐变+阴影）
.hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    background: $bg-card;
    border-radius: $radius-md;
    box-shadow: $float-shadow;
    padding: 1.5rem;
    box-sizing: border-box;
    transform: translateY(-4px);
    transition: $transition;
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

    &:hover {
        box-shadow:
            0 8px 24px rgba(56, 142, 60, 0.12),
            0 3px 6px rgba(0, 0, 0, 0.06);
        transform: translateY(-6px);
    }
}
</style>