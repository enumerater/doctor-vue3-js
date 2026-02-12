<template>
  <div class="simple-agent-config-drag">
    <div class="config-form">
      <!-- 配置选择器 -->
      <div class="form-section config-selector">
        <h3 class="section-title">当前配置</h3>
        <div class="selector-row">
          <van-field v-model="currentConfigName" readonly clickable placeholder="选择配置" right-icon="arrow-down"
            @click="showConfigPicker = true" />
          <van-button type="primary" size="small" icon="setting-o" @click="openConfigManager">
            管理
          </van-button>
        </div>
      </div>

      <!-- 农业先验知识 -->
      <div class="form-section">
        <h3 class="section-title">🌱 农业先验知识</h3>
        <p class="section-desc">告诉我一些基本信息，我会给你更准确的建议</p>

        <!-- 所在地域 -->
        <div class="field-group">
          <label class="field-label">📍 你在哪里种地？</label>
          <van-field v-model="formData.province" placeholder="省份（如：山东省）" clearable />
          <van-field v-model="formData.city" placeholder="城市（如：潍坊市）" clearable />
        </div>

        <!-- 种植作物 -->
        <div class="field-group">
          <label class="field-label">🌾 你种什么作物？</label>
          <van-checkbox-group v-model="formData.cropTypes">
            <div class="crop-grid">
              <van-checkbox v-for="crop in commonCrops" :key="crop.value" :name="crop.value" shape="square"
                class="crop-checkbox">
                <span class="crop-icon">{{ crop.icon }}</span>
                <span>{{ crop.label }}</span>
              </van-checkbox>
            </div>
          </van-checkbox-group>
        </div>

        <!-- 作物生长阶段 -->
        <div class="field-group">
          <label class="field-label">📅 现在是什么阶段？</label>
          <van-radio-group v-model="formData.growthStage">
            <div class="stage-list">
              <van-radio name="seeding" class="stage-radio">
                <span class="stage-icon">🌱</span> 播种期
              </van-radio>
              <van-radio name="growing" class="stage-radio">
                <span class="stage-icon">🌿</span> 生长期
              </van-radio>
              <van-radio name="flowering" class="stage-radio">
                <span class="stage-icon">🌸</span> 开花期
              </van-radio>
              <van-radio name="fruiting" class="stage-radio">
                <span class="stage-icon">🍎</span> 结果期
              </van-radio>
              <van-radio name="mature" class="stage-radio">
                <span class="stage-icon">✨</span> 成熟期
              </van-radio>
            </div>
          </van-radio-group>
        </div>
      </div>

      <!-- Skills拖拽区 -->
      <div class="form-section">
        <h3 class="section-title">✨ Skills技能配置</h3>
        <p class="section-desc">拖动技能到右侧「工作区」启用，拖回左侧禁用</p>

        <div class="skills-drag-container">
          <!-- 可用技能池 -->
          <div class="skills-pool">
            <div class="pool-header">
              <span class="pool-icon">📦</span>
              <span class="pool-title">可用技能</span>
              <span class="pool-count">{{ availableSkills.length }}</span>
            </div>
            <draggable v-model="availableSkills" :group="{ name: 'skills', pull: 'clone', put: true }" item-key="id"
              :animation="200" ghost-class="ghost" class="skill-list" @change="onSkillChange">
              <template #item="{ element }">
                <div class="skill-card available" :data-skill-id="element.id">
                  <span class="skill-icon">{{ element.icon }}</span>
                  <div class="skill-info">
                    <div class="skill-name">{{ element.name }}</div>
                    <div class="skill-desc">{{ element.description }}</div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- 已启用技能区 -->
          <div class="skills-workspace">
            <div class="workspace-header">
              <span class="workspace-icon">⚡</span>
              <span class="workspace-title">工作区</span>
              <span class="workspace-count">{{ enabledSkillsList.length }}</span>
            </div>
            <draggable v-model="enabledSkillsList" :group="{ name: 'skills', pull: true, put: true }" item-key="id"
              :animation="200" ghost-class="ghost" class="skill-list" @change="onSkillChange">
              <template #item="{ element }">
                <div class="skill-card enabled" :data-skill-id="element.id">
                  <span class="skill-icon">{{ element.icon }}</span>
                  <div class="skill-info">
                    <div class="skill-name">{{ element.name }}</div>
                    <div class="skill-desc">{{ element.description }}</div>
                  </div>
                  <span class="remove-btn" @click="removeSkill(element.id)">×</span>
                </div>
              </template>
            </draggable>
            <div v-if="enabledSkillsList.length === 0" class="empty-workspace">
              <div class="empty-icon">🎯</div>
              <div class="empty-text">拖动技能到这里启用</div>
            </div>
          </div>

          <!-- Skills按分类展示（折叠） -->
          <van-collapse v-model="expandedCategories" class="category-collapse">
            <van-collapse-item v-for="(categorySkills, category) in skillsByCategory" :key="category" :name="category">
              <template #title>
                <div class="category-title">
                  <span class="category-icon">{{ getCategoryInfo(category).icon }}</span>
                  <span>{{ getCategoryInfo(category).name }}</span>
                  <span class="category-badge">{{ categorySkills.length }}</span>
                </div>
              </template>
              <div class="category-skills">
                <div v-for="skill in categorySkills" :key="skill.id" class="skill-item"
                  :class="{ enabled: isSkillEnabled(skill.id) }" @click="quickToggleSkill(skill)">
                  <span class="skill-icon">{{ skill.icon }}</span>
                  <div class="skill-info">
                    <div class="skill-name">{{ skill.name }}</div>
                    <div class="skill-desc">{{ skill.description }}</div>
                  </div>
                  <van-icon :name="isSkillEnabled(skill.id) ? 'success' : 'plus'"
                    :class="isSkillEnabled(skill.id) ? 'icon-enabled' : 'icon-disabled'" />
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>
      </div>

      <!-- 高级选项 -->
      <div class="form-section">
        <van-collapse v-model="advancedOpen">
          <van-collapse-item title="⚙️ 高级选项" name="advanced">
            <div class="advanced-content">
              <label class="field-label">智能体提示词（选填）</label>
              <p class="field-desc">给专业用户：自定义Agent的行为规则</p>
              <van-field v-model="formData.customPrompt" type="textarea" rows="4"
                placeholder="例如：你是一个专注于病虫害防治的专家，回答要简洁明了..." maxlength="500" show-word-limit />
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 保存按钮 -->
      <div class="form-section">
        <div class="form-actions">
          <van-button block type="primary" :loading="isSaving" class="save-btn" @click="saveConfig">
            💾 保存设置
          </van-button>
        </div>
      </div>

      <!-- 配置选择器弹窗 -->
      <van-popup v-model:show="showConfigPicker" position="bottom" round>
        <van-picker :columns="configColumns" @confirm="onConfigSelect" @cancel="showConfigPicker = false" />
      </van-popup>

      <!-- 配置管理弹窗 -->
      <ConfigManager v-model:show="showConfigManager" @config-changed="onConfigChanged" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useSkillsStore } from '@/stores/skills'
