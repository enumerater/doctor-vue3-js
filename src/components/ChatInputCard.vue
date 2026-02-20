<template>
  <div class="chat-input-card">
    <div class="card-header">
      <div class="header-left">
        <el-switch
          v-model="sidebarStore.isAgricultureAgent"
          active-text="Agent"
          inactive-text=""
          @change="handleAgentToggle"
          class="agent-switch"
        />
      </div>
      <div class="header-right">
        <el-button
          v-if="sidebarStore.isAgricultureAgent && sidebarStore.agentImageUploadEnabled"
          text
          size="small"
          @click="triggerImageUpload"
          class="action-btn"
        >
          <el-icon><Upload /></el-icon>
        </el-button>
        <el-button
          v-if="sidebarStore.isAgricultureAgent"
          text
          size="small"
          @click="$emit('toggle-settings')"
          class="action-btn"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="card-body">
      <textarea
        ref="textareaRef"
        v-model="chatStore.inputValue"
        placeholder="请输入您的问题..."
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
import { ref, computed, nextTick, watch } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useSkillsStore } from '@/stores/skills'
import { upload as ossUpload } from '@/axios/oss'
import { Upload, Setting, Promotion } from '@element-plus/icons-vue'

const emit = defineEmits(['send', 'toggle-settings'])

const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const skillsStore = useSkillsStore()

const textareaRef = ref(null)
const imageInput = ref(null)
const uploadedImages = ref([])

const canSend = computed(() => {
  return !!(chatStore.inputValue?.trim()) || uploadedImages.value.length > 0
})

const handleAgentToggle = (val) => {
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
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.warning('图片不能超过10MB')
      return
    }
    const res = await ossUpload(file)
    uploadedImages.value.push(res.data.url)
    if (imageInput.value) imageInput.value.value = ''
  } catch {
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
  }
}

.agent-switch {
  :deep(.el-switch__label) {
    font-size: 12px;
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
