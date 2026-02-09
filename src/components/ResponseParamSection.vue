<template>
  <div class="response-param-section">
    <div class="form-section">
      <h3 class="section-title">响应参数</h3>

      <!-- 简化的温度控制 -->
      <div class="param-group">
        <div class="param-header">
          <label class="label">回答风格</label>
        </div>
        <p class="description">选择AI回答的风格特点</p>
        <div class="preset-buttons">
          <van-button v-for="(preset, key) in temperaturePresets" :key="key" size="small" plain
            :type="modelValue.temperature === preset.value ? 'primary' : 'default'"
            @click="updateParam('temperature', preset.value)">
            {{ preset.label }}
          </van-button>
        </div>
      </div>

      <!-- 输出长度控制 -->
      <div class="param-group">
        <label class="label">回答长度</label>
        <p class="description">选择AI回答的详细程度</p>
        <div class="preset-buttons">
          <van-button size="small" plain :type="modelValue.maxTokens === 1000 ? 'primary' : 'default'"
            @click="updateParam('maxTokens', 1000)">
            简洁
          </van-button>
          <van-button size="small" plain :type="modelValue.maxTokens === 2000 ? 'primary' : 'default'"
            @click="updateParam('maxTokens', 2000)">
            适中
          </van-button>
          <van-button size="small" plain :type="modelValue.maxTokens === 4000 ? 'primary' : 'default'"
            @click="updateParam('maxTokens', 4000)">
            详细
          </van-button>
        </div>
      </div>

      <!-- Preset Configurations -->
      <div class="preset-configs">
        <h4>推荐配置</h4>
        <div class="config-buttons">
          <van-button v-for="preset in parameterPresets" :key="preset.id" plain @click="applyPreset(preset)">
            {{ preset.name }}
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { showToast } from 'vant'

// 关键修改1：接收defineProps的返回值（props对象）
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const temperaturePresets = {
  precise: { label: '精准', value: 0.3 },
  balanced: { label: '平衡', value: 0.7 },
  creative: { label: '创意', value: 0.9 }
}

const parameterPresets = [
  {
    id: 'precise',
    name: '精准诊断',
    description: '严谨专业，适合病害诊断',
    params: {
      temperature: 0.3,
      maxTokens: 2000,
      topP: 0.8,
      topK: 30,
      frequencyPenalty: 0.2,
      presencePenalty: 0
    }
  },
  {
    id: 'balanced',
    name: '平衡模式',
    description: '兼顾准确性和多样性',
    params: {
      temperature: 0.7,
      maxTokens: 2500,
      topP: 0.9,
      topK: 40,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  },
  {
    id: 'detailed',
    name: '详细分析',
    description: '详尽全面的回答',
    params: {
      temperature: 0.8,
      maxTokens: 4000,
      topP: 0.95,
      topK: 50,
      frequencyPenalty: -0.1,
      presencePenalty: 0
    }
  },
  {
    id: 'fast',
    name: '快速响应',
    description: '简洁快速的回答',
    params: {
      temperature: 0.5,
      maxTokens: 1000,
      topP: 0.7,
      topK: 20,
      frequencyPenalty: 0.3,
      presencePenalty: 0.1
    }
  }
]

// 关键修改2：使用props.modelValue替代modelValue.value
const updateParam = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue, // 原错误：modelValue.value
    [key]: value
  })
}

// 关键修改3：使用props.modelValue替代modelValue.value
const applyPreset = (preset) => {
  emit('update:modelValue', {
    ...props.modelValue, // 原错误：modelValue.value
    ...preset.params
  })
  showToast({
    message: `已应用"${preset.name}"预设`,
    position: 'top'
  })
}
</script>

<style scoped lang="scss">
// 导入 Sass 官方 color 模块（解决命名空间问题，消除 lighten 弃用警告）
@use "sass:color";
// 保留原有变量导入
@use '@/styles/variables.scss' as *;

.response-param-section {
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

    .param-group {
      padding: 12px;
      background: $bg-card;
      border-radius: $radius-md;
      border: 1px solid $border;

      .param-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .label {
          font-weight: 600;
          font-size: 14px;
          color: $text-primary;
        }

        .value {
          font-weight: 700;
          color: $primary;
          font-size: 16px;
        }
      }

      .label {
        display: block;
        font-weight: 600;
        font-size: 14px;
        color: $text-primary;
        margin-bottom: 8px;
      }

      .description {
        margin: 0 0 12px 0;
        font-size: 12px;
        color: $text-secondary;
        line-height: 1.4;
      }



      .preset-buttons {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;

        :deep(.van-button) {
          flex: 1;
          min-width: 80px;
        }
      }
    }

    .preset-configs {
      padding: 12px;
      // 修正：替换 lighten 为 color.adjust，消除弃用警告
      background: color.adjust($primary, $lightness: 40%);
      border-radius: $radius-md;

      h4 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: $text-primary;
        text-transform: uppercase;
      }

      .config-buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;

        :deep(.van-button) {
          width: 100%;
        }
      }
    }
  }
}
</style>