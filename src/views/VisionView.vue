<template>
  <div class="disease-detection-container">
    <!-- Tab navigation -->
    <div class="vision-tabs">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'detect' }"
        @click="activeTab = 'detect'"
      >
        <el-icon :size="16"><Camera /></el-icon>
        拍照检测
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'history' }"
        @click="switchToHistory"
      >
        <el-icon :size="16"><Clock /></el-icon>
        检测记录
        <span v-if="diagnosisStore.totalCount > 0" class="tab-count">{{ diagnosisStore.totalCount }}</span>
      </div>
    </div>

    <!-- Detection tab -->
    <main class="main-content" v-show="activeTab === 'detect'">
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

          <!-- Crop Selection (Permanently Visible) -->
          <div class="crop-selection-section">
            <div class="selection-header">
              <h3 class="selection-title">选择作物类型</h3>
              <el-input
                v-model="cropSearchKeyword"
                placeholder="搜索作物..."
                :prefix-icon="Search"
                clearable
                class="crop-search-input"
              />
            </div>
            
            <div class="crop-list-container" v-loading="knowledgeStore.loading">
              <div v-if="filteredCrops.length > 0" class="crop-grid-new">
                <div 
                  v-for="crop in filteredCrops" 
                  :key="crop"
                  class="crop-item-new"
                  :class="{ active: selectedCrop === crop }"
                  @click="selectedCrop = crop"
                >
                  <span class="crop-name">{{ crop }}</span>
                </div>
              </div>
              <el-empty v-else :image-size="60" description="未找到匹配作物" />
            </div>
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
            @click="detectDisease"
            :disabled="!uploadedImage || !selectedCrop || isDetecting"
            :loading="isDetecting"
          >
            <span v-if="!isDetecting">开始识别</span>
            <span v-else>识别中</span>
          </el-button>
        </div>
      </section>

      <!-- Result display -->
      <section class="result-section" v-if="parsedResult">
        <div class="result-card">
          <h2 class="card-title">
            <el-icon :size="20"><Document /></el-icon>
            识别结果
          </h2>

          <!-- Result status banner -->
          <div class="result-banner" :class="resultBannerClass">
            <div class="banner-icon">
              <el-icon :size="36">
                <CircleCheck v-if="parsedResult.type === '健康作物'" />
                <Warning v-else-if="parsedResult.type === '不健康作物'" />
                <InfoFilled v-else />
              </el-icon>
            </div>
            <div class="banner-content">
              <div class="banner-type">{{ parsedResult.type }}</div>
              <div class="banner-crop" v-if="selectedCrop">{{ selectedCrop }}</div>
            </div>
          </div>

          <!-- Detail section for unhealthy crops -->
          <div v-if="parsedResult.type === '不健康作物' && parsedResult.detail" class="detail-block disease-detail">
            <div class="detail-header">
              <el-icon :size="18" color="#e6a23c"><Warning /></el-icon>
              <h3>病害信息</h3>
            </div>
            <div class="detail-body">
              <div class="disease-name">{{ diseaseName }}</div>
              <div class="disease-desc" v-if="diseaseDesc">{{ diseaseDesc }}</div>
            </div>
          </div>

          <!-- Healthy message -->
          <div v-if="parsedResult.type === '健康作物'" class="detail-block healthy-detail">
            <div class="detail-header">
              <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
              <h3>健康状态</h3>
            </div>
            <div class="detail-body">
              <p class="healthy-msg">该作物生长状态良好，未发现明显病害症状。建议继续保持当前管理方式，定期巡检。</p>
            </div>
          </div>

          <!-- Non-crop message -->
          <div v-if="parsedResult.type === '非作物'" class="detail-block noncrop-detail">
            <div class="detail-header">
              <el-icon :size="18" color="#909399"><InfoFilled /></el-icon>
              <h3>识别说明</h3>
            </div>
            <div class="detail-body">
              <p class="noncrop-msg">
                图片主体为<strong>{{ parsedResult.detail || '非作物内容' }}</strong>，非农作物图像，请上传农作物照片进行病害检测。
              </p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="result-actions">
            <el-button
              type="primary"
              size="large"
              class="agent-analyze-btn"
              v-if="parsedResult.type === '不健康作物'"
              @click="showAgentPopup = true"
            >
              <el-icon><Promotion /></el-icon>
              发送至Agent深入分析
            </el-button>

            <el-button
              type="success"
              size="large"
              class="bind-plot-btn"
              v-if="parsedResult"
              @click="showBindDialog = true"
            >
              <el-icon><Link /></el-icon>
              绑定到地块
            </el-button>

            <el-button size="large" class="reset-btn" @click="resetAll">重新检测</el-button>
          </div>
        </div>
      </section>
    </main>

    <!-- History tab -->
    <div class="history-content" v-show="activeTab === 'history'">
      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ diagnosisStore.totalCount }}</span>
          <span class="stat-label">总诊断</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value warn">{{ diagnosisStore.diseasedCount }}</span>
          <span class="stat-label">不健康</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value safe">{{ diagnosisStore.healthyCount }}</span>
          <span class="stat-label">健康</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        <el-select
          v-model="diagnosisStore.filters.cropType"
          placeholder="全部作物"
          clearable
          size="small"
          class="filter-select"
        >
          <el-option
            v-for="crop in diagnosisStore.cropTypes"
            :key="crop"
            :label="crop"
            :value="crop"
          />
        </el-select>

        <div class="filter-tabs">
          <span
            class="tab-filter"
            :class="{ active: diagnosisStore.filters.resultType === '' }"
            @click="diagnosisStore.setFilter('resultType', '')"
          >全部</span>
          <span
            class="tab-filter"
            :class="{ active: diagnosisStore.filters.resultType === '不健康作物' }"
            @click="diagnosisStore.setFilter('resultType', '不健康作物')"
          >不健康</span>
          <span
            class="tab-filter"
            :class="{ active: diagnosisStore.filters.resultType === '健康作物' }"
            @click="diagnosisStore.setFilter('resultType', '健康作物')"
          >健康</span>
        </div>
      </div>

      <!-- Record list -->
      <div class="diagnosis-list" v-if="diagnosisStore.filteredRecords.length > 0">
        <DiagnosisCard
          v-for="record in diagnosisStore.filteredRecords"
          :key="record.id"
          :record="record"
          @click="goDetail(record)"
        />
      </div>

      <!-- Loading -->
      <div v-else-if="diagnosisStore.loading" v-loading="true" class="loading-center"></div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <el-empty description="暂无诊断记录">
          <el-button type="primary" @click="activeTab = 'detect'">
            开始第一次诊断
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- Agent analysis popup -->
    <AgentTransferPopup v-model:visible="showAgentPopup" source="vision" :cropType="selectedCrop"
      :diseaseName="diseaseName" :severity="''"
      :confidence="0" :imageUrl="visionStore.currentTask?.imageUrl || ''"
      :thumbnailUrl="uploadedImage" :defaultPrompt="visionAgentPrompt" @confirm="handleAgentTransferConfirm" />

    <!-- 绑定地块弹窗 -->
    <el-dialog
      v-model="showBindDialog"
      title="绑定诊断到地块"
      width="400px"
      append-to-body
    >
      <div class="bind-dialog-content">
        <p class="dialog-tip">请选择要绑定此诊断记录的地块：</p>
        <el-select v-model="selectedPlotId" placeholder="选择地块" class="full-width">
          <el-option-group v-for="farm in farmStore.farms" :key="farm.id" :label="farm.name">
            <el-option
              v-for="plot in farm.plots"
              :key="plot.id"
              :label="plot.name"
              :value="plot.id"
            >
              <div class="plot-option">
                <span>{{ plot.name }}</span>
                <el-tag size="small" type="info" plain class="plot-tag">{{ plot.cropType }}</el-tag>
              </div>
            </el-option>
          </el-option-group>
        </el-select>
      </div>
      <template #footer>
        <el-button @click="showBindDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBind" :loading="diagnosisPlotStore.loading" :disabled="!selectedPlotId">
          确认绑定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { upload } from '@/axios/oss'
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVisionStore } from '@/stores/vision'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { useSidebarStore } from '@/stores/sidebar'
import { useFarmStore } from '@/stores/farm'
import { useKnowledgeStore } from '@/stores/knowledge'
import { usePlotDiagnosisStore } from '@/stores/plot_diagnosis'
import { ElMessage } from 'element-plus'
import {
  Upload, UploadFilled, Close, Loading, Document,
  InfoFilled, CircleCheck, Warning, Promotion, Camera, Clock, Link, Search
} from '@element-plus/icons-vue'
import AgentTransferPopup from '@/components/AgentTransferPopup.vue'
import DiagnosisCard from '@/components/diagnosis/DiagnosisCard.vue'

