<template>
  <div class="disease-detection-container">
    <!-- Core content area -->
    <main class="main-content">
      <!-- Upload section -->
      <section class="upload-section">
        <div class="upload-card">
          <h2 class="card-title">
            <el-icon :size="20"><Upload /></el-icon>
            上传检测图片
          </h2>
          <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover="handleDragOver"
            @dragleave="handleDragLeave" :class="{ 'upload-area--dragging': isDragging }">
            <div v-if="!uploadedImage" class="upload-placeholder">
              <div class="upload-icon-wrapper">
                <el-icon :size="56" color="var(--text-secondary)"><UploadFilled /></el-icon>
              </div>
              <p class="upload-desc">点击或拖拽图片至此处上传</p>
              <p class="upload-tip">支持 JPG、PNG 格式，最大 5MB</p>
            </div>

            <div v-else class="image-preview">
              <img :src="uploadedImage" alt="上传的病害图片" class="preview-img" />
              <button class="remove-img-btn" @click.stop="clearImage">
                <el-icon :size="16"><Close /></el-icon>
              </button>
            </div>

            <input type="file" ref="fileInput" class="file-input" accept="image/jpeg,image/png"
              @change="handleFileChange" />
          </div>

          <!-- Detecting status -->
          <div v-if="isDetecting" class="detecting-status">
            <div class="status-header">
              <div class="status-icon">
                <el-icon :size="24" class="spinner" color="#fff"><Loading /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-title">正在识别中...</div>
                <div class="status-time">已用时：{{ formatTime(detectingElapsedTime) }}</div>
                <div class="status-tip">预计需要30-60秒，您可以继续操作其他功能</div>
              </div>
            </div>
            <el-progress
              :percentage="Math.min((detectingElapsedTime / 60) * 100, 95)"
              :show-text="false"
              :stroke-width="6"
              color="#4a9b5e"
            />
          </div>

          <el-button
            type="primary"
            size="large"
            class="detect-btn"
            @click="showCropSelect = true"
            :disabled="!uploadedImage || isDetecting"
            :loading="isDetecting"
          >
            <span v-if="!isDetecting">开始识别</span>
            <span v-else>识别中</span>
          </el-button>
        </div>
      </section>

      <!-- Structured result display -->
      <section class="result-section" v-if="structuredResult">
        <div class="result-card">
          <h2 class="card-title">
            <el-icon :size="20"><Document /></el-icon>
            识别结果
          </h2>

          <!-- Visual results area -->
          <div class="visual-result">
            <!-- Basic info card -->
            <div class="result-card-item basic-info">
              <div class="info-header">
                <el-icon :size="20" color="#4a9b5e"><InfoFilled /></el-icon>
                <h3 class="info-title">{{ structuredResult.hasDisease ? '病害基本信息' : '健康状态' }}</h3>
              </div>
              <div class="info-content">
                <div class="info-row">
                  <label>作物类型：</label>
                  <el-tag type="success" effect="light">{{ selectedCrop }}</el-tag>
                </div>

                <!-- Healthy display -->
                <div v-if="!structuredResult.hasDisease" class="info-row healthy-info">
                  <label>健康状态：</label>
                  <el-tag type="success" effect="dark">
                    <el-icon><CircleCheck /></el-icon>
                    健康
                  </el-tag>
                </div>
                <div v-if="!structuredResult.hasDisease" class="info-row">
                  <label>健康描述：</label>
                  <span class="value healthy-desc">{{ structuredResult.healthyDesc }}</span>
                </div>

                <!-- Disease display -->
                <div v-if="structuredResult.hasDisease" class="info-row">
                  <label>病害名称：</label>
                  <span class="value disease-name">{{ structuredResult.diseaseName }}</span>
                </div>
                <div v-if="structuredResult.hasDisease" class="info-row confidence-row">
                  <label>识别置信度：</label>
                  <div class="confidence-wrapper">
                    <el-progress
                      :percentage="structuredResult.confidence"
                      :stroke-width="10"
                      color="#4a9b5e"
                    />
                  </div>
                </div>
                <div v-if="structuredResult.hasDisease" class="info-row">
                  <label>病害等级：</label>
                  <el-tag :type="getSeverityType(structuredResult.severity)" effect="dark">
                    {{ structuredResult.severity }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- Disease symptoms -->
            <div v-if="structuredResult.hasDisease" class="result-card-item symptoms">
              <div class="info-header">
                <el-icon :size="20" color="#4299e1"><Warning /></el-icon>
                <h3 class="info-title">病害症状</h3>
              </div>
              <div class="info-content">
                <ul class="symptoms-list">
                  <li v-for="(symptom, index) in structuredResult.symptoms" :key="index">
                    {{ symptom }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Prevention methods -->
            <div v-if="structuredResult.hasDisease" class="result-card-item prevention">
              <div class="info-header">
                <el-icon :size="20" color="#9f7aea"><CircleCheck /></el-icon>
                <h3 class="info-title">防治方法</h3>
              </div>
              <div class="info-content">
                <div class="prevention-tabs">
                  <div class="tab-item" :class="{ active: activePreventionTab === tab.key }"
                    v-for="tab in preventionTabs" :key="tab.key" @click="activePreventionTab = tab.key">
                    {{ tab.name }}
                  </div>
                </div>
                <div class="prevention-content">
                  <ul v-if="activePreventionTab === 'agricultural'">
                    <li v-for="(method, index) in structuredResult.prevention.agricultural" :key="index">
                      {{ method }}
                    </li>
                  </ul>
                  <ul v-if="activePreventionTab === 'chemical'">
                    <li v-for="(method, index) in structuredResult.prevention.chemical" :key="index">
                      {{ method }}
                    </li>
                  </ul>
                  <ul v-if="activePreventionTab === 'biological'">
                    <li v-for="(method, index) in structuredResult.prevention.biological" :key="index">
                      {{ method }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="structuredResult.hasDisease && structuredResult.notes && structuredResult.notes.length"
              class="result-card-item notes">
              <div class="info-header">
                <el-icon :size="20" color="#ed8936"><WarningFilled /></el-icon>
                <h3 class="info-title">注意事项</h3>
              </div>
              <div class="info-content">
                <div class="notes-content">
                  {{ structuredResult.notes.join('；') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Markdown fallback -->
          <div class="markdown-fallback" v-if="markdownResult">
            <div class="fallback-title">详细说明</div>
            <div class="markdown-content" v-html="renderedMarkdown"></div>
          </div>

          <el-button
            type="primary"
            size="large"
            class="agent-analyze-btn"
            v-if="structuredResult?.hasDisease || markdownResult"
            @click="showAgentPopup = true"
          >
            <el-icon><Promotion /></el-icon>
            发送至Agent深入分析
          </el-button>
          <el-button size="large" class="reset-btn" @click="resetAll">重新检测</el-button>
        </div>
      </section>

      <!-- Markdown-only result fallback -->
      <section class="result-section" v-if="markdownResult && !structuredResult">
        <div class="result-card">
          <h2 class="card-title">
            <el-icon :size="20"><Document /></el-icon>
            识别结果
          </h2>
          <div class="markdown-content" v-html="renderedMarkdown"></div>
          <el-button
            type="primary"
            size="large"
            class="agent-analyze-btn"
            v-if="structuredResult?.hasDisease || markdownResult"
            @click="showAgentPopup = true"
          >
            <el-icon><Promotion /></el-icon>
            发送至Agent深入分析
          </el-button>
          <el-button size="large" class="reset-btn" @click="resetAll">重新检测</el-button>
        </div>
      </section>
    </main>

    <!-- Crop selection dialog (replaces custom modal) -->
    <el-dialog
      v-model="showCropSelect"
      title="选择作物类型"
      width="520px"
      :close-on-click-modal="true"
      align-center
      destroy-on-close
    >
      <div class="crop-grid">
        <div class="crop-item" v-for="(crop, index) in cropList" :key="index"
          :class="{ active: selectedCrop === crop.name }" @click="selectedCrop = crop.name">
          <span class="crop-icon">{{ crop.icon }}</span>
          <span class="crop-name">{{ crop.name }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCropSelect = false">取消</el-button>
        <el-button type="primary" @click="confirmCropSelect" :disabled="!selectedCrop">
          确认识别
        </el-button>
      </template>
    </el-dialog>

    <!-- Agent analysis popup -->
    <AgentTransferPopup v-model:visible="showAgentPopup" source="vision" :cropType="selectedCrop"
      :diseaseName="structuredResult?.diseaseName || ''" :severity="structuredResult?.severity || ''"
      :confidence="structuredResult?.confidence || 0" :imageUrl="visionStore.currentTask?.imageUrl || ''"
      :thumbnailUrl="uploadedImage" :defaultPrompt="visionAgentPrompt" @confirm="handleAgentTransferConfirm" />
  </div>
</template>

<script setup>
import { upload } from '@/axios/oss'
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVisionStore } from '@/stores/vision'
import { useSidebarStore } from '@/stores/sidebar'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import {
  Upload, UploadFilled, Close, Loading, Document,
  InfoFilled, CircleCheck, Warning, WarningFilled,
  Promotion
} from '@element-plus/icons-vue'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Router instance
const router = useRouter()
const visionStore = useVisionStore()
const sidebarStore = useSidebarStore()

// Reactive data
const fileInput = ref(null)
const uploadedImage = ref('')
const isDragging = ref(false)
const isDetecting = ref(false)
const showCropSelect = ref(false)
const selectedCrop = ref('')
const selectedFile = ref(null)
const markdownResult = ref('')
// Structured result
const structuredResult = ref(null)
// Prevention tabs
const preventionTabs = ref([
  { key: 'agricultural', name: '农业防治' },
  { key: 'chemical', name: '化学防治' },
  { key: 'biological', name: '生物防治' },
])
const activePreventionTab = ref('agricultural')

// Async task related
const detectingTaskId = ref(null)
const detectingStartTime = ref(null)
const detectingElapsedTime = ref(0)
const detectingTimer = ref(null)
const showAgentPopup = ref(false)

// Restore state from store
const restoreFromStore = () => {
  if (visionStore.currentTask) {
    const task = visionStore.currentTask

    if (task.imageUrl) {
      uploadedImage.value = task.imageUrl
    }

    if (task.cropType) {
      selectedCrop.value = task.cropType
    }

    if (task.result) {
      if (task.result.diseaseName && task.result.confidence) {
        structuredResult.value = task.result
      } else {
        markdownResult.value = task.result
      }
    }

    if (task.status === 'detecting') {
      isDetecting.value = true
      detectingTaskId.value = task.id
      detectingStartTime.value = task.startTime
      detectingElapsedTime.value = Math.floor((Date.now() - task.startTime) / 1000)
      startTimer()

      if (detectingElapsedTime.value > 60) {
        visionStore.failTask('识别超时，请重新识别')
        isDetecting.value = false
        stopTimer()
        ElMessage.warning('识别超时，请重新识别')
      }
    }
  }
}

// Computed: render Markdown to HTML
const renderedMarkdown = computed(() => {
  if (!markdownResult.value) return ''
  return marked.parse(markdownResult.value)
})

// Agent analysis default prompt
const visionAgentPrompt = computed(() => {
  const r = structuredResult.value
  if (r && r.hasDisease) {
    return (
      `我在${selectedCrop.value}上发现了${r.diseaseName}，严重程度为${r.severity}，置信度${r.confidence}%。` +
      `主要症状：${(r.symptoms || []).join('、')}。` +
      `请帮我进行深入分析，给出详细的防治方案和田间管理建议。`
    )
  }
  if (markdownResult.value) {
    const truncated =
      markdownResult.value.length > 500
        ? markdownResult.value.substring(0, 500) + '...'
        : markdownResult.value
    return `请对以下图片识别结果进行深入分析：\n\n${truncated}\n\n请给出详细的防治方案和田间管理建议。`
  }
  return ''
})

// Handle Agent transfer confirm
const handleAgentTransferConfirm = async ({ prompt, imageUrl }) => {
  showAgentPopup.value = false
  try {
    await sidebarStore.transferToAgent(prompt, imageUrl)
  } catch (err) {
    ElMessage.error('传递到Agent失败，请重试')
  }
}

// Crop list
const cropList = ref([
  { icon: '🌾', name: '小麦' },
  { icon: '🌽', name: '玉米' },
  { icon: '🍚', name: '水稻' },
  { icon: '🍐', name: '梨树' },
  { icon: '🍎', name: '苹果' },
  { icon: '🥜', name: '花生' },
  { icon: '🍠', name: '红薯' },
  { icon: '🫘', name: '大豆' },
  { icon: '🍇', name: '葡萄' },
])

// Trigger file input
const triggerFileInput = () => {
  fileInput.value.click()
}

// Handle file change
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    handleFileUpload(file)
  }
}

// File upload handling
const handleFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  const maxSize = 20 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning('仅支持上传 JPG/PNG 格式的图片！')
    return
  }

  if (file.size > maxSize) {
    ElMessage.warning('图片大小不能超过 10MB！')
    return
  }

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
    markdownResult.value = ''
    structuredResult.value = null
  }
  reader.readAsDataURL(file)
}

