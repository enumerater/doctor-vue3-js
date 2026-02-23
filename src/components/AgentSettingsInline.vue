<template>
  <Transition name="slide-down">
    <div v-if="visible" class="agent-settings-inline">
      <div class="settings-header">
        <span class="settings-title">智能体设置</span>
        <el-button text size="small" @click="$emit('close')" class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="settings-body">
        <!-- Config selector -->
        <div class="setting-row">
          <label class="row-label">配置方案</label>
          <div class="row-content config-row">
            <el-select v-model="selectedConfigId" placeholder="选择配置" size="small" @change="onConfigSelect" class="config-select">
              <el-option v-for="c in configColumns" :key="c.value" :label="c.text" :value="c.value" />
            </el-select>
            <el-button size="small" @click="showConfigManager = true">
              <el-icon><Setting /></el-icon>
              管理
            </el-button>
          </div>
        </div>

        <!-- Crops -->
        <div class="setting-row">
          <label class="row-label">作物类型</label>
          <div class="row-content chips-row">
            <span
              v-for="crop in commonCrops"
              :key="crop.value"
              class="chip"
              :class="{ active: formData.cropTypes.includes(crop.value) }"
              @click="toggleCrop(crop.value)"
            >
              {{ crop.icon }} {{ crop.label }}
            </span>
          </div>
        </div>

        <!-- Growth stage -->
        <div class="setting-row">
          <label class="row-label">生长阶段</label>
          <div class="row-content pills-row">
            <span
              v-for="stage in stages"
              :key="stage.value"
              class="pill"
              :class="{ active: formData.growthStage === stage.value }"
              @click="formData.growthStage = stage.value"
            >
              {{ stage.icon }} {{ stage.label }}
            </span>
          </div>
        </div>

        <!-- Skills -->
        <div class="setting-row">
          <label class="row-label">技能</label>
          <div class="row-content skills-toggles">
            <div v-for="skill in allSkills" :key="skill.id" class="skill-toggle">
              <el-switch
                :model-value="formData.enabledSkillIds.includes(skill.id)"
                @change="(val) => toggleSkill(skill.id, val)"
                size="small"
              />
              <span class="skill-icon">{{ skill.icon }}</span>
              <span class="skill-name">{{ skill.name }}</span>
            </div>
          </div>
        </div>

        <!-- Prompt -->
        <div class="setting-row">
          <label class="row-label">自定义提示词</label>
          <div class="row-content">
            <el-input
              v-model="formData.customPrompt"
              type="textarea"
              :rows="2"
              placeholder="自定义智能体提示词..."
              maxlength="500"
              show-word-limit
              size="small"
            />
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <el-button type="primary" size="small" :loading="isSaving" @click="saveConfig" class="save-btn">
          保存设置
        </el-button>
      </div>

      <ConfigManager v-model:show="showConfigManager" @config-changed="onConfigChanged" />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useSkillsStore } from '@/stores/skills'
import { useSidebarStore } from '@/stores/sidebar'
import { ElMessage } from 'element-plus'
import { Close, Setting } from '@element-plus/icons-vue'
import ConfigManager from './ConfigManager.vue'
import { registeredSkills } from '@/skills'

defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close'])

const agentConfigStore = useAgentConfigStore()
const skillsStore = useSkillsStore()
const sidebarStore = useSidebarStore()
const isSaving = ref(false)
const showConfigManager = ref(false)
const selectedConfigId = ref(null)

const commonCrops = [
  { label: '玉米', value: 'corn', icon: '' },
  { label: '小麦', value: 'wheat', icon: '' },
  { label: '水稻', value: 'rice', icon: '' },
  { label: '番茄', value: 'tomato', icon: '' },
  { label: '黄瓜', value: 'cucumber', icon: '' },
  { label: '辣椒', value: 'pepper', icon: '' },
  { label: '苹果', value: 'apple', icon: '' },
  { label: '葡萄', value: 'grape', icon: '' },
]

const stages = [
  { label: '育苗期', value: 'seeding', icon: '' },
  { label: '生长期', value: 'growing', icon: '' },
  { label: '开花期', value: 'flowering', icon: '' },
  { label: '结果期', value: 'fruiting', icon: '' },
  { label: '成熟期', value: 'mature', icon: '' },
]

const allSkills = registeredSkills

const formData = ref({
  province: '',
  city: '',
  cropTypes: [],
  growthStage: 'growing',
  customPrompt: '',
  enabledSkillIds: [],
})

const configColumns = computed(() => {
  return agentConfigStore.configs.map((c) => ({ text: c.name, value: c.id }))
})

const toggleCrop = (val) => {
  const idx = formData.value.cropTypes.indexOf(val)
  if (idx >= 0) {
    formData.value.cropTypes.splice(idx, 1)
  } else {
    formData.value.cropTypes.push(val)
  }
}

const toggleSkill = (skillId, enabled) => {
  if (enabled) {
    if (!formData.value.enabledSkillIds.includes(skillId)) {
      formData.value.enabledSkillIds.push(skillId)
    }
  } else {
    formData.value.enabledSkillIds = formData.value.enabledSkillIds.filter((id) => id !== skillId)
  }
}

