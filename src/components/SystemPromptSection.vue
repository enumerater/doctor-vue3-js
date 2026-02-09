<template>
  <div class="system-prompt-section">
    <div class="form-section">
      <h3 class="section-title">系统提示词</h3>

      <!-- Template Selection -->
      <div class="template-selection">
        <label class="label">选择模板</label>
        <van-field label-width="0" placeholder="选择预设模板" input-align="right" @click="showTemplateSelector = true">
          <template #input>
            <span v-if="selectedTemplate" class="selected-template">
              {{ selectedTemplate.name }}
            </span>
            <span v-else class="placeholder-text">点击选择模板</span>
          </template>
        </van-field>

        <!-- Template Popup -->
        <van-popup v-model:show="showTemplateSelector" position="bottom" :style="{ height: '50vh' }">
          <div class="template-picker">
            <div class="picker-header">
              <h3>选择提示词模板</h3>
              <van-icon name="close" @click="showTemplateSelector = false" />
            </div>
            <div class="template-list">
              <div v-for="template in systemPromptTemplates" :key="template.id" class="template-item"
                @click="selectTemplate(template)">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
              </div>
            </div>
          </div>
        </van-popup>
      </div>

      <!-- Language Selection -->
      <van-field name="language" label="语言">
        <template #input>
          <van-radio-group v-model="modelValue.language" direction="horizontal">
            <van-radio name="zh">中文</van-radio>
            <van-radio name="en">English</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- Base Template -->
      <van-field label="基础提示词" type="textarea" rows="4" placeholder="输入或编辑基础提示词" clearable
        :model-value="modelValue.template" @update:model-value="updateTemplate" />

      <!-- Custom Instructions -->
      <van-field label="自定义补充指令" type="textarea" rows="3" placeholder="输入补充指令（可选）" clearable
        :model-value="modelValue.customInstructions" @update:model-value="updateCustomInstructions" />

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-header">
          <h4>完整提示词预览</h4>
          <van-icon :name="showPreview ? 'arrow-up' : 'arrow-down'" @click="showPreview = !showPreview" />
        </div>
        <div v-if="showPreview" class="preview-content">
          <div class="preview-text">{{ completePrompt }}</div>
          <van-button size="small" type="primary" plain @click="copyPrompt">
            复制
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const showTemplateSelector = ref(false)
const showPreview = ref(false)
const selectedTemplate = ref(null)

// System prompt templates
const systemPromptTemplates = [
  {
    id: 1,
    name: '作物病害诊断专家',
    description: '专注于农作物病害识别和防治建议',
    template: `你是一位资深的农业病害诊断专家。你的职责是：
1. 根据用户提供的图片、症状描述进行精准的病害诊断
2. 分析病害的严重程度和传播风险
3. 推荐针对性的防治方案和用药建议
4. 考虑季节、地区等因素提供专业建议

你应该：
- 使用专业的农业术语
- 提供有依据的诊断而非猜测
- 强调预防措施的重要性
- 建议及时咨询专业农技师`
  },
  {
    id: 2,
    name: '田间管理顾问',
    description: '提供全面的田间管理和农业生产建议',
    template: `你是一位经验丰富的农业生产管理顾问。你的职责是：
1. 根据作物生长阶段提供科学的管理建议
2. 优化灌溉、施肥等田间操作
3. 评估环境条件对作物的影响
4. 制定季节性的生产计划

你应该：
- 结合当地气候条件提供建议
- 考虑经济效益和可持续性
- 推荐最优的农业实践
- 帮助农民提高产量和质量`
  },
  {
    id: 3,
    name: '植保用药专家',
    description: '关注农药选择、用法和安全性',
    template: `你是一位专业的植物保护和用药安全专家。你的职责是：
1. 推荐适合的农药品种和剂型
2. 指导正确的用药方法和用量
3. 强调安全使用和环保考虑
4. 解释农药的工作原理

你应该：
- 优先推荐低毒农药
- 强调轮换用药的重要性
- 提供详细的安全操作说明
- 遵守农药使用标准`
  },
  {
    id: 4,
    name: '综合农技服务',
    description: '提供全面的一站式农业技术服务',
    template: `你是一位全能的农业技术服务专家。你的职责是：
1. 识别和诊断各类农业问题
2. 提供综合的解决方案
3. 整合多个领域的专业知识
4. 帮助农民提高生产效率

你应该：
- 客观、准确地分析问题
- 提供多个可选方案
- 考虑农民的实际条件和能力
- 建议最经济和实用的方案`
  },
  {
    id: 5,
    name: '精准农业数据分析',
    description: '基于数据进行精准化的农业决策支持',
    template: `你是一位数据驱动的精准农业分析专家。你的职责是：
1. 分析农业生产数据和环境数据
2. 预测作物生长趋势和风险
3. 提供数据支撑的优化建议
4. 评估管理措施的效果

你应该：
- 重视数据的准确性和完整性
- 使用科学的分析方法
- 提供可量化的决策指标
- 帮助农民做出科学决策`
  }
]

const completePrompt = computed(() => {
  const template = props.modelValue.template || ''
  const custom = props.modelValue.customInstructions || ''
  return template + (custom ? '\n\n补充指令：\n' + custom : '')
})

const updateTemplate = (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    template: value
  })
}

const updateCustomInstructions = (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    customInstructions: value
  })
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
  emit('update:modelValue', {
    ...props.modelValue,
    template: template.template
  })
  showTemplateSelector.value = false
  showToast({
    message: `已选择"${template.name}"模板`,
    position: 'top'
  })
}

const copyPrompt = () => {
  const text = completePrompt.value
  navigator.clipboard.writeText(text).then(() => {
    showToast({
      message: '已复制到剪贴板',
      position: 'top'
    })
  }).catch(() => {
    showToast({
      message: '复制失败',
      position: 'top'
    })
  })
}
</script>

<style scoped lang="scss">
// 导入 Sass 官方 color 模块（解决命名空间问题，消除 lighten 弃用警告）
@use "sass:color";
// 保留原有变量导入
@use '@/styles/variables.scss' as *;

.system-prompt-section {
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

    .template-selection {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .label {
        font-size: 12px;
        color: $text-secondary;
        font-weight: 500;
      }

      .selected-template {
        color: $primary;
      }

      .placeholder-text {
        color: $text-secondary;
      }
    }

    .template-picker {
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

      .template-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .template-item {
          padding: 12px;
          background: $bg-card;
          border: 1px solid $border;
          border-radius: $radius-md;
          cursor: pointer;
          transition: $transition;

          &:hover {
            background: $primary-light;
            border-color: $primary;
          }

          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: $text-primary;
          }

          p {
            margin: 0;
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }

    .preview-section {
      // 修正：替换 lighten 为 color.adjust，消除弃用警告
      background: color.adjust($primary, $lightness: 40%);
      border-radius: $radius-md;
      overflow: hidden;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        cursor: pointer;

        h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: $text-primary;
        }

        .van-icon {
          cursor: pointer;
        }
      }

      .preview-content {
        padding: 12px;
        border-top: 1px solid rgba($primary, 0.2);
        display: flex;
        flex-direction: column;
        gap: 12px;

        .preview-text {
          padding: 12px;
          background: $bg-card;
          border-radius: $radius-sm;
          font-size: 12px;
          color: $text-primary;
          line-height: 1.6;
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
    }
  }
}
</style>
