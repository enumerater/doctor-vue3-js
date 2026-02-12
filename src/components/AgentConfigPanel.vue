<template>
  <div class="config-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <h2>Agent 设置</h2>
      </div>
      <van-icon name="close" size="24" class="close-btn" @click="closePanel" />
    </div>

    <!-- 简化后的单页配置 -->
    <div class="config-content">
      <SimpleAgentConfigDrag />
    </div>
  </div>
</template>

<script setup>
import { useAgentConfigStore } from '@/stores/agentConfig'
import SimpleAgentConfigDrag from './SimpleAgentConfigDrag.vue'
const agentConfigStore = useAgentConfigStore()

const closePanel = () => {
  agentConfigStore.closeConfigPanel()
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.config-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg-main;
  overflow-y: auto;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid $border;
    background: $bg-card;
    position: sticky;
    top: 0;
    z-index: 10;

    @media (max-width: 768px) {
      padding: 14px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;

        @media (max-width: 768px) {
          font-size: 16px;
        }
      }

      .mode-switch {
        flex-shrink: 0;
      }

      .mode-label {
        font-size: 13px;
        color: $text-secondary;
        font-weight: 500;

        @media (max-width: 768px) {
          font-size: 12px;
        }
      }
    }

    .close-btn {
      cursor: pointer;
      color: $text-secondary;
      transition: $transition;

      @media (max-width: 768px) {
        font-size: 22px;
      }

      &:hover {
        color: $text-primary;
      }
    }
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    @media (max-width: 768px) {
      padding: 12px;
    }
  }
}
</style>