// Router instance
const router = useRouter()
const visionStore = useVisionStore()
const sidebarStore = useSidebarStore()
const diagnosisStore = useDiagnosisStore()
const farmStore = useFarmStore()
const knowledgeStore = useKnowledgeStore()
const diagnosisPlotStore = usePlotDiagnosisStore()

// Reactive data
const fileInput = ref(null)
const uploadedImage = ref('')
const isDragging = ref(false)
const isDetecting = ref(false)
const selectedCrop = ref('')
const selectedFile = ref(null)
const resultText = ref('') // raw JSON string from backend
const activeTab = ref('detect')
const cropSearchKeyword = ref('')

// Async task related
const detectingTaskId = ref(null)
const detectingStartTime = ref(null)
const detectingElapsedTime = ref(0)
const detectingTimer = ref(null)
const showAgentPopup = ref(false)
const showBindDialog = ref(false)
const selectedPlotId = ref('')

// Computed filtered crops
const filteredCrops = computed(() => {
  if (!knowledgeStore.allCrops) return []
  if (!cropSearchKeyword.value.trim()) return knowledgeStore.allCrops
  return knowledgeStore.allCrops.filter(crop =>
    crop.toLowerCase().includes(cropSearchKeyword.value.toLowerCase())
  )
})

// Parse result JSON: { type, detail }
const parsedResult = computed(() => {
  if (!resultText.value) return null
  try {
    const data = typeof resultText.value === 'string' ? JSON.parse(resultText.value) : resultText.value
    if (data && data.type) return data
    return null
  } catch {
    return null
  }
})