import { showToast } from 'vant'
import draggable from 'vuedraggable'
import ConfigManager from './ConfigManager.vue'
import { registeredSkills, skillCategories } from '@/skills'

const agentConfigStore = useAgentConfigStore()
const skillsStore = useSkillsStore()
const isSaving = ref(false)
const advancedOpen = ref([])
const expandedCategories = ref([])
const showConfigPicker = ref(false)
const showConfigManager = ref(false)

// 常见作物（添加icon）
const commonCrops = [
  { label: '玉米', value: 'corn', icon: '🌽' },
  { label: '小麦', value: 'wheat', icon: '🌾' },
  { label: '水稻', value: 'rice', icon: '🌾' },
  { label: '番茄', value: 'tomato', icon: '🍅' },
  { label: '黄瓜', value: 'cucumber', icon: '🥒' },
  { label: '辣椒', value: 'pepper', icon: '🌶️' },
  { label: '苹果', value: 'apple', icon: '🍎' },
  { label: '葡萄', value: 'grape', icon: '🍇' }
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

// Skills状态
const availableSkills = ref([])
const enabledSkillsList = ref([])

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

// 判断skill是否启用
const isSkillEnabled = (skillId) => {
  return enabledSkillsList.value.some(s => s.id === skillId)
}

// 初始化
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
  await initializeSkills()
})

