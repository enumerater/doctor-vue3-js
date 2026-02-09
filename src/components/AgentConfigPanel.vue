<template>
  <div class="config-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>Agent 配置管理</h2>
      <van-icon
        name="close"
        size="24"
        class="close-btn"
        @click="closePanel"
      />
    </div>

    <!-- Tabs -->
    <van-tabs v-model:active="activeTab">
      <!-- 配置列表标签 -->
      <van-tab title="配置列表" name="list">
        <ConfigSelector />
      </van-tab>

      <!-- 编辑配置标签 -->
      <van-tab title="编辑配置" name="edit">
        <ConfigEditor />
      </van-tab>

      <!-- 新建配置标签 -->
      <van-tab title="新建配置" name="create">
        <ConfigCreator />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import ConfigSelector from './ConfigSelector.vue'
import ConfigEditor from './ConfigEditor.vue'
import ConfigCreator from './ConfigCreator.vue'

const agentConfigStore = useAgentConfigStore()
const activeTab = ref('list')

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

  :deep(.van-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;

    .van-tabs__nav {
      background: $bg-card;
      border-bottom: 1px solid $border;
    }

    .van-tabs__content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
  }
}
</style>
