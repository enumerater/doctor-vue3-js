<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '70%' }" @close="onClose">
    <div class="config-manager">
      <!-- 头部 -->
      <div class="manager-header">
        <h3>配置管理</h3>
        <van-icon name="cross" size="20" @click="onClose" />
      </div>

      <!-- 配置列表 -->
      <div class="config-list">
        <van-cell v-for="config in configs" :key="config.id" :title="config.name"
          :label="config.description || getConfigLabel(config)" :class="{ active: config.id === currentConfigId }">
          <template #icon>
            <van-icon :name="config.isDefault ? 'star' : 'star-o'" :color="config.isDefault ? '#ffd700' : '#c8c9cc'"
              size="18" />
          </template>
          <template #right-icon>
            <div class="config-actions">
              <van-button v-if="config.id !== currentConfigId" size="small" type="primary" plain
                @click="onSwitch(config)">
                切换
              </van-button>
              <van-button size="small" icon="edit" @click="onRename(config)" />
              <van-button size="small" icon="replay" @click="onDuplicate(config)" />
              <van-button v-if="configs.length > 1" size="small" icon="delete-o" @click="onDelete(config)" />
            </div>
          </template>
        </van-cell>
      </div>

      <!-- 新建配置按钮 -->
      <div class="manager-footer">
        <van-button block type="primary" icon="plus" @click="onCreate">
          新建配置
        </van-button>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <van-dialog v-model:show="showRenameDialog" title="重命名配置" show-cancel-button @confirm="confirmRename">
      <van-field v-model="renameValue" placeholder="请输入配置名称" maxlength="20" show-word-limit />
    </van-dialog>

    <!-- 新建配置对话框 -->
    <van-dialog v-model:show="showCreateDialog" title="新建配置" show-cancel-button @confirm="confirmCreate">
      <div class="create-dialog">
        <van-field v-model="createData.name" label="配置名称" placeholder="例如：玉米专用配置" maxlength="20" show-word-limit />
        <van-field v-model="createData.description" label="配置说明" type="textarea" placeholder="简单描述这个配置的用途（可选）" rows="2"
          maxlength="100" show-word-limit />
      </div>
    </van-dialog>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { showToast, showConfirmDialog } from 'vant'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'config-changed'])

const agentConfigStore = useAgentConfigStore()

const visible = ref(props.show)
const showRenameDialog = ref(false)
const showCreateDialog = ref(false)
const renameValue = ref('')
const renamingConfigId = ref("")

const createData = ref({
  name: '',
  description: ''
})

// 监听props变化
watch(() => props.show, (newVal) => {
  visible.value = newVal
})

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:show', newVal)
})

// 配置列表
const configs = computed(() => agentConfigStore.configs)

// 当前配置ID
const currentConfigId = computed(() => agentConfigStore.currentConfigId)

// 获取配置标签
const getConfigLabel = (config) => {
  const parts = []
  if (config.cropTypes?.length > 0) {
    parts.push(`作物：${config.cropTypes.length}种`)
  }
  if (config.province && config.city) {
    parts.push(`${config.province} ${config.city}`)
  }
  return parts.join(' | ') || '未配置'
}

// 关闭弹窗
const onClose = () => {
  visible.value = false
}

// 切换配置
const onSwitch = async (config) => {
  try {
    await agentConfigStore.switchConfig(config.id)
    showToast({
      message: `已切换到「${config.name}」`,
      position: 'top'
    })
    emit('config-changed')
  } catch (err) {
    showToast({
      message: '切换失败，请重试',
      position: 'top'
    })
  }
}

// 重命名配置
const onRename = (config) => {
  renamingConfigId.value = config.id
  renameValue.value = config.name
  showRenameDialog.value = true

  console.log('onRename========', renamingConfigId.value)
  console.log('onRename========', renameValue.value)
}

const confirmRename = async () => {
  if (!renameValue.value.trim()) {
    showToast({
      message: '请输入配置名称',
      position: 'top'
    })
    return
  }

  try {
    await agentConfigStore.rename(renamingConfigId.value,
      renameValue.value.trim()
    )
    showToast({
      message: '重命名成功',
      position: 'top'
    })
    emit('config-changed')
  } catch (err) {
    showToast({
      message: '重命名失败，请重试',
      position: 'top'
    })
  }
}