// 初始化Skills
const initializeSkills = async () => {
  const allSkills = [...registeredSkills]
  const enabledIds = formData.value.enabledSkillIds || []

  // 分离已启用和未启用的skills
  enabledSkillsList.value = allSkills.filter(s => enabledIds.includes(s.id))
  availableSkills.value = allSkills.filter(s => !enabledIds.includes(s.id))

  // 更新skillsStore中的enabledSkillIds
  skillsStore.enabledSkillIds = enabledIds

  // 更新sidebarStore中的图片上传按钮状态
  const { useSidebarStore } = await import('@/stores/sidebar')
  const sidebarStore = useSidebarStore()
  const hasImageSkill = enabledIds.includes('disease-recognition')
  sidebarStore.setAgentImageUploadEnabled(hasImageSkill)
}

// 加载当前配置
const loadCurrentConfig = () => {
  const currentConfig = agentConfigStore.currentConfig
  if (currentConfig) {
    let enabledSkillIds = []
    try {
      // 解析enabledSkillIds，它可能是JSON字符串或数组
      if (typeof currentConfig.enabledSkillIds === 'string') {
        enabledSkillIds = JSON.parse(currentConfig.enabledSkillIds || '[]')
      } else if (Array.isArray(currentConfig.enabledSkillIds)) {
        enabledSkillIds = currentConfig.enabledSkillIds
      } else if (skillsStore.enabledSkillIds) {
        enabledSkillIds = skillsStore.enabledSkillIds
      }
    } catch (e) {
      enabledSkillIds = []
    }

    formData.value = {
      province: currentConfig.province || '',
      city: currentConfig.city || '',
      cropTypes: JSON.parse(currentConfig.cropTypes || '[]'),
      growthStage: currentConfig.growthStage || 'growing',
      enableImageAnalysis: currentConfig.enableImageAnalysis ?? true,
      enableFieldManagement: currentConfig.enableFieldManagement ?? true,
      enablePesticideAdvice: currentConfig.enablePesticideAdvice ?? true,
      customPrompt: currentConfig.customPrompt || '',
      enabledSkillIds: enabledSkillIds
    }
  }
}

// 监听enabledSkillsList变化
watch(enabledSkillsList, (newList) => {
  formData.value.enabledSkillIds = newList.map(s => s.id)
}, { deep: true })


// Skill拖拽变化
const onSkillChange = (evt) => {
  // 更新formData中的enabledSkillIds
  formData.value.enabledSkillIds = enabledSkillsList.value.map(s => s.id)

  // 从可用列表中移除已启用的
  const enabledIds = new Set(enabledSkillsList.value.map(s => s.id))
  availableSkills.value = availableSkills.value.filter(s => !enabledIds.has(s.id))
}

// 移除skill
const removeSkill = (skillId) => {
  const index = enabledSkillsList.value.findIndex(s => s.id === skillId)
  if (index > -1) {
    const [removed] = enabledSkillsList.value.splice(index, 1)
    availableSkills.value.push(removed)
    formData.value.enabledSkillIds = enabledSkillsList.value.map(s => s.id)
  }
}

// 快速切换skill（从分类列表）
const quickToggleSkill = (skill) => {
  if (isSkillEnabled(skill.id)) {
    removeSkill(skill.id)
  } else {
    enabledSkillsList.value.push(skill)
    availableSkills.value = availableSkills.value.filter(s => s.id !== skill.id)
    formData.value.enabledSkillIds = enabledSkillsList.value.map(s => s.id)
  }
}

