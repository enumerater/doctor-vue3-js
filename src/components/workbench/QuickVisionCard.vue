<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVisionStore } from '@/stores/vision'
import { Camera, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const visionStore = useVisionStore()

const fileList = ref([])

const hasActiveTask = computed(() => visionStore.hasActiveTask)
const hasCompletedTask = computed(() => visionStore.hasCompletedTask)
const taskStatusText = computed(() => visionStore.taskStatusText)

function handleFileChange(uploadFile) {
  // Navigate to vision page when file is selected
  router.push({ name: 'vision' })
}

function goToVision() {
  router.push({ name: 'vision' })
}
</script>

<template>
  <el-card class="quick-vision-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon" :size="20">
          <Camera />
        </el-icon>
        <span class="header-title">图像诊断</span>
        <el-tag
          v-if="hasActiveTask"
          type="warning"
          size="small"
          effect="light"
        >
          {{ taskStatusText }}
        </el-tag>
        <el-tag
          v-else-if="hasCompletedTask"
          type="success"
          size="small"
          effect="light"
        >
          {{ taskStatusText }}
        </el-tag>
      </div>
    </template>

    <p class="card-desc">上传植物照片，AI 智能识别病虫害</p>

    <el-upload
      class="vision-upload"
      :file-list="fileList"
      :auto-upload="false"
      :show-file-list="false"
      accept="image/*"
      :on-change="handleFileChange"
    >
      <div class="upload-area" @click.stop>
        <el-icon class="upload-icon" :size="32">
          <Upload />
        </el-icon>
        <span class="upload-text">点击上传图片</span>
        <span class="upload-hint">支持 JPG、PNG 格式</span>
      </div>
    </el-upload>

    <el-button
      class="vision-btn"
      type="primary"
      plain
      @click="goToVision"
    >
      进入诊断页面
    </el-button>
  </el-card>
</template>

<style lang="scss" scoped>
.quick-vision-card {
  border: 1px solid $border;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  :deep(.el-card__header) {
    padding: 16px 20px 12px;
    border-bottom: 1px solid $border;
  }

  :deep(.el-card__body) {
    padding: 16px 20px 20px;
  }
}

.card-header {
  @include flex-between;

  .header-icon {
    color: $primary;
    margin-right: 8px;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
  }
}

.card-desc {
  font-size: 13px;
  color: $text-tertiary;
  margin: 0 0 14px;
}

.vision-upload {
  width: 100%;
  margin-bottom: 12px;
}

.upload-area {
  @include flex-center;
  flex-direction: column;
  width: 100%;
  padding: 24px 16px;
  border: 2px dashed $border;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: $primary;
    background: $primary-light;
  }
}

.upload-icon {
  color: $text-tertiary;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: $text-tertiary;
}

.vision-btn {
  width: 100%;
  border-color: $primary;
  color: $primary;

  &:hover,
  &:focus {
    background: $primary-light;
    border-color: $primary;
    color: $primary;
  }
}
</style>
