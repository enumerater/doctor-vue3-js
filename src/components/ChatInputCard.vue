<template>
  <div class="chat-input-card">
    <div class="card-header">
      <div class="header-left">
        <el-switch
          v-if="showAgentToggle"
          v-model="sidebarStore.isAgricultureAgent"
          active-text="Agent"
          inactive-text=""
          @change="handleAgentToggle"
          class="agent-switch"
        />

        <el-popover
          placement="bottom-start"
          :width="160"
          trigger="click"
          popper-class="model-popover"
        >
          <template #reference>
            <div class="model-selector">
              <span class="model-name">{{ chatStore.selectedModel }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
          </template>
          <div class="model-list">
            <div
              v-for="model in models"
              :key="model"
              class="model-option"
              :class="{ active: chatStore.selectedModel === model }"
              @click="chatStore.setSelectedModel(model)"
            >
              {{ model }}
            </div>
          </div>
        </el-popover>
      </div>
      <div class="header-right">
        <el-button
          v-if="sidebarStore.isAgricultureAgent"
          text
          size="small"
          @click="triggerImageUpload"
          class="action-btn"
        >
          <el-icon><Upload /></el-icon>
        </el-button>
        <el-button
          text
          size="small"
          @click="toggleRecording"
          class="action-btn voice-btn"
          :class="{ 'is-recording': isRecording }"
        >
          <el-icon :class="{ 'animate-pulse': isRecording }"><Microphone /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="card-body">
      <textarea
        ref="textareaRef"
        v-model="chatStore.inputValue"
        :placeholder="sidebarStore.isAgricultureAgent ? '描述问题、上传图片，Agent会思考并调用工具为您分析...' : '请输入您的问题...'"
        class="chat-textarea"
        rows="1"
        @input="autoResize"
        @keydown.enter.exact="handleEnter"
      ></textarea>
    </div>

    <div v-if="uploadedImages.length > 0" class="image-previews">
      <div v-for="(url, i) in uploadedImages" :key="i" class="preview-thumb">
        <img :src="url" alt="uploaded" />
        <span class="remove" @click="removeImage(i)">&times;</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-spacer"></div>
      <el-button
        type="primary"
        :disabled="!canSend"
        @click="handleSend"
        circle
        size="default"
        class="send-btn"
      >
        <el-icon><Promotion /></el-icon>
      </el-button>
    </div>

    <input
      type="file"
      ref="imageInput"
      style="display: none"
      accept="image/jpeg,image/png"
      @change="handleImageUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useSkillsStore } from '@/stores/skills'
import { upload as ossUpload } from '@/axios/oss'
import { compressImage } from '@/utils/image'
import { Upload, Promotion, ArrowDown, Microphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['send'])

const route = useRoute()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const skillsStore = useSkillsStore()

const models = ['qwen-flash', 'qwen3.5-flash', 'qwen3.5-plus', 'DeepSeek-V3.2', 'glm-5']

const textareaRef = ref(null)
const imageInput = ref(null)
const uploadedImages = ref([])

// Voice Recording State
const isRecording = ref(false)
let recognition = null

const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    ElMessage.warning('您的浏览器不支持语音识别')
    return null
  }

  const recog = new SpeechRecognition()
  recog.lang = 'zh-CN'
  recog.continuous = true
  recog.interimResults = true

  recog.onstart = () => {
    isRecording.value = true
  }

  recog.onresult = (event) => {
    let finalTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      }
    }
    if (finalTranscript) {
      chatStore.inputValue = (chatStore.inputValue || '') + finalTranscript
      autoResize()
    }
  }

  recog.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    isRecording.value = false
    if (event.error === 'not-allowed') {
      ElMessage.error('请允许麦克风访问权限')
    } else {
      ElMessage.error('语音识别出错: ' + event.error)
    }
  }

  recog.onend = () => {
    isRecording.value = false
  }

  return recog
}

const toggleRecording = () => {
  if (isRecording.value) {
    recognition?.stop()
    return
  }

  if (!recognition) {
    recognition = initSpeechRecognition()
  }

  if (recognition) {
    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      recognition = initSpeechRecognition() // Re-init on error
      recognition?.start()
    }
  }
}

onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
})

const canSend = computed(() => {
  return !!(chatStore.inputValue?.trim()) || uploadedImages.value.length > 0
})

