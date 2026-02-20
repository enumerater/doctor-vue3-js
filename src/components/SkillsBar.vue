<template>
  <div v-if="enabledSkills.length > 0" class="skills-bar">
    <!-- 快捷技能按钮 -->
    <div class="skills-buttons">
      <el-button v-for="skill in enabledSkills" :key="skill.id" size="small" plain
        :loading="isSkillExecuting(skill.id)" @click="onSkillClick(skill)">
        <template v-if="skill.icon" #icon>
          <span class="skill-btn-icon">{{ skill.icon }}</span>
        </template>
        {{ skill.name }}
      </el-button>
    </div>

    <!-- Skill参数输入对话框 -->
    <el-drawer v-model="showParamDialog" direction="btt" :size="'auto'" class="param-drawer">
      <template #header>
        <div v-if="selectedSkill" class="dialog-header">
          <span class="skill-icon">{{ selectedSkill.icon }}</span>
          <h3>{{ selectedSkill.name }}</h3>
        </div>
      </template>

      <div v-if="selectedSkill" class="param-dialog">
        <div class="dialog-content">
          <p class="skill-description">{{ selectedSkill.description }}</p>

          <!-- 动态参数表单 -->
          <el-form class="param-form" label-position="top">
            <div v-for="param in selectedSkill.params" :key="param.name" class="param-field">
              <!-- 文本输入 -->
              <el-form-item v-if="param.type === 'text'" :label="param.description"
                :required="param.required">
                <el-input v-model="paramValues[param.name]"
                  :placeholder="param.placeholder" />
              </el-form-item>

              <!-- 数字输入 -->
              <el-form-item v-else-if="param.type === 'number'" :label="param.description"
                :required="param.required">
                <el-input v-model.number="paramValues[param.name]" type="number"
                  :placeholder="param.placeholder">
                  <template v-if="param.unit" #append>
                    <span class="unit-text">{{ param.unit }}</span>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 下拉选择 -->
              <el-form-item v-else-if="param.type === 'select'" :label="param.description"
                :required="param.required">
                <el-select v-model="paramValues[param.name]"
                  :placeholder="param.placeholder || '请选择'" style="width: 100%">
                  <el-option v-for="opt in normalizeOptions(param.options)" :key="opt.value"
                    :label="opt.text" :value="opt.value" />
                </el-select>
              </el-form-item>

              <!-- 文件上传 -->
              <div v-else-if="param.type === 'file'" class="file-field">
                <div class="field-label">
                  {{ param.description }}
                  <span v-if="param.required" class="required-mark">*</span>
                </div>
                <el-upload :accept="param.accept" :limit="1" :auto-upload="false"
                  :on-change="(file) => onFileChange(file, param)">
                  <el-button type="primary" size="small">
                    <el-icon><Upload /></el-icon>
                    选择文件
                  </el-button>
                </el-upload>
              </div>

              <!-- 文本域 -->
              <el-form-item v-else-if="param.type === 'textarea'" :label="param.description"
                :required="param.required">
                <el-input v-model="paramValues[param.name]" type="textarea"
                  :placeholder="param.placeholder" :rows="3" autosize />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div class="dialog-footer">
          <el-button type="primary" :loading="executing" style="width: 100%" @click="executeSkill">
            执行
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- Skill执行结果展示 -->
    <el-dialog v-model="showResultDialog" :width="'90%'" class="result-el-dialog" :show-close="false"
      align-center>
      <template #header>
        <div v-if="skillResult" class="result-header">
          <h3>{{ skillResult.skillName }}</h3>
          <el-icon class="close-icon" :size="20" @click="closeResultDialog"><Close /></el-icon>
        </div>
      </template>

      <div v-if="skillResult" class="result-content">
        <div v-if="skillResult.success" class="result-success">
          <el-icon color="#07c160" :size="48"><CircleCheckFilled /></el-icon>
          <div class="result-message" v-html="formatMessage(skillResult.message)" />
        </div>
        <div v-else class="result-error">
          <el-icon color="#ee0a24" :size="48"><CircleCloseFilled /></el-icon>
          <p>{{ skillResult.message || '执行失败' }}</p>
        </div>
      </div>

      <template #footer>
        <div class="result-footer">
          <el-button style="width: 100%" @click="closeResultDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { ElMessage } from 'element-plus'