// Extract disease name and description from detail (format: "病害名称：判断依据")
const diseaseName = computed(() => {
  const detail = parsedResult.value?.detail
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx === -1) {
    const idx2 = detail.indexOf(':')
    return idx2 === -1 ? detail : detail.substring(0, idx2)
  }
  return detail.substring(0, idx)
})

const diseaseDesc = computed(() => {
  const detail = parsedResult.value?.detail
  if (!detail) return ''
  const idx = detail.indexOf('：')
  if (idx === -1) {
    const idx2 = detail.indexOf(':')
    return idx2 === -1 ? '' : detail.substring(idx2 + 1).trim()
  }
  return detail.substring(idx + 1).trim()
})

// Banner class based on result type
const resultBannerClass = computed(() => {
  if (!parsedResult.value) return ''
  switch (parsedResult.value.type) {
    case '健康作物': return 'banner-healthy'
    case '不健康作物': return 'banner-disease'
    case '非作物': return 'banner-noncrop'
    default: return ''
  }
})

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
      resultText.value = task.result
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

// Agent analysis default prompt
const visionAgentPrompt = computed(() => {
  const r = parsedResult.value
  if (r && r.type === '不健康作物' && r.detail) {
    return (
      `我在${selectedCrop.value || '作物'}上发现了${diseaseName.value}，` +
      `判断依据：${diseaseDesc.value || r.detail}。` +
      `请帮我进行深入分析，给出详细的防治方案和田间管理建议。`
    )
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

// Handle Bind confirm
const handleBind = async () => {
  if (!selectedPlotId.value) return
  
  // Find the last created diagnosis record ID in history
  // Note: when detectDisease completes, it calls saveDiagnosisRecord which adds to diagnosisStore.records
  const lastRecord = diagnosisStore.records[0]
  if (!lastRecord) {
    ElMessage.warning('未找到诊断记录')
    return
  }

  try {
    await diagnosisPlotStore.bindRecord({
      plotId: selectedPlotId.value,
      type: 'IMAGE',
      targetId: lastRecord.id,
      title: `${selectedCrop.value}病害识别`,
      content: `识别结果：${parsedResult.value?.type || '未知'} - ${diseaseName.value || ''}`
    })
    ElMessage.success('已绑定到地块')
    showBindDialog.value = false
  } catch (err) {
    ElMessage.error('绑定失败')
  }
}

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
    resultText.value = ''
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
  resultText.value = ''
  selectedCrop.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

import { imageChat } from '@/axios/chat'

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

// Save diagnosis record
const saveDiagnosisRecord = (rawResult) => {
  const task = visionStore.currentTask
  if (!task) return

  // Parse to extract type for record-level field
  let resultType = ''
  let detail = ''
  try {
    const parsed = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult
    resultType = parsed.type || ''
    detail = parsed.detail || ''
  } catch {
    // ignore parse error
  }

  diagnosisStore.createDiagnosis({
    imageUrl: task.imageUrl,
    cropType: task.cropType || selectedCrop.value,
    resultType,
    result: rawResult,
    status: 'completed',
    createdAt: new Date().toISOString(),
    elapsedTime: task.elapsedTime || 0,
  })
}

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

    // Store raw result (JSON string from backend)
    const raw = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data
    resultText.value = raw
    visionStore.completeTask(raw)
    saveDiagnosisRecord(raw)

    ElMessage.success('识别完成！结果已更新')

    // Auto-open Agent popup for diseased crops
    if (parsedResult.value && parsedResult.value.type === '不健康作物') {
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
  resultText.value = ''
  selectedCrop.value = ''
  selectedFile.value = null
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

// History tab related
const historyLoaded = ref(false)
const switchToHistory = async () => {
  activeTab.value = 'history'
  if (!historyLoaded.value) {
    await Promise.all([diagnosisStore.fetchRecords(), diagnosisStore.fetchStats()])
    historyLoaded.value = true
  }
}

const goDetail = (record) => {
  router.push({ name: 'diagnosisDetail', params: { diagnosisId: record.id } })
}

// Restore state on mount
onMounted(() => {
  restoreFromStore()
  farmStore.fetchFarms() // 获取农场列表用于绑定
  knowledgeStore.fetchAllCrops() // 获取所有作物名
})

// Cleanup on unmount
onBeforeUnmount(() => {
  stopTimer()
  visionStore.clearCurrentTask() // 离开页面时清除当前诊断任务
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

// Tab navigation
.vision-tabs {
  display: flex;
  gap: 4px;
  padding: 16px 24px 0;
  max-width: 1100px;
  margin: 0 auto;

  @include mobile {
    padding: 12px 16px 0;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: $radius-md $radius-md 0 0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: $text-secondary;
    background: transparent;
    border: 1px solid transparent;
    border-bottom: none;
    transition: $transition;
    position: relative;

    &:hover {
      color: $primary;
      background: rgba($primary, 0.04);
    }

    &.active {
      color: $primary;
      font-weight: 600;
      background: $bg-card;
      border-color: $border;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: $bg-card;
      }
    }

    .tab-count {
      background: $primary;
      color: #fff;
      font-size: 11px;
      padding: 0 6px;
      border-radius: 10px;
      font-weight: 600;
      line-height: 18px;
    }
  }
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
  // Result banner
  .result-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-radius: $radius-md;
    margin-bottom: 1.25rem;
    animation: fadeInUp 0.4s ease;

    .banner-icon {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      @include flex-center;
      font-size: 1.5rem;
    }

    .banner-content {
      flex: 1;
    }

    .banner-type {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .banner-crop {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    &.banner-healthy {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
      border: 1px solid rgba(103, 194, 58, 0.3);
      color: #529b2e;

      .banner-icon {
        background: rgba(103, 194, 58, 0.15);
        color: #67c23a;
      }
    }

    &.banner-disease {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
      border: 1px solid rgba(230, 162, 60, 0.3);
      color: #b88230;

      .banner-icon {
        background: rgba(230, 162, 60, 0.15);
        color: #e6a23c;
      }
    }

    &.banner-noncrop {
      background: linear-gradient(135deg, rgba(144, 147, 153, 0.1), rgba(144, 147, 153, 0.05));
      border: 1px solid rgba(144, 147, 153, 0.3);
      color: #73767a;

      .banner-icon {
        background: rgba(144, 147, 153, 0.15);
        color: #909399;
      }
    }
  }

  // Detail blocks
  .detail-block {
    background-color: $bg-main;
    border-radius: $radius-md;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    animation: fadeInUp 0.5s ease;

    @include mobile {
      padding: 1rem;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0.75rem;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: $text-primary;
        margin: 0;
      }
    }

    .detail-body {
      padding-left: 26px;

      @include mobile {
        padding-left: 0;
      }
    }

    &.disease-detail {
      border-left: 4px solid #e6a23c;

      .disease-name {
        font-size: 1.1rem;
        font-weight: 700;
        color: #b88230;
        margin-bottom: 0.5rem;
      }

      .disease-desc {
        font-size: 0.95rem;
        color: $text-secondary;
        line-height: 1.6;
      }
    }

    &.healthy-detail {
      border-left: 4px solid #67c23a;

      .healthy-msg {
        font-size: 0.95rem;
        color: $text-secondary;
        line-height: 1.6;
        margin: 0;
      }
    }

    &.noncrop-detail {
      border-left: 4px solid #909399;

      .noncrop-msg {
        font-size: 0.95rem;
        color: $text-secondary;
        line-height: 1.6;
        margin: 0;

        strong {
          color: $text-primary;
        }
      }
    }
  }

  // Action container
  .result-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  // Agent analyze button
  .agent-analyze-btn {
    width: 100%;
    font-weight: 600;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    border-radius: $radius-md;
    margin: 0;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(56, 142, 60, 0.3);
    }
  }

  // Bind plot button
  .bind-plot-btn {
    width: 100%;
    font-weight: 600;
    letter-spacing: 0.3px;
    margin: 0;
    border-radius: $radius-md;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($success, 0.3);
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
    margin: 0;

    &:hover {
      background-color: $primary-light;
      color: $primary;
      border-color: $primary-light;
      transform: translateY(-2px);
      box-shadow: $shadow-sm;
    }
  }
}

// Crop selection section
.crop-selection-section {
  margin-bottom: 1.75rem;
  background: #fcfcfc;
  border: 1px solid $border;
  border-radius: $radius-md;
  padding: 1rem;

  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .selection-title {
      font-size: 1rem;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
      white-space: nowrap;
    }

    .crop-search-input {
      width: 200px;
      @include mobile {
        width: 100%;
      }
    }
  }

  .crop-list-container {
    max-height: 240px;
    overflow-y: auto;
    padding: 2px;
    
    // Custom scrollbar
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba($primary, 0.2);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .crop-grid-new {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }

  .crop-item-new {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid $border;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;

    &:hover {
      border-color: $primary-light;
      background: rgba($primary, 0.05);
      transform: translateY(-1px);
    }

    &.active {
      border-color: $primary;
      background: $primary-light;
      color: $primary;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba($primary, 0.1);
    }

    .crop-name {
      font-size: 0.85rem;
      @include text-ellipsis;
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

  .result-banner {
    padding: 1rem !important;

    .banner-icon {
      width: 44px !important;
      height: 44px !important;
    }

    .banner-type {
      font-size: 1.05rem !important;
    }
  }
}

// History tab styles
.history-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 1.25rem 2rem;

  @include mobile {
    padding: 0.75rem 1rem 1.5rem;
  }
}

.stats-bar {
  display: flex;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px 0;
  margin-bottom: 16px;

  @include mobile {
    padding: 12px 0;
  }
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: $primary;

  @include mobile {
    font-size: 18px;
  }

  &.warn {
    color: #e6a23c;
  }

  &.safe {
    color: #67c23a;
  }
}

.stat-label {
  display: block;
  font-size: 12px;
  color: $text-tertiary;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: $border;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  width: 120px;

  @include mobile {
    width: 100px;
  }
}

.filter-tabs {
  display: flex;
  gap: 4px;
  margin-left: auto;
  background: $bg-main;
  border-radius: 6px;
  padding: 2px;
  border: 1px solid $border;

  @include mobile {
    margin-left: 0;
  }

  .tab-filter {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: $transition-fast;
    color: $text-secondary;

    &.active {
      background: $primary;
      color: #fff;
      font-weight: 500;
    }

    &:hover:not(.active) {
      color: $primary;
    }
  }
}

.diagnosis-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}

.empty-state {
  padding: 40px 0;
}

.bind-dialog-content {
  padding: 10px 0;
  .dialog-tip {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 16px;
  }
  .full-width {
    width: 100%;
  }
}

.plot-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .plot-tag {
    font-size: 10px;
    height: 20px;
    padding: 0 6px;
    opacity: 0.8;
  }
}
</style>
