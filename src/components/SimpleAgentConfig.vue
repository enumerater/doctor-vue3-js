<template>
  <div class="simple-agent-config">
    <div class="config-form">
      <!-- 配置选择器 -->
      <div class="form-section config-selector">
        <h3 class="section-title">当前配置</h3>
        <div class="selector-row">
          <van-field
            v-model="currentConfigName"
            readonly
            clickable
            placeholder="选择配置"
            right-icon="arrow-down"
            @click="showConfigPicker = true"
          />
          <van-button
            type="primary"
            size="small"
            icon="setting-o"
            @click="openConfigManager"
          >
            管理
          </van-button>
        </div>
      </div>

      <!-- 农业先验知识 -->
      <div class="form-section">
        <h3 class="section-title">农业先验知识</h3>
        <p class="section-desc">告诉我一些基本信息，我会给你更准确的建议</p>

        <!-- 所在地域 -->
        <div class="field-group">
          <label class="field-label">你在哪里种地？</label>
          <van-field
            v-model="formData.province"
            placeholder="省份（如：山东省）"
            clearable
          />
          <van-field
            v-model="formData.city"
            placeholder="城市（如：潍坊市）"
            clearable
          />
        </div>

        <!-- 种植作物 -->
        <div class="field-group">
          <label class="field-label">你种什么作物？</label>
          <van-checkbox-group v-model="formData.cropTypes">
            <div class="crop-grid">
              <van-checkbox
                v-for="crop in commonCrops"
                :key="crop.value"
                :name="crop.value"
                shape="square"
              >
                {{ crop.label }}
              </van-checkbox>
            </div>
          </van-checkbox-group>
        </div>

        <!-- 作物生长阶段 -->
        <div class="field-group">
          <label class="field-label">现在是什么阶段？</label>
          <van-radio-group v-model="formData.growthStage">
            <div class="stage-list">
              <van-radio name="seeding">播种期</van-radio>
              <van-radio name="growing">生长期</van-radio>
              <van-radio name="flowering">开花期</van-radio>
              <van-radio name="fruiting">结果期</van-radio>
              <van-radio name="mature">成熟期</van-radio>
            </div>
          </van-radio-group>
        </div>
      </div>

      <!-- 功能开关 -->
      <div class="form-section">
        <h3 class="section-title">需要什么帮助？</h3>
        <p class="section-desc">选择你需要的服务</p>

        <div class="toggle-list">
          <van-cell center title="图片诊断" title-class="toggle-title">
            <template #label>
              <span class="toggle-desc">上传作物照片，帮你看病</span>
            </template>
            <template #right-icon>
              <van-switch v-model="formData.enableImageAnalysis" size="20" />
            </template>
          </van-cell>

          <van-cell center title="管理建议" title-class="toggle-title">
            <template #label>
              <span class="toggle-desc">施肥、浇水、除草等日常管理</span>
            </template>
            <template #right-icon>
              <van-switch v-model="formData.enableFieldManagement" size="20" />
            </template>
          </van-cell>

          <van-cell center title="用药方案" title-class="toggle-title">
            <template #label>
              <span class="toggle-desc">推荐农药和使用方法</span>
            </template>
            <template #right-icon>
              <van-switch v-model="formData.enablePesticideAdvice" size="20" />
            </template>
          </van-cell>
        </div>
      </div>

      <!-- 高级选项 - 智能体提示词 -->
      <div class="form-section">
        <van-collapse v-model="advancedOpen">
          <van-collapse-item title="高级选项" name="advanced">
            <div class="advanced-content">
              <label class="field-label">智能体提示词（选填）</label>
              <p class="field-desc">给专业用户：自定义Agent的行为规则</p>
              <van-field
                v-model="formData.customPrompt"
                type="textarea"
                rows="4"
                placeholder="例如：你是一个专注于病虫害防治的专家，回答要简洁明了..."
                maxlength="500"
                show-word-limit
              />
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- Skills配置 -->
      <div class="form-section">
        <h3 class="section-title">启用的Skills</h3>
        <p class="section-desc">选择你需要的技能模块</p>

        <div v-if="skillsByCategory" class="skills-config">
          <div
            v-for="(categorySkills, category) in skillsByCategory"
            :key="category"
            class="skill-category"
          >
            <div class="category-header">
              <span class="category-icon">{{ getCategoryInfo(category).icon }}</span>
              <span class="category-name">{{ getCategoryInfo(category).name }}</span>
            </div>
            <div class="skill-list">
              <van-cell
                v-for="skill in categorySkills"
                :key="skill.id"
                center
              >
                <template #icon>
                  <span class="skill-icon">{{ skill.icon }}</span>
                </template>
                <template #title>
                  <span class="skill-title">{{ skill.name }}</span>
                </template>
                <template #label>
                  <span class="skill-desc">{{ skill.description }}</span>
                </template>
                <template #right-icon>
                  <van-switch
                    :model-value="formData.enabledSkillIds.includes(skill.id)"
                    size="20"
                    @update:model-value="toggleSkill(skill.id)"
                  />
                </template>
              </van-cell>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="form-actions">
        <van-button block type="primary" :loading="isSaving" @click="saveConfig">
          保存设置
        </van-button>
      </div>
    </div>

    <!-- 配置选择器弹窗 -->
    <van-popup v-model:show="showConfigPicker" position="bottom" round>
      <van-picker
        :columns="configColumns"
        @confirm="onConfigSelect"
        @cancel="showConfigPicker = false"
      />
    </van-popup>

    <!-- 配置管理弹窗 -->
    <ConfigManager
      v-model:show="showConfigManager"
      @config-changed="onConfigChanged"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useSkillsStore } from '@/stores/skills'
