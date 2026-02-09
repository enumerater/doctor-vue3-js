<template>
  <div class="agent-param-section">
    <div class="form-section">
      <h3 class="section-title">Agent 业务参数</h3>

      <!-- Crop Types -->
      <div class="param-group">
        <label class="label">农作物类型</label>
        <p class="description">选择Agent主要服务的农作物类型（可多选）</p>
        <van-checkbox-group v-model="selectedCropTypes">
          <div class="checkbox-grid">
            <van-checkbox v-for="crop in cropOptions" :key="crop.value" :name="crop.value" shape="square">
              {{ crop.label }}
            </van-checkbox>
          </div>
        </van-checkbox-group>
      </div>

      <!-- Disease Detection Mode -->
      <div class="param-group">
        <label class="label">诊断模式</label>
        <p class="description">选择Agent的诊断模式</p>
        <van-radio-group v-model="selectedDetectionMode" direction="horizontal">
          <van-radio name="fast">
            <div class="radio-content">
              <strong>快速模式</strong>
              <span>快速响应，适合常见病害</span>
            </div>
          </van-radio>
          <van-radio name="balanced">
            <div class="radio-content">
              <strong>平衡模式</strong>
              <span>兼顾速度与准确性</span>
            </div>
          </van-radio>
          <van-radio name="precise">
            <div class="radio-content">
              <strong>精准模式</strong>
              <span>深度分析，提供详细诊断</span>
            </div>
          </van-radio>
        </van-radio-group>
      </div>

      <!-- Function Toggles -->
      <div class="param-group">
        <label class="label">功能开关</label>
        <p class="description">启用或禁用特定功能模块</p>
        <div class="toggle-list">
          <van-cell center title="图像分析">
            <template #right-icon>
              <van-switch v-model="functionToggles.enableImageAnalysis" size="20" />
            </template>
          </van-cell>
          <van-cell center title="田间管理建议">
            <template #right-icon>
              <van-switch v-model="functionToggles.enableFieldManagement" size="20" />
            </template>
          </van-cell>
          <van-cell center title="用药方案">
            <template #right-icon>
              <van-switch v-model="functionToggles.enablePesticideAdvice" size="20" />
            </template>
          </van-cell>
        </div>
      </div>

      <!-- Max Steps -->
      <div class="param-group">
        <div class="param-header">
          <label class="label">最大步骤数</label>
          <span class="value">{{ maxSteps }}</span>
        </div>
        <p class="description">限制Agent的推理步骤数量，步骤越多分析越深入</p>
        <van-slider v-model="maxSteps" min="3" max="10" step="1" bar-height="4px" />
        <div class="step-indicators">
          <span v-for="n in 8" :key="n" :class="{ active: maxSteps >= n + 2 }" class="step-dot" />
        </div>
      </div>

      <!-- Output Format -->
      <div class="param-group">
        <label class="label">输出格式</label>
        <p class="description">选择Agent响应的详细程度</p>
        <van-radio-group v-model="selectedOutputFormat">
          <van-radio name="brief">简洁模式 - 关键信息快速输出</van-radio>
          <van-radio name="detailed">详细模式 - 完整分析和建议</van-radio>
          <van-radio name="technical">技术模式 - 包含专业术语和数据</van-radio>
        </van-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const cropOptions = [
  { label: '水稻', value: 'rice' },
  { label: '小麦', value: 'wheat' },
  { label: '玉米', value: 'corn' },
  { label: '大豆', value: 'soybean' },
  { label: '马铃薯', value: 'potato' },
  { label: '番茄', value: 'tomato' },
  { label: '黄瓜', value: 'cucumber' },
  { label: '辣椒', value: 'pepper' },
  { label: '茄子', value: 'eggplant' },
  { label: '白菜', value: 'cabbage' },
  { label: '萝卜', value: 'radish' },
  { label: '苹果', value: 'apple' },
  { label: '梨', value: 'pear' },
  { label: '桃', value: 'peach' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' }
]

const selectedCropTypes = computed({
  get() {
    return props.modelValue.cropTypes || []
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      cropTypes: value
    })
  }
})

const selectedDetectionMode = computed({
  get() {
    return props.modelValue.diseaseDetectionMode || 'balanced'
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      diseaseDetectionMode: value
    })
  }
})

const functionToggles = computed({
  get() {
    return {
      enableImageAnalysis: props.modelValue.enableImageAnalysis ?? true,
      enableFieldManagement: props.modelValue.enableFieldManagement ?? true,
      enablePesticideAdvice: props.modelValue.enablePesticideAdvice ?? true
    }
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      ...value
    })
  }
})

const maxSteps = computed({
  get() {
    return props.modelValue.maxSteps || 5
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      maxSteps: value
    })
  }
})

const selectedOutputFormat = computed({
  get() {
    return props.modelValue.outputFormat || 'detailed'
  },
  set(value) {
    emit('update:modelValue', {
      ...props.modelValue,
      outputFormat: value
    })
  }
})
</script>

<style scoped lang="scss">
// 导入 Sass 官方 color 模块（解决命名空间问题，消除 lighten 弃用警告）
@use "sass:color";
// 保留原有变量导入
@use '@/styles/variables.scss' as *;

.agent-param-section {
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

      .param-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .value {
          font-weight: 700;
          color: $primary;
          font-size: 16px;
        }
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        :deep(.van-checkbox) {
          margin-bottom: 8px;

          .van-checkbox__label {
            font-size: 13px;
          }
        }
      }

      :deep(.van-radio-group) {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .van-radio {
          .radio-content {
            display: flex;
            flex-direction: column;
            gap: 4px;

            strong {
              font-size: 14px;
              color: $text-primary;
            }

            span {
              font-size: 12px;
              color: $text-secondary;
            }
          }
        }
      }

      .toggle-list {
        display: flex;
        flex-direction: column;
        gap: 4px;

        :deep(.van-cell) {
          padding: 8px 0;
          border-bottom: 1px solid $border;

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .step-indicators {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        padding: 0 4px;

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          // 修正：替换 lighten 为 color.adjust，消除弃用警告
          background: color.adjust($primary, $lightness: 30%);
          transition: $transition;

          &.active {
            background: $primary;
          }
        }
      }
    }
  }
}
</style>