const loadCurrentConfig = () => {
  const currentConfig = agentConfigStore.currentConfig
  if (!currentConfig) return

  let enabledSkillIds = []
  try {
    if (typeof currentConfig.enabledSkillIds === 'string') {
      enabledSkillIds = JSON.parse(currentConfig.enabledSkillIds || '[]')
    } else if (Array.isArray(currentConfig.enabledSkillIds)) {
      enabledSkillIds = currentConfig.enabledSkillIds
    } else if (skillsStore.enabledSkillIds) {
      enabledSkillIds = skillsStore.enabledSkillIds
    }
  } catch {
    enabledSkillIds = []
  }

  formData.value = {
    province: currentConfig.province || '',
    city: currentConfig.city || '',
    cropTypes: JSON.parse(currentConfig.cropTypes || '[]'),
    growthStage: currentConfig.growthStage || 'growing',
    customPrompt: currentConfig.customPrompt || '',
    enabledSkillIds,
  }

  selectedConfigId.value = agentConfigStore.currentConfigId
}

const syncSkillsState = () => {
  skillsStore.enabledSkillIds = formData.value.enabledSkillIds
  const hasImageSkill = formData.value.enabledSkillIds.includes('disease-recognition')
  sidebarStore.setAgentImageUploadEnabled(hasImageSkill)
}

const onConfigSelect = async (configId) => {
  if (!configId) return
  const opt = configColumns.value.find((c) => c.value === configId)
  await agentConfigStore.switchConfig(configId)
  loadCurrentConfig()
  syncSkillsState()
  ElMessage.success(`已切换到「${opt?.text || ''}」`)
}

const onConfigChanged = () => {
  loadCurrentConfig()
  syncSkillsState()
}

const saveConfig = async () => {
  if (formData.value.cropTypes.length === 0) {
    ElMessage.warning('请至少选择一种作物')
    return
  }
  isSaving.value = true
  try {
    const configData = {
      name: agentConfigStore.currentConfig?.name || 'My Config',
      province: formData.value.province,
      city: formData.value.city,
      cropTypes: JSON.stringify(formData.value.cropTypes),
      growthStage: formData.value.growthStage,
      enableImageAnalysis: formData.value.enabledSkillIds.includes('disease-recognition'),
      enableFieldManagement: formData.value.enabledSkillIds.includes('field-management'),
      enablePesticideAdvice: formData.value.enabledSkillIds.includes('pesticide-advice'),
      customPrompt: formData.value.customPrompt,
      enabledSkillIds: JSON.stringify(formData.value.enabledSkillIds),
    }

    if (agentConfigStore.currentConfigId) {
      await agentConfigStore.updateConfig(agentConfigStore.currentConfigId, configData)
    } else {
      await agentConfigStore.createConfig({ ...configData, isDefault: true })
    }

    const currentEnabledIds = Array.isArray(skillsStore.enabledSkillIds) ? skillsStore.enabledSkillIds : []
    const toEnable = formData.value.enabledSkillIds.filter((id) => !currentEnabledIds.includes(id))
    const toDisable = currentEnabledIds.filter((id) => !formData.value.enabledSkillIds.includes(id))
    if (toEnable.length > 0) await skillsStore.enableSkills(toEnable)
    if (toDisable.length > 0) await skillsStore.disableSkills(toDisable)

    syncSkillsState()

    ElMessage.success('设置已保存')
    emit('close')
  } catch (err) {
    console.error('Save config failed:', err)
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (agentConfigStore.configs.length === 0) {
    await agentConfigStore.fetchConfigs()
  }
  if (skillsStore.availableSkills.length === 0) {
    await skillsStore.fetchSkills()
  }
  loadCurrentConfig()
})
</script>

<style lang="scss" scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom center;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(12px) scaleY(0.95);
}

.agent-settings-inline {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $float-shadow;
  margin-bottom: 8px;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid $border;

  .settings-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  .close-btn {
    color: $text-secondary;
    &:hover {
      color: $text-primary;
    }
  }
}

.settings-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.setting-row {
  .row-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .row-content {
    &.config-row {
      display: flex;
      gap: 8px;
      align-items: center;

      .config-select {
        flex: 1;
      }
    }

    &.chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    &.pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    &.skills-toggles {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid $border;
  background: $bg-main;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;
  user-select: none;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid $border;
  background: $bg-main;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;
  user-select: none;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    background: linear-gradient(135deg, $primary, $secondary);
    color: white;
    border-color: transparent;
  }
}

.skill-toggle {
  display: flex;
  align-items: center;
  gap: 8px;

  .skill-icon {
    font-size: 16px;
  }

  .skill-name {
    font-size: 13px;
    color: $text-primary;
  }
}

.settings-footer {
  padding: 8px 16px 12px;
  display: flex;
  justify-content: flex-end;

  .save-btn {
    min-width: 120px;
  }
}
</style>
