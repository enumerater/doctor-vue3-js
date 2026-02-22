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
  <div class="quick-vision-card">
    <div class="card-icon-area">
      <div class="icon-circle">
        <el-icon :size="24"><Camera /></el-icon>
      </div>
    </div>
    <div class="card-body">
      <div class="card-title-row">
        <h3 class="card-title">图像诊断</h3>
        <el-tag
          v-if="hasActiveTask"
          type="warning"
          size="small"
          effect="light"
          round
        >
          {{ taskStatusText }}
        </el-tag>
        <el-tag
          v-else-if="hasCompletedTask"
          type="success"
          size="small"
          effect="light"
          round
        >
          {{ taskStatusText }}
        </el-tag>
      </div>
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
          <el-icon class="upload-icon" :size="28">
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
        round
        @click="goToVision"
      >
        进入诊断页面
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-vision-card {
  background: #fff;
  border: 1px solid $border;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: 24px;
  display: flex;
  gap: 18px;
  transition: box-shadow 0.3s, transform 0.2s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #f59e0b, #f97316);
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &:hover {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.12);
  }

  @include mobile {
    padding: 18px 16px;
    gap: 14px;
  }
}

.card-icon-area {
  flex-shrink: 0;

  .icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(#f59e0b, 0.12), rgba(#f97316, 0.08));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;

    @include mobile {
      width: 42px;
      height: 42px;
      border-radius: 12px;
    }
  }
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
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
  padding: 20px 16px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbfc;

  &:hover {
    border-color: #f59e0b;
    background: rgba(#f59e0b, 0.04);
  }
}

.upload-icon {
  color: $text-tertiary;
  margin-bottom: 6px;
}

.upload-text {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 2px;
}

.upload-hint {
  font-size: 11px;
  color: $text-tertiary;
}

.vision-btn {
  width: 100%;
  border-color: $primary;
  color: $primary;
  border-radius: 10px;

  &:hover,
  &:focus {
    background: $primary-light;
    border-color: $primary;
    color: $primary;
  }
}
</style>
