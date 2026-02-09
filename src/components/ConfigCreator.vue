<template>
  <div class="config-creator">
    <div class="create-form">
      <!-- Basic Info -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <van-field
          v-model="formData.name"
          label="配置名称"
          placeholder="输入配置名称"
          clearable
          required
        />
        <van-field
          v-model="formData.description"
          label="配置描述"
          placeholder="输入配置描述"
          type="textarea"
          rows="2"
          clearable
        />
        <van-field name="switch" label="设为默认配置">
          <template #input>
            <van-switch v-model="formData.isDefault" size="20" />
          </template>
        </van-field>
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
          @click="resetForm"
        >
          重置
        </van-button>
        <van-button
          block
          type="primary"
          :loading="isSubmitting"
          @click="createConfig"
        >
          创建配置
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { showToast } from 'vant'
import SystemPromptSection from './SystemPromptSection.vue'
import ResponseParamSection from './ResponseParamSection.vue'
import AgentParamSection from './AgentParamSection.vue'
import AdvancedConfigSection from './AdvancedConfigSection.vue'

const agentConfigStore = useAgentConfigStore()
const isSubmitting = ref(false)

const formData = ref(getDefaultFormData())

function getDefaultFormData() {
  return {
    name: '',
    description: '',
    isDefault: false,
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

const resetForm = () => {
  formData.value = getDefaultFormData()
}

const createConfig = async () => {
  if (!formData.value.name.trim()) {
    showToast({
      message: '请输入配置名称',
      position: 'top'
    })
    return
  }

  isSubmitting.value = true
  try {
    const newConfig = await agentConfigStore.createConfig(formData.value)
    showToast({
      message: '配置创建成功',
      position: 'top'
    })

    // Switch to the new config
    await agentConfigStore.switchConfig(newConfig.id)

    // Reset form
    resetForm()
  } catch (err) {
    showToast({
      message: '创建失败，请重试',
      position: 'top'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.config-creator {
  .create-form {
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