// Drag events
const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    handleFileUpload(file)
  }
}

// Clear image
const clearImage = () => {
  uploadedImage.value = ''
  markdownResult.value = ''
  structuredResult.value = null
  selectedCrop.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Confirm crop selection and start detection
const confirmCropSelect = () => {
  showCropSelect.value = false
  detectDisease()
}

import { imageChat } from '@/axios/chat'

// Get severity tag type for Element Plus
const getSeverityType = (severity) => {
  switch (severity) {
    case '轻微':
      return 'success'
    case '中度':
      return 'warning'
    case '重度':
      return 'danger'
    default:
      return 'info'
  }
}

// Start timer
const startTimer = () => {
  if (!detectingStartTime.value) {
    detectingStartTime.value = Date.now()
    detectingElapsedTime.value = 0
  }

  detectingTimer.value = setInterval(() => {
    detectingElapsedTime.value = Math.floor((Date.now() - detectingStartTime.value) / 1000)
    if (visionStore.currentTask && visionStore.currentTask.status === 'detecting') {
      visionStore.updateTaskElapsedTime()
    }
  }, 1000)
}

// Stop timer
const stopTimer = () => {
  if (detectingTimer.value) {
    clearInterval(detectingTimer.value)
    detectingTimer.value = null
  }
  detectingStartTime.value = null
  detectingElapsedTime.value = 0
}

// Format time display
const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// Disease detection logic
const detectDisease = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传图片！')
    return
  }

  // Upload image
  let imageUrl = ''
  try {
    const url = await upload(selectedFile.value)
    imageUrl = url.data.url
    console.log('图片上传成功：', imageUrl)
  } catch (error) {
    console.error('图片上传失败：', error)
    ElMessage.error('图片上传失败，请重试！')
    return
  }

  // Create task and save to store
  const taskId = visionStore.createTask(imageUrl, selectedCrop.value)
  detectingTaskId.value = taskId
  isDetecting.value = true

  // Start timer
  startTimer()

  // Show notification
  ElMessage.info({ message: '识别任务已开始，预计需要30-60秒', duration: 5000 })

  try {
    const res = await imageChat({
      url: imageUrl,
      cropType: selectedCrop.value,
    })

    // Check if task was cancelled
    if (detectingTaskId.value !== taskId || !visionStore.currentTask) {
      console.log('任务已被新任务替换，忽略此结果')
      return
    }

    // Parse structured data
    let resultData = null
    try {
      resultData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      if (resultData.hasDisease !== undefined) {
        structuredResult.value = resultData
        visionStore.completeTask(resultData)
      } else {
        markdownResult.value = res.data
        visionStore.completeTask(res.data)
      }
    } catch (e) {
      markdownResult.value = res.data
      visionStore.completeTask(res.data)
    }

    ElMessage.success('识别完成！结果已更新')

    // Auto-open Agent popup for diseases
    if (structuredResult.value && structuredResult.value.hasDisease) {
      setTimeout(() => {
        showAgentPopup.value = true
      }, 1500)
    }

    // Scroll to results
    setTimeout(() => {
      const resultSection = document.querySelector('.result-section')
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  } catch (error) {
    console.error('识别失败：', error)

    if (detectingTaskId.value !== taskId || !visionStore.currentTask) {
      return
    }

    visionStore.failTask(error.message || '识别失败')
    ElMessage.error('识别失败，请重试！')
  } finally {
    if (detectingTaskId.value === taskId) {
      isDetecting.value = false
      detectingTaskId.value = null
      stopTimer()
    }
  }
}

// Reset all state
const resetAll = () => {
  uploadedImage.value = ''
  markdownResult.value = ''
  structuredResult.value = null
  selectedCrop.value = ''
  selectedFile.value = null
  activePreventionTab.value = 'agricultural'
  isDetecting.value = false
  detectingTaskId.value = null
  stopTimer()
  visionStore.clearCurrentTask()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Watch store task state changes
watch(
  () => visionStore.currentTask?.elapsedTime,
  (newTime) => {
    if (newTime !== undefined && isDetecting.value) {
      detectingElapsedTime.value = newTime
    }
  },
)

// Restore state on mount
onMounted(() => {
  restoreFromStore()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
.disease-detection-container {
  min-height: 100%;
  background-color: $bg-main;
  font-family: $font-family;
  color: $text-primary;
  position: relative;
}

// Healthy status styles
.healthy-info {
  display: flex;
  align-items: center;
}

.healthy-desc {
  color: $text-secondary;
  line-height: 1.5;
}

// Main content area
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @include mobile {
    grid-template-columns: 1fr;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }
}

// Card common styles
.upload-card,
.result-card {
  @include card-base;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, $primary, $secondary);
  }

  @include card-hover;

  .card-title {
    font-size: 1.3rem;
    color: $primary;
    margin-bottom: 1.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $border;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    @include mobile {
      font-size: 1.15rem;
      margin-bottom: 1.5rem;
    }
  }
}

// Upload area
.upload-section {
  .upload-area {
    border: 2px dashed $border;
    border-radius: $radius-md;
    padding: 3.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: $transition;
    position: relative;
    margin-bottom: 1.75rem;
    background-color: rgba(245, 245, 247, 0.5);

    &--dragging {
      border-color: $primary;
      background-color: $primary-light;
      transform: scale(1.01);
    }

    .upload-placeholder {
      .upload-icon-wrapper {
        margin-bottom: 1.25rem;
      }

      .upload-desc {
        font-size: 1rem;
        color: $text-primary;
        margin: 0 0 0.75rem 0;
        font-weight: 500;
      }

      .upload-tip {
        font-size: 0.85rem;
        color: $text-tertiary;
        margin: 0;
      }
    }

    .image-preview {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      overflow: hidden;
      border-radius: $radius-sm;
      background-color: $bg-main;

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 1rem;
      }

      .remove-img-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        cursor: pointer;
        @include flex-center;
        transition: $transition;
        opacity: 0.8;

        &:hover {
          opacity: 1;
          background-color: #e53e3e;
          transform: scale(1.1);
        }
      }
    }

    .file-input {
      display: none;
    }
  }

  // Detecting status
  .detecting-status {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(56, 142, 60, 0.05), rgba(56, 142, 60, 0.1));
    border-radius: $radius-md;
    border: 1px solid rgba(56, 142, 60, 0.2);
    animation: fadeInUp 0.3s ease;

    .status-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;

      .status-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        @include flex-center;
        background: linear-gradient(135deg, $primary, $primary-hover);
        border-radius: 50%;
        color: white;

        .spinner {
          animation: spin 1s linear infinite;
        }
      }

      .status-info {
        flex: 1;

        .status-title {
          font-size: 1rem;
          font-weight: 600;
          color: $primary;
          margin-bottom: 0.5rem;
        }

        .status-time {
          font-size: 0.9rem;
          color: $text-secondary;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .status-tip {
          font-size: 0.85rem;
          color: $text-tertiary;
          line-height: 1.5;
        }
      }
    }
  }

  // Detection button
  .detect-btn {
    width: 100%;
    font-weight: 600;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    border-radius: $radius-md;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
    }
  }
}

