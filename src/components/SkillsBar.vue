<template>
  <div v-if="enabledSkills.length > 0" class="skills-bar">
    <!-- 快捷技能按钮 -->
    <div class="skills-buttons">
      <van-button v-for="skill in enabledSkills" :key="skill.id" size="small" plain :icon="skill.icon"
        :loading="isSkillExecuting(skill.id)" @click="onSkillClick(skill)">
        {{ skill.name }}
      </van-button>
    </div>

    <!-- Skill参数输入对话框 -->
    <van-popup v-model:show="showParamDialog" position="bottom" round :style="{ maxHeight: '80%' }">
      <div v-if="selectedSkill" class="param-dialog">
        <div class="dialog-header">
          <span class="skill-icon">{{ selectedSkill.icon }}</span>
          <h3>{{ selectedSkill.name }}</h3>
          <van-icon name="cross" size="20" @click="closeParamDialog" />
        </div>

        <div class="dialog-content">
          <p class="skill-description">{{ selectedSkill.description }}</p>

          <!-- 动态参数表单 -->
          <div class="param-form">
            <div v-for="param in selectedSkill.params" :key="param.name" class="param-field">
              <!-- 文本输入 -->
              <van-field v-if="param.type === 'text'" v-model="paramValues[param.name]" :label="param.description"
                :placeholder="param.placeholder" :required="param.required" />

              <!-- 数字输入 -->
              <van-field v-else-if="param.type === 'number'" v-model.number="paramValues[param.name]" type="number"
                :label="param.description" :placeholder="param.placeholder" :required="param.required">
                <template v-if="param.unit" #button>
                  <span class="unit-text">{{ param.unit }}</span>
                </template>
              </van-field>

              <!-- 下拉选择 -->
              <van-field v-else-if="param.type === 'select'" v-model="paramValues[param.name]" readonly clickable
                :label="param.description" :placeholder="param.placeholder || '请选择'" :required="param.required"
                right-icon="arrow-down" @click="openSelectPicker(param)" />

              <!-- 文件上传 -->
              <div v-else-if="param.type === 'file'" class="file-field">
                <div class="field-label">
                  {{ param.description }}
                  <span v-if="param.required" class="required-mark">*</span>
                </div>
                <van-uploader v-model="paramValues[param.name]" :accept="param.accept" :max-count="1"
                  :after-read="(file) => onFileRead(file, param)">
                  <van-button icon="photograph" type="primary" size="small">
                    选择文件
                  </van-button>
                </van-uploader>
              </div>

              <!-- 文本域 -->
              <van-field v-else-if="param.type === 'textarea'" v-model="paramValues[param.name]" type="textarea"
                :label="param.description" :placeholder="param.placeholder" :required="param.required" rows="3"
                autosize />
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <van-button block type="primary" :loading="executing" @click="executeSkill">
            执行
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showSelectPicker" position="bottom" round>
      <van-picker :columns="selectOptions" @confirm="onSelectConfirm" @cancel="showSelectPicker = false" />
    </van-popup>

    <!-- Skill执行结果展示 -->
    <van-popup v-model:show="showResultDialog" position="center" round :style="{ width: '90%', maxHeight: '80%' }">
      <div v-if="skillResult" class="result-dialog">
        <div class="result-header">
          <h3>{{ skillResult.skillName }}</h3>
          <van-icon name="cross" size="20" @click="closeResultDialog" />
        </div>

        <div class="result-content">
          <div v-if="skillResult.success" class="result-success">
            <van-icon name="checked" color="#07c160" size="48" />
            <div class="result-message" v-html="formatMessage(skillResult.message)" />
          </div>
          <div v-else class="result-error">
            <van-icon name="close" color="#ee0a24" size="48" />
            <p>{{ skillResult.message || '执行失败' }}</p>
          </div>
        </div>

        <div class="result-footer">
          <van-button block @click="closeResultDialog">关闭</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { showToast } from 'vant'
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

// 选择器
const showSelectPicker = ref(false)
const selectOptions = ref([])
const currentSelectParam = ref(null)

// 结果对话框
const showResultDialog = ref(false)
const skillResult = ref(null)

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

// 打开选择器
const openSelectPicker = (param) => {
  currentSelectParam.value = param
  selectOptions.value = param.options.map(opt => {
    if (typeof opt === 'object') {
      return opt
    }
    return { text: opt, value: opt }
  })
  showSelectPicker.value = true
}

// 选择器确认
const onSelectConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0]
  paramValues.value[currentSelectParam.value.name] = selected.value
  showSelectPicker.value = false
}

// 文件读取
const onFileRead = (file, param) => {
  // file可能是数组或单个文件对象
  const fileObj = Array.isArray(file) ? file[0] : file
  paramValues.value[param.name] = fileObj.file
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
    showToast({
      message: err.message || 'Skill执行失败',
      position: 'top'
    })
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

    .van-button {
      flex-shrink: 0;
    }
  }
}

.param-dialog {
  display: flex;
  flex-direction: column;
  max-height: 80vh;

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid $border;

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

    .van-icon {
      cursor: pointer;
      color: $text-secondary;
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

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
              color: $danger-color;
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

    :deep(.van-button) {
      height: 44px;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.result-dialog {
  display: flex;
  flex-direction: column;

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
    }

    .van-icon {
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
          color: $primary-color;
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

    :deep(.van-button) {
      height: 44px;
    }
  }
}
</style>