// 切换配置
const onConfigSelect = async ({ selectedOptions }) => {
  const selectedConfig = selectedOptions[0]
  if (selectedConfig) {
    await agentConfigStore.switchConfig(selectedConfig.value)
    loadCurrentConfig()
    await initializeSkills()

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
const onConfigChanged = async () => {
  loadCurrentConfig()
  await initializeSkills()
}

// 保存配置
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

    const configData = {
      name: agentConfigStore.currentConfig?.name || '我的农田配置',
      province: formData.value.province,
      city: formData.value.city,
      cropTypes: JSON.stringify(formData.value.cropTypes), // 数组类型
      growthStage: formData.value.growthStage,
      enableImageAnalysis: formData.value.enableImageAnalysis,
      enableFieldManagement: formData.value.enableFieldManagement,
      enablePesticideAdvice: formData.value.enablePesticideAdvice,
      customPrompt: formData.value.customPrompt,
      enabledSkillIds: JSON.stringify(formData.value.enabledSkillIds), // 数组类型
    };


    // 更新或创建配置
    if (agentConfigStore.currentConfigId) {
      await agentConfigStore.updateConfig(agentConfigStore.currentConfigId, configData)
    } else {
      await agentConfigStore.createConfig({ ...configData, isDefault: true })
    }

    const currentEnabledIds = Array.isArray(skillsStore.enabledSkillIds) ? skillsStore.enabledSkillIds : []
    const toEnable = formData.value.enabledSkillIds.filter(id => !currentEnabledIds.includes(id))
    const toDisable = currentEnabledIds.filter(id => !formData.value.enabledSkillIds.includes(id))

    if (toEnable.length > 0) {
      await skillsStore.enableSkills(toEnable)
    }
    if (toDisable.length > 0) {
      await skillsStore.disableSkills(toDisable)
    }

    // 重新初始化技能状态，更新sidebarStore
    await initializeSkills()

    showToast({
      message: '✅ 设置已保存',
      position: 'top'
    })

    // 关闭配置面板
    agentConfigStore.closeConfigPanel()
  } catch (err) {
    console.error('保存配置失败:', err)
    showToast({
      message: '❌ 保存失败，请重试',
      position: 'top'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.simple-agent-config-drag {
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (max-width: 768px) {
      gap: 16px;
    }

    .form-section {
      background: $bg-card;
      border-radius: $radius-lg;
      padding: 16px;
      border: 1px solid $border;

      @media (max-width: 768px) {
        padding: 14px;
      }

      &.config-selector {
        .selector-row {
          display: flex;
          gap: 8px;
          align-items: center;

          @media (max-width: 768px) {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          :deep(.van-field) {
            flex: 1;
          }

          .van-button {
            flex-shrink: 0;

            @media (max-width: 768px) {
              width: 100%;
            }
          }
        }
      }

      .section-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;

        @media (max-width: 768px) {
          font-size: 15px;
        }
      }

      .section-desc {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: $text-secondary;
        line-height: 1.4;

        @media (max-width: 768px) {
          font-size: 12px;
          margin-bottom: 12px;
        }
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

        .crop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;

          @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .crop-checkbox {
            :deep(.van-checkbox__label) {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;

              @media (max-width: 768px) {
                font-size: 13px;
              }

              .crop-icon {
                font-size: 18px;

                @media (max-width: 768px) {
                  font-size: 16px;
                }
              }
            }
          }
        }

        .stage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          @media (max-width: 768px) {
            gap: 8px;
          }

          .stage-radio {
            :deep(.van-radio__label) {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;

              @media (max-width: 768px) {
                font-size: 13px;
                gap: 6px;
              }

              .stage-icon {
                font-size: 18px;

                @media (max-width: 768px) {
                  font-size: 16px;
                }
              }
            }
          }
        }
      }

      // 服务拖拽区
      .service-drag-area {
        .service-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          background: $bg-main;
          border-radius: $radius-md;
          border: 2px solid $border;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;

          &:hover {
            border-color: $primary;
            box-shadow: 0 2px 8px rgba($primary, 0.1);
          }

          &.active {
            border-color: $primary;
            background: rgba($primary, 0.05);
          }

          &.dragging {
            opacity: 0.5;
          }

          .card-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;

            .drag-handle {
              cursor: move;
              color: $text-tertiary;
              font-size: 16px;
              opacity: 0.5;
              transition: opacity 0.2s;

              &:hover {
                opacity: 1;
              }
            }

            .service-icon {
              font-size: 24px;
              flex-shrink: 0;
            }

            .service-info {
              flex: 1;

              .service-title {
                font-weight: 600;
                font-size: 14px;
                color: $text-primary;
                margin-bottom: 2px;
              }

              .service-desc {
                font-size: 12px;
                color: $text-secondary;
              }
            }
          }

          .card-right {
            flex-shrink: 0;
          }
        }

        .ghost {
          opacity: 0.5;
          background: rgba($primary, 0.1);
        }
      }

      // Skills拖拽容器
      .skills-drag-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 12px;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .skills-pool,
        .skills-workspace {
          background: $bg-main;
          border-radius: $radius-md;
          padding: 12px;
          min-height: 200px;
          border: 2px dashed $border;

          @media (max-width: 768px) {
            min-height: 180px;
          }

          .pool-header,
          .workspace-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid $border;

            .pool-icon,
            .workspace-icon {
              font-size: 16px;
            }

            .pool-title,
            .workspace-title {
              font-size: 13px;
              font-weight: 600;
              color: $text-primary;
              flex: 1;
            }

            .pool-count,
            .workspace-count {
              font-size: 12px;
              color: $text-secondary;
              background: rgba($primary, 0.1);
              padding: 2px 8px;
              border-radius: 10px;
            }
          }

          .skill-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 150px;

            @media (max-width: 768px) {
              min-height: 130px;
            }

            .skill-card {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px;
              background: $bg-card;
              border-radius: $radius-sm;
              border: 1px solid $border;
              cursor: move;
              transition: all 0.2s ease;
              position: relative;

              &:hover {
                border-color: $primary;
                box-shadow: 0 2px 6px rgba($primary, 0.1);
                transform: translateY(-1px);
              }

              &.enabled {
                border-color: $success;
                background: rgba($success, 0.05);
              }

              .skill-icon {
                font-size: 20px;
                flex-shrink: 0;
              }

              .skill-info {
                flex: 1;
                min-width: 0;

                .skill-name {
                  font-size: 13px;
                  font-weight: 600;
                  color: $text-primary;
                  margin-bottom: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .skill-desc {
                  font-size: 11px;
                  color: $text-secondary;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }

              .remove-btn {
                position: absolute;
                top: -6px;
                right: -6px;
                width: 20px;
                height: 20px;
                background: $danger;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
              }

              &:hover .remove-btn {
                opacity: 1;
              }
            }

            .ghost {
              opacity: 0.4;
              background: rgba($primary, 0.1);
            }
          }

          .empty-workspace {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 150px;
            color: $text-tertiary;

            @media (max-width: 768px) {
              height: 130px;
            }

            .empty-icon {
              font-size: 40px;
              margin-bottom: 8px;
              opacity: 0.3;

              @media (max-width: 768px) {
                font-size: 32px;
              }
            }

            .empty-text {
              font-size: 12px;
            }
          }
        }

        .skills-workspace {
          border-color: $success;
          border-style: dashed;
        }
      }

      // 分类折叠列表
      .category-collapse {
        margin-top: 16px;

        .category-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;

          .category-icon {
            font-size: 16px;
          }

          .category-badge {
            margin-left: auto;
            font-size: 12px;
            background: rgba($primary, 0.1);
            color: $primary;
            padding: 2px 8px;
            border-radius: 10px;
          }
        }

        .category-skills {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 0;

          .skill-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: $bg-main;
            border-radius: $radius-sm;
            border: 1px solid $border;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              border-color: $primary;
              background: rgba($primary, 0.05);
            }

            &.enabled {
              border-color: $success;
              background: rgba($success, 0.05);
            }

            .skill-icon {
              font-size: 20px;
              flex-shrink: 0;
            }

            .skill-info {
              flex: 1;
              min-width: 0;

              .skill-name {
                font-size: 13px;
                font-weight: 600;
                color: $text-primary;
                margin-bottom: 2px;
              }

              .skill-desc {
                font-size: 11px;
                color: $text-secondary;
              }
            }

            .icon-enabled {
              color: $success;
              font-size: 20px;
            }

            .icon-disabled {
              color: $text-tertiary;
              font-size: 20px;
            }
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
    }

    .form-actions {
      margin-top: 8px;

      @media (max-width: 768px) {
        margin-top: 4px;
      }

      .save-btn {
        height: 44px;
        font-size: 16px;
        font-weight: 600;
        border-radius: $radius-lg;
        box-shadow: 0 4px 12px rgba($primary, 0.2);
        transition: all 0.3s ease;

        @media (max-width: 768px) {
          height: 42px;
          font-size: 15px;
        }

        &:active {
          transform: scale(0.98);
        }
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