// Result section styles
.result-section {
  .visual-result {
    margin-bottom: 2rem;

    .result-card-item {
      background-color: $bg-main;
      border-radius: $radius-md;
      padding: 1.25rem;
      margin-bottom: 1rem;
      border-left: 4px solid $primary;
      transition: $transition;

      &:hover {
        box-shadow: $shadow-sm;
        transform: translateY(-1px);
      }

      &.basic-info {
        border-left-color: $primary;
      }

      &.symptoms {
        border-left-color: #4299e1;
      }

      &.prevention {
        border-left-color: #9f7aea;
      }

      &.notes {
        border-left-color: #ed8936;
      }

      .info-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;

        .info-title {
          font-size: 1rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0;
        }
      }

      .info-content {
        font-size: 0.95rem;
        color: $text-secondary;

        .info-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;

          &:last-child {
            margin-bottom: 0;
          }

          label {
            width: 80px;
            color: $text-primary;
            font-weight: 500;
            flex-shrink: 0;
          }

          @include mobile {
            label {
              width: auto;
              margin-right: 0.75rem;
              white-space: nowrap;
            }
          }

          .value {
            flex: 1;
          }

          .disease-name {
            color: $primary;
            font-weight: 600;
            font-size: 1.05rem;
          }
        }

        .confidence-row {
          align-items: flex-start;

          .confidence-wrapper {
            flex: 1;
          }
        }

        @include mobile {
          .confidence-row {
            .confidence-wrapper {
              width: 100%;
            }
          }
        }

        .symptoms-list {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.5rem;
            position: relative;

            &:last-child {
              margin-bottom: 0;
            }

            &::before {
              content: '\2022';
              color: #4299e1;
              font-weight: bold;
              position: absolute;
              left: -1rem;
            }
          }
        }

        .prevention-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 1rem;
          border-bottom: 1px solid $border;
          padding-bottom: 0.5rem;

          .tab-item {
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: $transition;

            &.active {
              background-color: $primary-light;
              color: $primary;
              font-weight: 500;
            }

            &:hover:not(.active) {
              background-color: rgba(0, 0, 0, 0.03);
            }
          }
        }

        .prevention-content {
          ul {
            margin: 0;
            padding-left: 1.25rem;

            li {
              margin-bottom: 0.5rem;
              position: relative;

              &:last-child {
                margin-bottom: 0;
              }

              &::before {
                content: '\2713';
                color: #9f7aea;
                font-weight: bold;
                position: absolute;
                left: -1rem;
              }
            }
          }
        }

        .notes-content {
          line-height: 1.6;
          padding: 0.5rem;
          background-color: rgba(237, 137, 54, 0.05);
          border-radius: $radius-sm;
        }
      }
    }
  }

  // Markdown fallback
  .markdown-fallback {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px dashed $border;

    .fallback-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 0.75rem;
    }

    .markdown-content {
      line-height: 1.8;
      color: $text-secondary;
      font-size: 0.9rem;
    }
  }

  // Markdown content styles
  .markdown-content {
    line-height: 1.8;
    color: $text-secondary;
    font-size: 0.95rem;
    margin-bottom: 2rem;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      color: $primary;
      margin: 1.2rem 0 0.8rem;
      font-weight: 600;
    }

    :deep(p) {
      margin: 0.8rem 0;
      text-align: justify;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 1.5rem;
      margin: 0.8rem 0;
    }

    :deep(li) {
      margin: 0.4rem 0;
    }

    :deep(strong) {
      color: $primary;
      font-weight: 600;
    }

    :deep(em) {
      color: $text-primary;
    }

    :deep(pre) {
      background-color: $bg-main;
      padding: 1rem;
      border-radius: $radius-sm;
      overflow-x: auto;
      margin: 1rem 0;
    }

    :deep(code) {
      background-color: $primary-light;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      color: $primary;
      font-size: 0.9rem;
    }

    :deep(pre code) {
      background: none;
      padding: 0;
    }
  }

  // Agent analyze button
  .agent-analyze-btn {
    width: 100%;
    font-weight: 600;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    border-radius: $radius-md;
    margin-bottom: 0.75rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
    }
  }

  // Reset button
  .reset-btn {
    width: 100%;
    font-weight: 600;
    border-radius: $radius-md;
    background-color: $bg-main;
    color: $text-primary;
    border: 1px solid $border;

    &:hover {
      background-color: $primary-light;
      color: $primary;
      border-color: $primary-light;
      transform: translateY(-2px);
      box-shadow: $shadow-sm;
    }
  }
}

// Crop selection dialog grid
.crop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }

  .crop-item {
    padding: 1rem;
    border-radius: $radius-md;
    border: 1px solid $border;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: $transition;

    &:hover {
      border-color: $primary-light;
      background-color: $primary-light;
      transform: translateY(-2px);
    }

    &.active {
      border-color: $primary;
      background-color: $primary-light;
      color: $primary;
      font-weight: 500;
    }

    .crop-icon {
      font-size: 1.5rem;
    }

    .crop-name {
      font-size: 0.9rem;
    }
  }
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// Responsive
@include mobile {
  .upload-card,
  .result-card {
    padding: 1.5rem;
  }

  .upload-area {
    padding: 2.5rem 1rem !important;
  }

  .markdown-content {
    font-size: 0.9rem;
  }

  .result-card-item {
    padding: 1rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 4px;

    label {
      width: 100% !important;
      margin-bottom: 2px;
    }
  }
}
</style>