// 复制配置
const onDuplicate = async (config) => {
  try {
    const newConfig = await agentConfigStore.duplicate(config.id)
    showToast({
      message: `已创建「${newConfig.name}」`,
      position: 'top'
    })
    emit('config-changed')
  } catch (err) {
    showToast({
      message: '复制失败，请重试',
      position: 'top'
    })
  }
}

// 删除配置
const onDelete = async (config) => {
  if (configs.value.length <= 1) {
    showToast({
      message: '至少保留一个配置',
      position: 'top'
    })
    return
  }

  try {
    await showConfirmDialog({
      title: '删除配置',
      message: `确定要删除「${config.name}」吗？此操作不可恢复。`
    })

    await agentConfigStore.deleteConfig(config.id)
    showToast({
      message: '删除成功',
      position: 'top'
    })
    emit('config-changed')
  } catch (err) {
    // 用户取消或删除失败
    if (err !== 'cancel') {
      showToast({
        message: '删除失败，请重试',
        position: 'top'
      })
    }
  }
}

// 新建配置
const onCreate = () => {
  createData.value = {
    name: '',
    description: ''
  }
  showCreateDialog.value = true
}

const confirmCreate = async () => {
  if (!createData.value.name.trim()) {
    showToast({
      message: '请输入配置名称',
      position: 'top'
    })
    return
  }

  try {
    // 创建新配置，基于当前配置的内容
    const currentConfig = agentConfigStore.currentConfig
    const newConfig = {
      name: createData.value.name.trim(),
      description: createData.value.description.trim(),
      // 复制当前配置的内容
      ...(currentConfig ? {
        province: currentConfig.province,
        city: currentConfig.city,
        cropTypes: currentConfig.cropTypes,
        growthStage: currentConfig.growthStage,
        enableImageAnalysis: currentConfig.enableImageAnalysis,
        enableFieldManagement: currentConfig.enableFieldManagement,
        enablePesticideAdvice: currentConfig.enablePesticideAdvice,
        customPrompt: currentConfig.customPrompt,
        enabledSkillIds: currentConfig.enabledSkillIds,
        systemPrompt: currentConfig.systemPrompt,
        agentConfig: currentConfig.agentConfig
      } : {
        // 默认配置
        cropTypes: [],
        growthStage: 'growing',
        enableImageAnalysis: true,
        enableFieldManagement: true,
        enablePesticideAdvice: true,
        enabledSkillIds: [],
        systemPrompt: {
          template: '你是一个专业的农业助手',
          language: 'zh'
        },
        agentConfig: {
          cropTypes: [],
          enableImageAnalysis: true,
          enableFieldManagement: true,
          enablePesticideAdvice: true
        }
      })
    }

    const created = await agentConfigStore.createConfig(newConfig)
    showToast({
      message: `已创建「${created.name}」`,
      position: 'top'
    })

    // 切换到新配置
    await agentConfigStore.switchConfig(created.id)
    emit('config-changed')
  } catch (err) {
    showToast({
      message: '创建失败，请重试',
      position: 'top'
    })
  }
}
</script>

<style scoped lang="scss">
@use "sass:color";
@use '@/styles/variables.scss' as *;

.config-manager {
  display: flex;
  flex-direction: column;
  height: 100%;

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid $border;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
    }

    .van-icon {
      cursor: pointer;
      color: $text-secondary;
      transition: $transition;

      &:hover {
        color: $text-primary;
      }
    }
  }

  .config-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    :deep(.van-cell) {
      margin-bottom: 8px;
      border-radius: $radius-md;
      border: 1px solid $border;
      transition: $transition;

      &.active {
        border-color: $primary;
        background: rgba($primary, 0.05);
      }

      .van-cell__title {
        font-weight: 600;
        color: $text-primary;
      }

      .van-cell__label {
        font-size: 12px;
        color: $text-secondary;
        margin-top: 4px;
      }

      .config-actions {
        display: flex;
        gap: 4px;

        .van-button {
          padding: 0 8px;
          height: 28px;
        }
      }
    }
  }

  .manager-footer {
    padding: 16px;
    border-top: 1px solid $border;
    background: $bg-card;

    :deep(.van-button) {
      height: 44px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.create-dialog {
  padding: 16px;

  :deep(.van-cell) {
    padding: 12px 0;
  }
}
</style>
