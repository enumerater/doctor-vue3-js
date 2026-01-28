<template>
  <div class="disease-detection-container">
    <!-- 极简返回按钮导航栏 -->
    <nav class="nav-header">
      <div class="nav-container">
        <button class="back-btn" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="back-text">返回</span>
        </button>
      </div>
    </nav>

    <!-- 核心内容区 -->
    <main class="main-content">
      <!-- 上传区域 -->
      <section class="upload-section">
        <div class="upload-card">
          <h2 class="card-title">上传检测图片</h2>
          <div
            class="upload-area"
            @click="triggerFileInput"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            :class="{ 'upload-area--dragging': isDragging }"
          >
            <div v-if="!uploadedImage" class="upload-placeholder">
              <div class="upload-icon-wrapper">
                <svg
                  class="upload-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 5L12 12L5 5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <p class="upload-desc">点击或拖拽图片至此处上传</p>
              <p class="upload-tip">支持 JPG、PNG 格式，最大 5MB</p>
            </div>

            <div v-else class="image-preview">
              <img :src="uploadedImage" alt="上传的病害图片" class="preview-img" />
              <button class="remove-img-btn" @click="clearImage">×</button>
            </div>

            <input
              type="file"
              ref="fileInput"
              class="file-input"
              accept="image/jpeg,image/png"
              @change="handleFileChange"
            />
          </div>

          <!-- 识别状态提示 -->
          <div v-if="isDetecting" class="detecting-status">
            <div class="status-header">
              <div class="status-icon">
                <svg
                  class="spinner"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-dasharray="31.416"
                    stroke-dashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
              <div class="status-info">
                <div class="status-title">正在识别中...</div>
                <div class="status-time">已用时：{{ formatTime(detectingElapsedTime) }}</div>
                <div class="status-tip">预计需要30-60秒，您可以继续操作其他功能</div>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: Math.min((detectingElapsedTime / 60) * 100, 95) + '%' }"
              ></div>
            </div>
          </div>

          <button
            class="detect-btn"
            @click="showCropSelect = true"
            :disabled="!uploadedImage || isDetecting"
          >
            <span v-if="!isDetecting"> 开始识别 </span>
            <span v-else class="loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              识别中
            </span>
          </button>
        </div>
      </section>

      <!-- 识别结果：结构化可视化展示 -->
      <section class="result-section" v-if="structuredResult">
        <div class="result-card">
          <h2 class="card-title">识别结果</h2>

          <!-- 可视化结果区域 -->
          <div class="visual-result">
            <!-- 病害基本信息卡片 -->
            <div class="result-card-item basic-info">
              <div class="info-header">
                <svg
                  class="info-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 6V12L16 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="info-title">病害基本信息</h3>
              </div>
              <div class="info-content">
                <div class="info-row">
                  <label>作物类型：</label>
                  <span class="value crop-type">{{ selectedCrop }}</span>
                </div>
                <div class="info-row">
                  <label>病害名称：</label>
                  <span class="value disease-name">{{ structuredResult.diseaseName }}</span>
                </div>
                <div class="info-row confidence-row">
                  <label>识别置信度：</label>
                  <div class="confidence-wrapper">
                    <div
                      class="confidence-bar"
                      :style="{ width: structuredResult.confidence + '%' }"
                    ></div>
                    <span class="confidence-value">{{ structuredResult.confidence }}%</span>
                  </div>
                </div>
                <div class="info-row">
                  <label>病害等级：</label>
                  <span
                    class="value severity-tag"
                    :class="getSeverityClass(structuredResult.severity)"
                  >
                    {{ structuredResult.severity }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 病害症状描述 -->
            <div class="result-card-item symptoms">
              <div class="info-header">
                <svg
                  class="info-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 16V12M12 8H12.01"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
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

            <!-- 防治方法 -->
            <div class="result-card-item prevention">
              <div class="info-header">
                <svg
                  class="info-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="info-title">防治方法</h3>
              </div>
              <div class="info-content">
                <div class="prevention-tabs">
                  <div
                    class="tab-item"
                    :class="{ active: activePreventionTab === tab.key }"
                    v-for="tab in preventionTabs"
                    :key="tab.key"
                    @click="activePreventionTab = tab.key"
                  >
                    {{ tab.name }}
                  </div>
                </div>
                <div class="prevention-content">
                  <ul v-if="activePreventionTab === 'agricultural'">
                    <li
                      v-for="(method, index) in structuredResult.prevention.agricultural"
                      :key="index"
                    >
                      {{ method }}
                    </li>
                  </ul>
                  <ul v-if="activePreventionTab === 'chemical'">
                    <li
                      v-for="(method, index) in structuredResult.prevention.chemical"
                      :key="index"
                    >
                      {{ method }}
                    </li>
                  </ul>
                  <ul v-if="activePreventionTab === 'biological'">
                    <li
                      v-for="(method, index) in structuredResult.prevention.biological"
                      :key="index"
                    >
                      {{ method }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 注意事项 -->
            <div
              class="result-card-item notes"
              v-if="structuredResult.notes && structuredResult.notes.length"
            >
              <div class="info-header">
                <svg
                  class="info-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 8V12M12 16H12.01"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="info-title">注意事项</h3>
              </div>
              <div class="info-content">
                <div class="notes-content">
                  {{ structuredResult.notes.join('；') }}
                </div>
              </div>
            </div>
          </div>

          <!-- 兼容原有 Markdown 展示（可选） -->
          <div class="markdown-fallback" v-if="markdownResult">
            <div class="fallback-title">详细说明</div>
            <div class="markdown-content" v-html="renderedMarkdown"></div>
          </div>

          <button class="reset-btn" @click="resetAll">重新检测</button>
        </div>
      </section>

      <!-- 兼容纯 Markdown 结果的展示 -->
      <section class="result-section" v-if="markdownResult && !structuredResult">
        <div class="result-card">
          <h2 class="card-title">识别结果</h2>
          <div class="markdown-content" v-html="renderedMarkdown"></div>
          <button class="reset-btn" @click="resetAll">重新检测</button>
        </div>
      </section>
    </main>

    <!-- 通知提示 -->
    <transition name="notification">
      <div v-if="showNotification" class="notification-toast">
        <div class="notification-content">
          <svg
            class="notification-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="notification-text">{{ notificationMessage }}</span>
        </div>
      </div>
    </transition>

    <!-- 作物选择弹窗 -->
    <div class="crop-select-modal" v-if="showCropSelect">
      <div class="modal-mask" @click="showCropSelect = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">选择作物类型</h3>
          <button class="modal-close" @click="showCropSelect = false">×</button>
        </div>
        <div class="modal-body">
          <div class="crop-grid">
            <!-- 常见农作物选项 -->
            <div
              class="crop-item"
              v-for="(crop, index) in cropList"
              :key="index"
              :class="{ active: selectedCrop === crop.name }"
              @click="selectedCrop = crop.name"
            >
              <span class="crop-icon">{{ crop.icon }}</span>
              <span class="crop-name">{{ crop.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-cancel" @click="showCropSelect = false">取消</button>
          <button class="modal-confirm" @click="confirmCropSelect" :disabled="!selectedCrop">
            确认识别
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { upload } from '@/axios/oss'
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVisionStore } from '@/stores/vision'
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 路由实例
const router = useRouter()
const visionStore = useVisionStore()

// 响应式数据
const fileInput = ref(null)
const uploadedImage = ref('')
const isDragging = ref(false)
const isDetecting = ref(false)
const showCropSelect = ref(false)
const selectedCrop = ref('')
const selectedFile = ref(null)
const markdownResult = ref('')
// 新增：结构化结果存储
const structuredResult = ref(null)
// 防治方法标签页
const preventionTabs = ref([
  { key: 'agricultural', name: '农业防治' },
  { key: 'chemical', name: '化学防治' },
  { key: 'biological', name: '生物防治' },
])
const activePreventionTab = ref('agricultural')

// 异步任务相关
const detectingTaskId = ref(null) // 当前识别任务ID
const detectingStartTime = ref(null) // 识别开始时间
const detectingElapsedTime = ref(0) // 已用时间（秒）
const detectingTimer = ref(null) // 计时器
const showNotification = ref(false) // 显示通知
const notificationMessage = ref('') // 通知消息

// 从store恢复状态
const restoreFromStore = () => {
  if (visionStore.currentTask) {
    const task = visionStore.currentTask

    // 恢复图片
    if (task.imageUrl) {
      uploadedImage.value = task.imageUrl
    }

    // 恢复作物类型
    if (task.cropType) {
      selectedCrop.value = task.cropType
    }

    // 恢复识别结果
    if (task.result) {
      if (task.result.diseaseName && task.result.confidence) {
        structuredResult.value = task.result
      } else {
        markdownResult.value = task.result
      }
    }

    // 如果任务正在进行中，恢复状态
    if (task.status === 'detecting') {
      isDetecting.value = true
      detectingTaskId.value = task.id
      detectingStartTime.value = task.startTime
      detectingElapsedTime.value = task.elapsedTime
      startTimer()

      // 如果任务时间超过60秒，可能已经超时，标记为失败
      if (task.elapsedTime > 60) {
        visionStore.failTask('识别超时，请重新识别')
        isDetecting.value = false
        stopTimer()
        showTaskNotification('识别超时，请重新识别')
      }
      // 否则，任务可能还在进行中，显示提示但不重新调用API
      // （因为HTTP请求无法暂停和恢复）
    }
  }
}

// 计算属性：解析 Markdown 为 HTML
const renderedMarkdown = computed(() => {
  if (!markdownResult.value) return ''
  return marked.parse(markdownResult.value)
})

// 作物列表
const cropList = ref([
  { icon: '🌾', name: '小麦' },
  { icon: '🌽', name: '玉米' },
  { icon: '🍚', name: '水稻' },
  { icon: '🥬', name: '蔬菜' },
  { icon: '🍎', name: '果树' },
  { icon: '🍞', name: '大麦' },
  { icon: '🥜', name: '花生' },
  { icon: '🍠', name: '红薯' },
  { icon: '🫘', name: '大豆' },
  { icon: '🍇', name: '葡萄' },
])

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    handleFileUpload(file)
  }
}

// 文件上传处理
const handleFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    alert('仅支持上传 JPG/PNG 格式的图片！')
    return
  }

  if (file.size > maxSize) {
    alert('图片大小不能超过 5MB！')
    return
  }

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
    markdownResult.value = ''
    structuredResult.value = null // 清空结构化结果
  }
  reader.readAsDataURL(file)
}