import { showToast } from 'vant'
import ConfigManager from './ConfigManager.vue'
import { registeredSkills, skillCategories } from '@/skills'

const agentConfigStore = useAgentConfigStore()
const skillsStore = useSkillsStore()
const isSaving = ref(false)
const advancedOpen = ref([])
const showConfigPicker = ref(false)
const showConfigManager = ref(false)

// 常见作物（简化为8个）
const commonCrops = [
  { label: '玉米', value: 'corn' },
  { label: '小麦', value: 'wheat' },
  { label: '水稻', value: 'rice' },
  { label: '番茄', value: 'tomato' },
  { label: '黄瓜', value: 'cucumber' },
  { label: '辣椒', value: 'pepper' },
  { label: '苹果', value: 'apple' },
  { label: '葡萄', value: 'grape' }
]

// 表单数据
const formData = ref({
  province: '',
  city: '',
  cropTypes: [],
  growthStage: 'growing',
  enableImageAnalysis: true,
  enableFieldManagement: true,
  enablePesticideAdvice: true,
  customPrompt: '',
  enabledSkillIds: []
})

// 当前配置名称
const currentConfigName = computed(() => {
  return agentConfigStore.currentConfig?.name || '默认配置'
})

// 配置选择器的列
const configColumns = computed(() => {
  return agentConfigStore.configs.map(config => ({
    text: config.name,
    value: config.id
  }))
})

// Skills按分类分组
const skillsByCategory = computed(() => {
  const grouped = {}
  registeredSkills.forEach(skill => {
    const category = skill.category || 'other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(skill)
  })
  return grouped
})

// 获取分类信息
const getCategoryInfo = (category) => {
  return skillCategories[category] || { name: '其他', icon: '🔧' }
}

// 加载当前配置
onMounted(async () => {
  // 加载配置列表
  if (agentConfigStore.configs.length === 0) {
    await agentConfigStore.fetchConfigs()
  }

  // 加载skills列表
  if (skillsStore.availableSkills.length === 0) {
    await skillsStore.fetchSkills()
  }

  loadCurrentConfig()
})

const loadCurrentConfig = () => {
  const currentConfig = agentConfigStore.currentConfig
  if (currentConfig) {
    formData.value = {
      province: currentConfig.province || '',
      city: currentConfig.city || '',
      cropTypes: currentConfig.cropTypes || [],
      growthStage: currentConfig.growthStage || 'growing',
      enableImageAnalysis: currentConfig.enableImageAnalysis ?? true,
      enableFieldManagement: currentConfig.enableFieldManagement ?? true,
      enablePesticideAdvice: currentConfig.enablePesticideAdvice ?? true,
      customPrompt: currentConfig.customPrompt || '',
      enabledSkillIds: currentConfig.enabledSkillIds || skillsStore.enabledSkillIds || []
    }
  }
}

// 切换配置
const onConfigSelect = ({ selectedOptions }) => {
  const selectedConfig = selectedOptions[0]
  if (selectedConfig) {
    agentConfigStore.switchConfig(selectedConfig.value)
    loadCurrentConfig()
    showConfigPicker.value = false
    showToast({
      message: `已切换到「${selectedConfig.text}」`,
      position: 'top'
    })
  }
}

// 打开配置管理
const openConfigManager = () => {
  showConfigManager.value = true
}

// 配置变化时重新加载
const onConfigChanged = () => {
  loadCurrentConfig()
}

// 切换skill启用状态
const toggleSkill = (skillId) => {
  const index = formData.value.enabledSkillIds.indexOf(skillId)
  if (index > -1) {
    formData.value.enabledSkillIds.splice(index, 1)
  } else {
    formData.value.enabledSkillIds.push(skillId)
  }
}

