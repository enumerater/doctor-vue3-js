<template>
  <div class="config-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <h2>Agent 设置</h2>
        <van-switch
          v-model="useDragMode"
          size="20"
          active-color="#07c160"
          class="mode-switch"
        />
        <span class="mode-label">{{ useDragMode ? '🎯 拖拽模式' : '📋 列表模式' }}</span>
      </div>
      <van-icon
        name="close"
        size="24"
        class="close-btn"
        @click="closePanel"
      />
    </div>

    <!-- 简化后的单页配置 -->
    <div class="config-content">
      <SimpleAgentConfigDrag v-if="useDragMode" />
      <SimpleAgentConfig v-else />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import SimpleAgentConfig from './SimpleAgentConfig.vue'
import SimpleAgentConfigDrag from './SimpleAgentConfigDrag.vue'

const agentConfigStore = useAgentConfigStore()
const useDragMode = ref(true) // 默认使用拖拽模式

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

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
      }

      .mode-switch {
        flex-shrink: 0;
      }

      .mode-label {
        font-size: 13px;
        color: $text-secondary;
        font-weight: 500;
      }
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