// 拖拽事件处理
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

// 清空图片
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

// 确认作物选择并开始识别
const confirmCropSelect = () => {
  showCropSelect.value = false
  detectDisease()
}

import { imageChat } from '@/axios/chat'

// 获取病害等级样式类
const getSeverityClass = (severity) => {
  switch (severity) {
    case '轻微':
      return 'severity-mild'
    case '中度':
      return 'severity-moderate'
    case '重度':
      return 'severity-severe'
    default:
      return ''
  }
}

// 开始计时
const startTimer = () => {
  detectingStartTime.value = Date.now()
  detectingElapsedTime.value = 0
  detectingTimer.value = setInterval(() => {
    detectingElapsedTime.value = Math.floor((Date.now() - detectingStartTime.value) / 1000)
  }, 1000)
}

// 停止计时
const stopTimer = () => {
  if (detectingTimer.value) {
    clearInterval(detectingTimer.value)
    detectingTimer.value = null
  }
  detectingStartTime.value = null
  detectingElapsedTime.value = 0
}

// 显示通知
const showTaskNotification = (message) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

// 格式化时间显示
const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 病害识别逻辑：解析结构化数据（异步处理）
const detectDisease = async () => {
  if (!selectedFile.value) {
    alert('请先上传图片！')
    return
  }

  // 上传图片
  let imageUrl = ''
  try {
    const url = await upload(selectedFile.value)
    imageUrl = url.data.url
    console.log('图片上传成功：', imageUrl)
  } catch (error) {
    console.error('图片上传失败：', error)
    alert('图片上传失败，请重试！')
    return
  }

  // 创建任务并保存到store
  const taskId = visionStore.createTask(imageUrl, selectedCrop.value)
  detectingTaskId.value = taskId
  isDetecting.value = true

  // 开始计时
  startTimer()

  // 显示提示信息
  showTaskNotification('识别任务已开始，预计需要30-60秒，您可以继续操作其他功能')

  try {
    // 异步执行识别任务
    const res = await imageChat({
      url: imageUrl,
      cropType: selectedCrop.value,
    })

    // 检查任务是否被取消（用户可能开始了新任务）
    if (detectingTaskId.value !== taskId || !visionStore.currentTask) {
      console.log('任务已被新任务替换，忽略此结果')
      return
    }

    // 优先解析结构化数据（假设后端返回的res.data是JSON格式的结构化数据）
    // 如果后端返回的是字符串，可先尝试JSON.parse
    let resultData = null
    try {
      resultData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      // 验证是否为结构化数据
      if (resultData.diseaseName && resultData.confidence) {
        structuredResult.value = resultData
        visionStore.completeTask(resultData)
      } else {
        // 否则作为markdown处理
        markdownResult.value = res.data
        visionStore.completeTask(res.data)
      }
    } catch (e) {
      // 解析失败则作为markdown处理
      markdownResult.value = res.data
      visionStore.completeTask(res.data)
    }

    // 识别成功，显示通知
    showTaskNotification('识别完成！结果已更新')

    // 滚动到结果区域
    setTimeout(() => {
      const resultSection = document.querySelector('.result-section')
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  } catch (error) {
    console.error('识别失败：', error)

    // 检查任务是否被取消
    if (detectingTaskId.value !== taskId || !visionStore.currentTask) {
      return
    }

    visionStore.failTask(error.message || '识别失败')
    showTaskNotification('识别失败，请重试！')
    alert('识别失败，请重试！')
  } finally {
    // 只有当前任务才清除状态
    if (detectingTaskId.value === taskId) {
      isDetecting.value = false
      detectingTaskId.value = null
      stopTimer()
    }
  }
}

// 重置所有状态
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

// 监听store中的任务状态变化，更新本地显示
watch(
  () => visionStore.currentTask?.elapsedTime,
  (newTime) => {
    if (newTime !== undefined && isDetecting.value) {
      detectingElapsedTime.value = newTime
    }
  },
)

// 组件挂载时恢复状态
onMounted(() => {
  restoreFromStore()
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
// 使用全局 variables.scss

// 全局样式
.disease-detection-container {
  min-height: 100vh;
  background-color: $bg-main;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: $text-primary;
  position: relative;
}

// 导航栏
.nav-header {
  background-color: $bg-card;
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: 999;

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.25rem;
    display: flex;
    align-items: center;
    height: 56px;

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: $primary;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: $radius-sm;
      transition: $transition;

      &:hover {
        color: $primary-hover;
        background-color: $primary-light;
      }

      .back-icon {
        width: 18px;
        height: 18px;
      }

      .back-text {
        letter-spacing: 0.2px;
      }
    }
  }
}

// 主内容区
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }
}