const saveConfig = async () => {
  // 验证必填项
  if (formData.value.cropTypes.length === 0) {
    showToast({
      message: '请至少选择一种作物',
      position: 'top'
    })
    return
  }

  isSaving.value = true
  try {
    // 构建简化的配置对象
    const configData = {
      name: agentConfigStore.currentConfig?.name || '我的农田配置',
      province: formData.value.province,
      city: formData.value.city,
      cropTypes: formData.value.cropTypes,
      growthStage: formData.value.growthStage,
      enableImageAnalysis: formData.value.enableImageAnalysis,
      enableFieldManagement: formData.value.enableFieldManagement,
      enablePesticideAdvice: formData.value.enablePesticideAdvice,
      customPrompt: formData.value.customPrompt,
      enabledSkillIds: formData.value.enabledSkillIds,
      // 保留后端需要的字段，但用固定值
      systemPrompt: {
        template: formData.value.customPrompt || '你是一个专业的农业助手',
        language: 'zh'
      },
      // 移除所有AI底层参数，后端使用默认值
      agentConfig: {
        cropTypes: formData.value.cropTypes,
        enableImageAnalysis: formData.value.enableImageAnalysis,
        enableFieldManagement: formData.value.enableFieldManagement,
        enablePesticideAdvice: formData.value.enablePesticideAdvice
      }
    }

    // 如果当前有配置就更新，否则创建新的
    if (agentConfigStore.currentConfigId) {
      await agentConfigStore.updateConfig(agentConfigStore.currentConfigId, configData)
    } else {
      await agentConfigStore.createConfig({ ...configData, isDefault: true })
    }

    // 同步更新skills状态
    const currentEnabledIds = skillsStore.enabledSkillIds
    const toEnable = formData.value.enabledSkillIds.filter(id => !currentEnabledIds.includes(id))
    const toDisable = currentEnabledIds.filter(id => !formData.value.enabledSkillIds.includes(id))

    if (toEnable.length > 0) {
      await skillsStore.enableSkills(toEnable)
    }
    if (toDisable.length > 0) {
      await skillsStore.disableSkills(toDisable)
    }

    showToast({
      message: '设置已保存',
      position: 'top'
    })

    // 关闭配置面板
    agentConfigStore.closeConfigPanel()
  } catch (err) {
    showToast({
      message: '保存失败，请重试',
      position: 'top'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.simple-agent-config {
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .form-section {
      background: $bg-card;
      border-radius: $radius-lg;
      padding: 16px;
      border: 1px solid $border;

      &.config-selector {
        .selector-row {
          display: flex;
          gap: 8px;
          align-items: center;

          :deep(.van-field) {
            flex: 1;
          }

          .van-button {
            flex-shrink: 0;
          }
        }
      }

      .section-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
      }

      .section-desc {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: $text-secondary;
        line-height: 1.4;
      }

      .field-group {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .field-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          color: $text-primary;
          margin-bottom: 8px;
        }

        .field-desc {
          margin: 4px 0 8px 0;
          font-size: 12px;
          color: $text-secondary;
        }

        .crop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;

          :deep(.van-checkbox) {
            .van-checkbox__label {
              font-size: 14px;
            }
          }
        }

        .stage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          :deep(.van-radio) {
            .van-radio__label {
              font-size: 14px;
            }
          }
        }
      }

      .toggle-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        :deep(.van-cell) {
          padding: 12px;
          background: $bg-main;
          border-radius: $radius-md;
          border: 1px solid $border;

          .toggle-title {
            font-weight: 600;
            font-size: 14px;
          }

          .toggle-desc {
            font-size: 12px;
            color: $text-secondary;
            margin-top: 4px;
          }
        }
      }

      .advanced-content {
        padding-top: 12px;

        .field-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          color: $text-primary;
          margin-bottom: 4px;
        }

        .field-desc {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: $text-secondary;
        }
      }

      .skills-config {
        .skill-category {
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .category-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            padding: 8px 12px;
            background: $bg-main;
            border-radius: $radius-md;

            .category-icon {
              font-size: 16px;
            }

            .category-name {
              font-size: 14px;
              font-weight: 600;
              color: $text-primary;
            }
          }

          .skill-list {
            display: flex;
            flex-direction: column;
            gap: 8px;

            :deep(.van-cell) {
              padding: 12px;
              background: $bg-main;
              border-radius: $radius-md;
              border: 1px solid $border;

              .skill-icon {
                font-size: 20px;
                margin-right: 12px;
              }

              .skill-title {
                font-weight: 600;
                font-size: 14px;
                color: $text-primary;
              }

              .skill-desc {
                font-size: 12px;
                color: $text-secondary;
                margin-top: 4px;
              }
            }
          }
        }
      }
    }

    .form-actions {
      margin-top: 8px;

      :deep(.van-button) {
        height: 44px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  :deep(.van-collapse-item__title) {
    font-weight: 600;
    color: $text-primary;
  }

  :deep(.van-field__control) {
    font-size: 14px;
  }
}
</style>