const showAgentToggle = computed(() => {
  // 1. 如果是初始对话页面 (chatHome)，显示开关允许模式选择
  if (route.name === 'chatHome') return true
  
  // 2. 如果是详情页 (chatDetail)
  if (route.name === 'chatDetail') {
    const chatStore = useChatStore()
    // 只有在消息列表为空（即刚创建、尚未正式提问的新会话）时，才允许初始选择模式
    if (chatStore.chatMessages.length === 0) return true
    
    // 一旦有了对话记录，模式即被固定，隐藏切换开关，禁止中途更改模式
    return false
  }
  
  return false
})

const handleAgentToggle = async (val) => {
  if (val) {
    const hasImageSkill = skillsStore.isSkillEnabled('disease-recognition')
    sidebarStore.agentImageUploadEnabled = hasImageSkill
    chatStore.clearMessages()
  } else {
    sidebarStore.agentImageUploadEnabled = false
  }
}

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  const maxHeight = 6 * 24 // ~6 rows
  el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
}

const handleEnter = (e) => {
  if (e.isComposing) return
  e.preventDefault()
  handleSend()
}

const handleSend = () => {
  const content = (chatStore.inputValue || '').trim()
  if (!content && uploadedImages.value.length === 0) return
  emit('send', content, [...uploadedImages.value])
  uploadedImages.value = []
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      ElMessage.warning('仅支持 JPG/PNG')
      return
    }
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      ElMessage.warning('图片不能超过 20MB')
      return
    }

    let fileToUpload = file
    // 压缩大于 2MB 的图片
    if (file.size > 2 * 1024 * 1024) {
      const loading = ElMessage({
        message: '图片压缩中...',
        type: 'info',
        duration: 0
      })
      try {
        fileToUpload = await compressImage(file, { maxSizeMB: 2 })
        loading.close()
      } catch (error) {
        console.error('图片压缩失败:', error)
        loading.close()
      }
    }

    const res = await ossUpload(fileToUpload)
    uploadedImages.value.push(res.data.url)
    if (imageInput.value) imageInput.value.value = ''
  } catch (error) {
    console.error('上传出错:', error)
    ElMessage.error('图片上传失败')
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

// Allow parent to set images (for auto-send transfer)
const setImages = (images) => {
  uploadedImages.value = images
}

defineExpose({ setImages, uploadedImages })
</script>

<style lang="scss" scoped>
.chat-input-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $float-shadow;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @include mobile {
    border-radius: $radius-md;
    padding: 10px 12px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    color: $text-secondary;
    padding: 4px 8px;

    &:hover {
      color: $primary;
    }

    &.voice-btn {
      &.is-recording {
        color: $danger;
        background: rgba($danger, 0.1);
        border-radius: 50%;
      }
    }
  }
}

.agent-switch {
  :deep(.el-switch__label) {
    font-size: 12px;
  }
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba($primary, 0.05);
  border: 1px solid rgba($primary, 0.1);
  transition: $transition-fast;
  user-select: none;
  margin-left: 12px;

  .model-name {
    font-size: 12px;
    color: $primary;
    font-weight: 600;
  }

  .arrow-icon {
    font-size: 12px;
    color: $primary;
    transition: transform 0.2s;
  }

  &:hover {
    background: rgba($primary, 0.1);
    border-color: rgba($primary, 0.2);
  }
}

.card-body {
  .chat-textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
    line-height: 1.6;
    color: $text-primary;
    background: transparent;
    font-family: $font-family;
    min-height: 24px;
    max-height: 144px; // ~6 rows
    overflow-y: auto;
    -webkit-appearance: none;

    @include mobile {
      font-size: 16px; // Prevent iOS zoom on focus
      max-height: 120px;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }
}

.image-previews {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .preview-thumb {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: $danger;
      color: #fff;
      border-radius: 50%;
      @include flex-center;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .footer-spacer {
    flex: 1;
  }

  .send-btn {
  flex-shrink: 0;
  }
  }
  </style>

  <style lang="scss">
  .model-popover {
  padding: 4px 0 !important;
  border-radius: $radius-sm !important;
  box-shadow: $shadow-lg !important;
  border: 1px solid rgba($primary, 0.1) !important;

  .model-list {
  display: flex;
  flex-direction: column;
  padding: 2px 0;

  .model-option {
    padding: 10px 16px;
    font-size: 13px;
    color: $text-primary;
    cursor: pointer;
    transition: $transition-fast;
    border-radius: 8px;
    margin: 2px 8px;

    &:hover {
      background: rgba($primary, 0.05);
      color: $primary;
    }

    &.active {
      color: #fff;
      font-weight: 500;
      background: $primary;
      box-shadow: 0 4px 12px rgba($primary, 0.2);
    }
  }
  }
  }
  </style>