import { Upload, Close, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { executeSkill as execSkill } from '@/skills'

const skillsStore = useSkillsStore()
const agentConfigStore = useAgentConfigStore()

const emit = defineEmits(['skill-execute', 'skill-result'])

// 启用的skills
const enabledSkills = computed(() => skillsStore.enabledSkills)

// Skill执行状态
const isSkillExecuting = (skillId) => skillsStore.isSkillExecuting(skillId)

// 参数对话框
const showParamDialog = ref(false)
const selectedSkill = ref(null)
const paramValues = ref({})
const executing = ref(false)

// 结果对话框
const showResultDialog = ref(false)
const skillResult = ref(null)

// 规范化选项格式（用于 el-select）
const normalizeOptions = (options) => {
  if (!options) return []
  return options.map(opt => {
    if (typeof opt === 'object') {
      return opt
    }
    return { text: opt, value: opt }
  })
}

// 点击skill按钮
const onSkillClick = (skill) => {
  selectedSkill.value = skill
  paramValues.value = {}

  // 设置默认值
  if (skill.params) {
    skill.params.forEach(param => {
      if (param.default !== undefined) {
        paramValues.value[param.name] = param.default
      }
    })
  }

  // 如果skill没有参数，直接执行
  if (!skill.params || skill.params.length === 0) {
    executeSkill()
  } else {
    showParamDialog.value = true
  }
}

// 文件选择回调（el-upload on-change）
const onFileChange = (uploadFile, param) => {
  paramValues.value[param.name] = uploadFile.raw
}

// 执行skill
const executeSkill = async () => {
  if (!selectedSkill.value) return

  executing.value = true
  try {
    // 构建执行上下文
    const context = {
      agentConfig: agentConfigStore.currentConfig,
      conversation: null // 如果有会话上下文，可以传入
    }

    // 触发执行事件
    emit('skill-execute', {
      skillId: selectedSkill.value.id,
      params: paramValues.value
    })

    // 执行skill
    const result = await execSkill(
      selectedSkill.value.id,
      paramValues.value,
      context
    )

    // 保存结果
    skillResult.value = {
      skillId: selectedSkill.value.id,
      skillName: selectedSkill.value.name,
      ...result
    }

    // 触发结果事件
    emit('skill-result', skillResult.value)

    // 关闭参数对话框
    showParamDialog.value = false

    // 显示结果对话框
    showResultDialog.value = true
  } catch (err) {
    ElMessage.warning(err.message || 'Skill执行失败')
  } finally {
    executing.value = false
  }
}

// 关闭参数对话框
const closeParamDialog = () => {
  showParamDialog.value = false
  selectedSkill.value = null
  paramValues.value = {}
}

// 关闭结果对话框
const closeResultDialog = () => {
  showResultDialog.value = false
}

// 格式化消息（支持markdown）
const formatMessage = (message) => {
  if (!message) return ''

  // 简单的markdown转HTML
  return message
    .replace(/## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/- (.*?)$/gm, '<li>$1</li>')
    .replace(/^\| (.*?) \|$/gm, '<tr><td>$1</td></tr>')
    .replace(/\n/g, '<br>')
}

// 监听@命令（从外部触发）
const handleCommand = (commandText) => {
  const { parseSkillCommand } = require('@/skills')
  const command = parseSkillCommand(commandText)

  if (command) {
    const skill = enabledSkills.value.find(s => s.id === command.skillId)
    if (skill) {
      onSkillClick(skill)
    }
  }
}

// 暴露方法供外部调用
defineExpose({
  handleCommand
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.skills-bar {
  .skills-buttons {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: $bg-card;
    border-top: 1px solid $border;
    overflow-x: auto;
    white-space: nowrap;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border;
      border-radius: 2px;
    }

    .el-button {
      flex-shrink: 0;
    }

    .skill-btn-icon {
      margin-right: 4px;
    }
  }
}

.param-dialog {
  display: flex;
  flex-direction: column;
  max-height: 80vh;

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px 16px;

    .skill-description {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: $text-secondary;
    }

    .param-form {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .param-field {
        .file-field {
          .field-label {
            font-size: 14px;
            color: $text-primary;
            margin-bottom: 8px;

            .required-mark {
              color: $danger;
              margin-left: 4px;
            }
          }
        }

        .unit-text {
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }
  }

  .dialog-footer {
    padding: 16px;
    border-top: 1px solid $border;

    :deep(.el-button) {
      height: 44px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

// Drawer header styling
:deep(.param-drawer) {
  border-radius: $radius-md $radius-md 0 0;

  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px;
    border-bottom: 1px solid $border;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .skill-icon {
    font-size: 24px;
  }

  h3 {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }
}

// Result dialog styling
:deep(.result-el-dialog) {
  border-radius: $radius-md;
  max-height: 80%;

  .el-dialog__header {
    padding: 16px;
    margin-right: 0;
    border-bottom: 1px solid $border;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 0;
  }
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }

  .close-icon {
    cursor: pointer;
    color: $text-secondary;
  }
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .result-success,
  .result-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .result-message {
      width: 100%;
      font-size: 14px;
      line-height: 1.6;
      color: $text-primary;

      :deep(h2) {
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 8px 0;
      }

      :deep(h3) {
        font-size: 14px;
        font-weight: 600;
        margin: 12px 0 8px 0;
      }

      :deep(strong) {
        font-weight: 600;
        color: $primary;
      }

      :deep(li) {
        margin-left: 20px;
        list-style: disc;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;

        tr {
          border-bottom: 1px solid $border;

          td {
            padding: 8px;
            font-size: 13px;
          }
        }
      }
    }

    p {
      text-align: center;
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

.result-footer {
  padding: 16px;
  border-top: 1px solid $border;

  :deep(.el-button) {
    height: 44px;
  }
}
</style>
