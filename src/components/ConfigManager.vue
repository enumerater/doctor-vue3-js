<template>
  <el-dialog v-model="visible" title="配置管理" width="520px" :close-on-click-modal="true" @close="onClose">
    <div class="config-manager">
      <!-- 配置列表 -->
      <div class="config-list">
        <div v-for="config in configs" :key="config.id" class="config-item"
          :class="{ active: config.id === currentConfigId }">
          <div class="config-left">
            <el-icon :size="18" class="star-icon" :class="{ 'is-default': config.isDefault }">
              <StarFilled v-if="config.isDefault" />
              <Star v-else />
            </el-icon>
            <div class="config-info">
              <div class="config-name">{{ config.name }}</div>
              <div class="config-label">{{ config.description || getConfigLabel(config) }}</div>
            </div>
          </div>
          <div class="config-actions">
            <el-button v-if="config.id !== currentConfigId" size="small" type="primary" plain @click="onSwitch(config)">
              切换
            </el-button>
            <el-button size="small" :icon="Edit" @click="onRename(config)" />
            <el-button size="small" :icon="CopyDocument" @click="onDuplicate(config)" />
            <el-button v-if="configs.length > 1" size="small" :icon="Delete" @click="onDelete(config)" />
          </div>
        </div>
      </div>

      <!-- 新建配置按钮 -->
      <div class="manager-footer">
        <el-button type="primary" :icon="Plus" size="large" @click="onCreate" style="width: 100%;">
          新建配置
        </el-button>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <el-dialog v-model="showRenameDialog" title="重命名配置" width="420px" append-to-body>
      <el-input v-model="renameValue" placeholder="请输入配置名称" maxlength="20" show-word-limit />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建配置对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建配置" width="480px" append-to-body>
      <div class="create-dialog">
        <el-form label-position="top">
          <el-form-item label="配置名称">
            <el-input v-model="createData.name" placeholder="例如：玉米专用配置" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="配置说明">
            <el-input v-model="createData.description" type="textarea" placeholder="简单描述这个配置的用途（可选）" :rows="2"
              maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StarFilled, Star, Edit, CopyDocument, Delete, Plus } from '@element-plus/icons-vue'

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
    ElMessage.success(`已切换到「${config.name}」`)
    emit('config-changed')
    visible.value = false
  } catch (err) {
    ElMessage.error('切换失败，请重试')
  }
}

// 重命名配置
const onRename = (config) => {
  renamingConfigId.value = config.id
  renameValue.value = config.name
  showRenameDialog.value = true
}

const confirmRename = async () => {
  if (!renameValue.value.trim()) {
    ElMessage.warning('请输入配置名称')
    return
  }

  try {
    await agentConfigStore.rename(renamingConfigId.value,
      renameValue.value.trim()
    )
    ElMessage.success('重命名成功')
    showRenameDialog.value = false
    emit('config-changed')
  } catch (err) {
    ElMessage.error('重命名失败，请重试')
  }
}

// 复制配置
const onDuplicate = async (config) => {
  try {
    const newConfig = await agentConfigStore.duplicate(config.id)
    ElMessage.success(`已创建「${newConfig.name}」`)
    emit('config-changed')
  } catch (err) {
    ElMessage.error('复制失败，请重试')
  }
}

// 删除配置
const onDelete = async (config) => {
  if (configs.value.length <= 1) {
    ElMessage.warning('至少保留一个配置')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除「${config.name}」吗？此操作不可恢复。`,
      '删除配置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await agentConfigStore.deleteConfig(config.id)
    ElMessage.success('删除成功')
    emit('config-changed')
  } catch (err) {
    // 用户取消或删除失败
    if (err !== 'cancel') {
      ElMessage.error('删除失败，请重试')
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
    ElMessage.warning('请输入配置名称')
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
    ElMessage.success(`已创建「${created.name}」`)

    // 切换到新配置
    await agentConfigStore.switchConfig(created.id)
    showCreateDialog.value = false
    emit('config-changed')
  } catch (err) {
    ElMessage.error('创建失败，请重试')
  }
}
</script>

<style scoped lang="scss">
@use "sass:color";
@use '@/styles/variables.scss' as *;

.config-manager {
  display: flex;
  flex-direction: column;

  .config-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px 0;

    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: $radius-md;
      border: 1px solid $border;
      transition: $transition-fast;

      &.active {
        border-color: $primary;
        background: rgba($primary, 0.05);
      }

      &:hover {
        border-color: rgba($primary, 0.3);
      }

      .config-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;

        .star-icon {
          flex-shrink: 0;
          color: #c8c9cc;

          &.is-default {
            color: #ffd700;
          }
        }

        .config-info {
          min-width: 0;

          .config-name {
            font-weight: 600;
            color: $text-primary;
            font-size: 14px;
          }

          .config-label {
            font-size: 12px;
            color: $text-secondary;
            margin-top: 4px;
          }
        }
      }

      .config-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }
    }
  }

  .manager-footer {
    padding: 16px 0;
    border-top: 1px solid $border;
    background: $bg-card;

    :deep(.el-button) {
      height: 44px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.create-dialog {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