// 卡片通用样式
.upload-card,
.result-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: 2rem;
  transition: $transition;
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

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }

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

    @media (max-width: 768px) {
      font-size: 1.15rem;
      margin-bottom: 1.5rem;
    }
  }
}

// 上传区域
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

      .upload-placeholder {
        .upload-icon {
          color: $primary;
          animation: pulse 1.5s infinite;
        }
      }
    }

    .upload-placeholder {
      .upload-icon-wrapper {
        margin-bottom: 1.25rem;

        .upload-icon {
          width: 56px;
          height: 56px;
          color: $text-secondary;
          transition: $transition;
        }
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
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
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

  // 识别状态提示区域
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
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, $primary, $primary-hover);
        border-radius: 50%;
        color: white;

        .spinner {
          width: 24px;
          height: 24px;
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

    .progress-bar {
      width: 100%;
      height: 6px;
      background-color: rgba(56, 142, 60, 0.1);
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, $primary, $primary-hover);
        border-radius: 3px;
        transition: width 1s ease;
        animation: progressPulse 2s ease-in-out infinite;
      }
    }
  }

  // 识别按钮
  .detect-btn {
    width: 100%;
    padding: 0.85rem 1rem;
    border: none;
    border-radius: $radius-md;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    background: linear-gradient(135deg, $primary, $primary-hover);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.3px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;

      .loading-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: white;
        animation: loading 1.4s infinite ease-in-out both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }

        &:nth-child(2) {
          animation-delay: -0.16s;
        }
      }
    }
  }
}

