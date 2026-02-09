<template>
  <div class="config-editor">
    <!-- Select Existing Config -->
    <div v-if="!selectedConfig" class="select-config">
      <van-field
        label="选择配置"
        placeholder="选择要编辑的配置"
        input-align="right"
        @click="showSelector = true"
      >
        <template #input>
          <span v-if="selectedConfig" class="selected-text">
            {{ selectedConfig.name }}
          </span>
          <span v-else class="placeholder-text">点击选择配置</span>
        </template>
      </van-field>

      <van-popup
        v-model:show="showSelector"
        position="bottom"
        :style="{ height: '50vh' }"
      >
        <div class="config-picker">
          <div class="picker-header">
            <h3>选择配置</h3>
            <van-icon name="close" @click="showSelector = false" />
          </div>
          <van-radio-group v-model="selectedConfigId" direction="vertical">
            <van-radio
              v-for="config in editableConfigs"
              :key="config.id"
              :name="config.id"
              class="config-radio"
            >
              <div class="radio-content">
                <div class="radio-name">{{ config.name }}</div>
                <div class="radio-desc">{{ config.description }}</div>
              </div>
            </van-radio>
          </van-radio-group>
        </div>
      </van-popup>
    </div>

    <!-- Edit Form -->
    <div v-else class="edit-form">
      <!-- Basic Info -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <van-field
          v-model="formData.name"
          label="配置名称"
          placeholder="输入配置名称"
          clearable
        />
        <van-field
          v-model="formData.description"
          label="配置描述"
          placeholder="输入配置描述"
          type="textarea"
          rows="2"
          clearable
        />
      </div>

      <!-- System Prompt Section -->
      <SystemPromptSection v-model="formData.systemPrompt" />

      <!-- Response Parameters Section -->
      <ResponseParamSection v-model="formData.responseParams" />

      <!-- Agent Business Parameters Section -->
      <AgentParamSection v-model="formData.agentConfig" />

      <!-- Advanced Configuration Section -->
      <AdvancedConfigSection v-model="formData.advancedConfig" />

      <!-- Action Buttons -->
      <div class="form-actions">
        <van-button
          block
          plain
          @click="cancelEdit"
        >
          取消
        </van-button>
        <van-button
          block
          type="primary"
          loading={isSubmitting}
          @click="saveChanges"
        >
          保存更改
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { showToast } from 'vant'
import SystemPromptSection from './SystemPromptSection.vue'
import ResponseParamSection from './ResponseParamSection.vue'
import AgentParamSection from './AgentParamSection.vue'
import AdvancedConfigSection from './AdvancedConfigSection.vue'

const agentConfigStore = useAgentConfigStore()

const showSelector = ref(false)
const selectedConfigId = ref('')
const isSubmitting = ref(false)

const editableConfigs = computed(() =>
  agentConfigStore.configs.filter(c => c.id !== selectedConfigId.value)
)

const selectedConfig = computed(() => {
  return agentConfigStore.configs.find(c => c.id === selectedConfigId.value)
})

const formData = ref(getDefaultFormData())

function getDefaultFormData() {
  return {
    name: '',
    description: '',
    systemPrompt: {
      template: '',
      customInstructions: '',
      language: 'zh'
    },
    responseParams: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      topK: 40,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    agentConfig: {
      cropTypes: [],
      diseaseDetectionMode: 'balanced',
      enableImageAnalysis: true,
      enableFieldManagement: true,
      enablePesticideAdvice: true,
      maxSteps: 5,
      outputFormat: 'detailed'
    },
    advancedConfig: {
      enableCaching: true,
      cacheExpireMins: 60,
      enableRetry: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      timeoutSeconds: 60
    }
  }
}

watch(selectedConfig, (config) => {
  if (config) {
    formData.value = JSON.parse(JSON.stringify(config))
  }
})

const cancelEdit = () => {
  selectedConfigId.value = ''
  formData.value = getDefaultFormData()
}

const saveChanges = async () => {
  if (!formData.value.name.trim()) {
    showToast({
      message: '请输入配置名称',
      position: 'top'
    })
    return
  }

  isSubmitting.value = true
  try {
    await agentConfigStore.updateConfig(selectedConfigId.value, formData.value)
    showToast({
      message: '配置更新成功',
      position: 'top'
    })
    cancelEdit()
  } catch (err) {
    showToast({
      message: '更新失败，请重试',
      position: 'top'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.config-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .select-config {
    padding: 16px 0;

    :deep(.van-field) {
      padding: 0;
      margin-bottom: 12px;
    }
  }

  .config-picker {
    display: flex;
    flex-direction: column;
    height: 100%;

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid $border;

      h3 {
        margin: 0;
        font-size: 16px;
      }

      .van-icon {
        cursor: pointer;
      }
    }

    :deep(.van-radio-group) {
      flex: 1;
      overflow-y: auto;
      padding: 12px;

      .config-radio {
        margin-bottom: 12px;

        .radio-content {
          flex: 1;

          .radio-name {
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 4px;
          }

          .radio-desc {
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .section-title {
        margin: 0;
        padding: 12px 0 0 0;
        font-size: 14px;
        font-weight: 600;
        color: $text-primary;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      padding-top: 12px;
      margin-top: 12px;
      border-top: 1px solid $border;

      :deep(.van-button) {
        flex: 1;
      }
    }
  }
}
</style>
