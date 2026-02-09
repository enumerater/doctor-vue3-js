<template>
  <div class="config-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>Agent 设置</h2>
      <van-icon
        name="close"
        size="24"
        class="close-btn"
        @click="closePanel"
      />
    </div>

    <!-- 简化后的单页配置 -->
    <div class="config-content">
      <SimpleAgentConfig />
    </div>
  </div>
</template>

<script setup>
import { useAgentConfigStore } from '@/stores/agentConfig'
import SimpleAgentConfig from './SimpleAgentConfig.vue'

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

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
    }

    .close-btn {
      cursor: pointer;
      color: $text-secondary;
      transition: $transition;

      &:hover {
        color: $text-primary;
      }
    }
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}
</style>