// 可视化结果样式（核心新增）
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

        .info-icon {
          width: 20px;
          height: 20px;
          color: inherit;
        }

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

          .value {
            flex: 1;
          }

          .crop-type {
            color: $primary;
            font-weight: 500;
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
            display: flex;
            flex-direction: column;
            gap: 4px;

            .confidence-bar {
              height: 8px;
              background: linear-gradient(90deg, $primary, $secondary);
              border-radius: 4px;
              transition: width 0.5s ease;
            }

            .confidence-value {
              font-size: 0.85rem;
              color: $primary;
              font-weight: 500;
            }
          }
        }

        .severity-tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;

          &.severity-mild {
            background-color: rgba(72, 187, 120, 0.1);
            color: $severity-mild;
          }

          &.severity-moderate {
            background-color: rgba(237, 137, 54, 0.1);
            color: $severity-moderate;
          }

          &.severity-severe {
            background-color: rgba(229, 62, 62, 0.1);
            color: $severity-severe;
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
              content: '•';
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
                content: '✓';
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

  // Markdown 降级展示样式
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

  // 原有 Markdown 样式
  .markdown-content {
    line-height: 1.8;
    color: $text-secondary;
    font-size: 0.95rem;
    margin-bottom: 2rem;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: $primary;
      margin: 1.2rem 0 0.8rem;
      font-weight: 600;
    }

    p {
      margin: 0.8rem 0;
      text-align: justify;
    }

    ul,
    ol {
      padding-left: 1.5rem;
      margin: 0.8rem 0;
    }

    li {
      margin: 0.4rem 0;
    }

    strong {
      color: $primary;
      font-weight: 600;
    }

    em {
      color: $text-primary;
    }

    pre {
      background-color: $bg-main;
      padding: 1rem;
      border-radius: $radius-sm;
      overflow-x: auto;
      margin: 1rem 0;
    }

    code {
      background-color: $primary-light;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      color: $primary;
      font-size: 0.9rem;
    }

    pre code {
      background: none;
      padding: 0;
    }
  }

  // 重置按钮
  .reset-btn {
    width: 100%;
    padding: 0.85rem 1rem;
    border: none;
    border-radius: $radius-md;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    background-color: $bg-main;
    color: $text-primary;
    border: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background-color: $primary-light;
      color: $primary;
      border-color: $primary-light;
      transform: translateY(-2px);
      box-shadow: $shadow-sm;
    }
  }
}

