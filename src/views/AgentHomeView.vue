<template>
    <div class="agent-begin-container">
        <!-- 配置按钮 -->
        <div class="config-btn-wrapper animate-fadeInDown">
            <button class="config-btn" @click="openConfigPanel">
                Agent设置
            </button>
        </div>

        <LogoSection class="logo-section animate-scaleIn" title="Agent小农" subtitle="专业农业智能助手" altText="Agent小农" />
        <!-- Agent专用热门问题卡片 -->
        <AgentHotQuestionCard class="hot-question-card animate-fadeInUp delay-200" />

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
@use '@/styles/animations.scss';

// 核心容器：统一风格 + 优化布局
.agent-begin-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
    background: linear-gradient(180deg, $bg-main 0%, #f5faf7 100%);
    overflow: hidden;
    position: relative;
}

// 配置按钮包装
.config-btn-wrapper {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
}

.config-btn {
    padding: 0.625rem 1.25rem;
    background: white;
    border: 2px solid $primary;
    border-radius: $radius-md;
    color: $primary;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition-smooth;
    box-shadow: $shadow-sm;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, $primary, $secondary);
      transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover {
      color: white;
      border-color: transparent;
      transform: translateY(-2px);
      box-shadow: $shadow-md;

      &::before {
        left: 0;
      }
    }

    &:active {
      transform: translateY(0) scale(0.95);
    }
}

// Logo区域样式：适配绿色系 + 优化排版
.logo-section {
    margin-bottom: 3rem;
    text-align: center;
}

// Agent热门问题卡片：核心美化（浮空+渐变+阴影）
.hot-question-card {
    width: 100%;
    max-width: 31.25rem;
    background: white;
    border-radius: $radius-lg;
    box-shadow: $float-shadow;
    padding: 2rem;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, $primary, $secondary);
        border-radius: $radius-lg $radius-lg 0 0;
    }

    &:hover {
        box-shadow:
            0 12px 32px rgba(74, 155, 94, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.08);
        transform: translateY(-4px);
    }
}
</style>