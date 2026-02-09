<template>
  <div class="config-selector">
    <!-- Loading State -->
    <van-loading v-if="isLoading" size="24px" vertical>加载中...</van-loading>

    <!-- Error State -->
    <van-empty v-else-if="error" description="加载失败">
      <van-button round type="primary" class="retry-btn" @click="retry">
        重试
      </van-button>
    </van-empty>

    <!-- Config List -->
    <div v-else class="config-list">
      <div v-for="config in configList" :key="config.id" class="config-item" :class="{ active: config.isActive }"
        @click="selectConfig(config.id)">
        <div class="config-info">
          <div class="config-header">
            <h3 class="config-name">{{ config.name }}</h3>
            <van-tag v-if="config.isDefault" type="primary" size="small">
              默认
            </van-tag>
          </div>
          <p class="config-desc">{{ config.description }}</p>
        </div>

        <div class="config-actions" @click.stop>
          <van-icon name="edit" size="18" class="action-icon" @click="editConfig(config.id)" />
          <van-icon name="records" size="18" class="action-icon" @click="duplicateConfig(config.id)" />
          <van-icon v-if="!config.isDefault" name="delete-o" size="18" class="action-icon delete"
            @click="handleDelete(config.id)" />
          <van-icon v-if="!config.isDefault" name="star-o" size="18" class="action-icon"
            @click="setAsDefault(config.id)" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <van-empty v-if="!isLoading && !error && configList.length === 0" description="暂无配置">
      <van-button round type="primary" @click="createNew">
        创建第一个配置
      </van-button>
    </van-empty>

    <!-- Create Button -->
    <div v-if="configList.length > 0" class="create-btn-wrapper">
      <van-button block type="primary" icon="plus" @click="createNew">
        创建新配置
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { showConfirmDialog, showToast } from 'vant'

const agentConfigStore = useAgentConfigStore()

const configList = computed(() => agentConfigStore.configList)
const isLoading = computed(() => agentConfigStore.isLoading)
const error = computed(() => agentConfigStore.error)

const emit = defineEmits(['switch-tab'])

const selectConfig = (configId) => {
  agentConfigStore.switchConfig(configId)
  showToast({
    message: '配置已切换',
    position: 'top'
  })
}

const editConfig = (configId) => {
  agentConfigStore.setEditingConfig(configId)
  emit('switch-tab', 'edit')
}

const createNew = () => {
  agentConfigStore.clearEditingConfig()
  emit('switch-tab', 'create')
}

const handleDelete = async (configId) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '删除后无法恢复，确定要删除此配置吗？'
    })

    await agentConfigStore.deleteConfig(configId)
    showToast({
      message: '删除成功',
      position: 'top'
    })
  } catch (err) {
    // User cancelled
  }
}

const setAsDefault = async (configId) => {
  try {
    await agentConfigStore.setDefault(configId)
    showToast({
      message: '已设为默认配置',
      position: 'top'
    })
  } catch (err) {
    showToast({
      message: '设置失败',
      position: 'top'
    })
  }
}

const duplicateConfig = async (configId) => {
  try {
    await agentConfigStore.duplicate(configId)
    showToast({
      message: '配置已复制',
      position: 'top'
    })
  } catch (err) {
    showToast({
      message: '复制失败',
      position: 'top'
    })
  }
}

const retry = () => {
  agentConfigStore.fetchConfigs()
}
</script>

<style scoped lang="scss">
// 导入 Sass 官方 color 模块（解决命名空间问题，消除全局函数警告）
@use "sass:color";
// 保留原有变量导入
@use '@/styles/variables.scss' as *;

.config-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .config-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: $bg-card;
    border-radius: $radius-md;
    border: 2px solid transparent;
    cursor: pointer;
    transition: $transition;

    // 最终修正：使用命名空间写法 color.adjust，彻底消除所有警告
    &:hover {
      border-color: color.adjust($primary, $lightness: 30%);
    }

    &.active {
      border-color: $primary;
      background: $primary-light;
    }

    .config-info {
      flex: 1;
      min-width: 0;

      .config-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .config-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .config-desc {
        margin: 0;
        font-size: 14px;
        color: $text-secondary;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .config-actions {
      display: flex;
      gap: 12px;
      margin-left: 12px;

      .action-icon {
        color: $text-secondary;
        cursor: pointer;
        transition: $transition;

        &:hover {
          color: $primary;
        }

        &.delete:hover {
          color: #e53e3e;
        }
      }
    }
  }

  .create-btn-wrapper {
    margin-top: 8px;
  }

  .retry-btn {
    margin-top: 16px;
  }
}
</style>