// 作物选择弹窗样式
.crop-select-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    transition: $transition;
  }

  .modal-content {
    position: relative;
    width: 90%;
    max-width: 500px;
    background-color: $bg-card;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid $border;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .modal-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: $text-primary;
        margin: 0;
      }

      .modal-close {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        color: $text-secondary;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: $transition;

        &:hover {
          color: $primary;
          background-color: $primary-light;
        }
      }
    }

    .modal-body {
      padding: 1.5rem;
      max-height: 60vh;
      overflow-y: auto;

      .crop-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        @media (max-width: 480px) {
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
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid $border;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;

      .modal-cancel {
        padding: 0.65rem 1.25rem;
        border-radius: $radius-sm;
        border: 1px solid $border;
        background-color: transparent;
        color: $text-secondary;
        font-size: 0.9rem;
        cursor: pointer;
        transition: $transition;

        &:hover {
          background-color: $bg-main;
          color: $text-primary;
        }
      }

      .modal-confirm {
        padding: 0.65rem 1.25rem;
        border-radius: $radius-sm;
        border: none;
        background-color: $primary;
        color: white;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: $transition;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          background-color: $primary-hover;
          box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
        }
      }
    }
  }
}

// 动画效果
@keyframes loading {
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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

@keyframes progressPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

// 通知提示样式
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 2000;
  max-width: 400px;
  animation: slideInRight 0.3s ease;

  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, $primary, $primary-hover);
    color: white;
    border-radius: $radius-md;
    box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
    animation: notificationPulse 2s ease-in-out infinite;

    .notification-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .notification-text {
      font-size: 0.9rem;
      line-height: 1.5;
      font-weight: 500;
    }
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes notificationPulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
  }

  50% {
    box-shadow: 0 4px 16px rgba(56, 142, 60, 0.5);
  }
}

// 响应式细节优化
@media (max-width: 768px) {
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
